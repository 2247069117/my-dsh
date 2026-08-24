/**
 * dsh-workspace-tree — node half (v3.1 修复版)。
 *
 * 核心功能：
 *  - GET  /debug               工作区注册表投影（诊断用）
 *  - POST /mkdir               安全创建子目录 { parent, name } → { path }
 *  - POST /archive/unarchive   恢复单条会话 { sessionId }
 *  - POST /archive/unarchiveAll 批量恢复 { workspaceId? } (null=未分组, omit=全部)
 *  - POST /archive/delete      永久删除单条会话及其实体文件 { sessionId }
 *  - POST /archive/deleteAll   永久删除批量会话及其实体文件 { workspaceId? }
 */
import { mkdir, readdir, rm, stat } from "node:fs/promises";
import { isAbsolute, join, resolve } from "node:path";
import { homedir } from "node:os";

/** Cordis 插件名（patch 行 id）。 */
const name = "@lynn123411/dsh-workspace-tree";
/** 依赖的服务。 */
const inject = ["webServer", "storageDomain"];

/** Host 路由前缀（避开 /plugins/ 的 client bundle 保留空间）。 */
const PREFIX = "/api/dsh-workspace-tree";

/** DSH 配置根目录。 */
function dshHome() {
  return process.env.DSH_HOME || join(homedir(), ".dsh");
}

function sendJson(res, status, body) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-cache"
  });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolveBody, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1024 * 1024) {
        req.destroy();
        reject(new Error("request body too large"));
      }
    });
    req.on("end", () => resolveBody(data.trim()));
    req.on("error", reject);
  });
}

async function parseJsonBody(req) {
  const text = await readBody(req);
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("请求体 JSON 格式无效");
  }
}

/** DSH 标准安全路径编码（与 @deepseek-ai/dsh-session-persistence-jsonl 保持完全一致）。 */
function encodeSegment(raw) {
  if (!raw || typeof raw !== "string") return "";
  if (raw === ".") return "~002E";
  if (raw === "..") return "~002E~002E";
  let out = "";
  for (let i = 0; i < raw.length; i++) {
    const code = raw.charCodeAt(i);
    const ch = String.fromCharCode(code);
    if (ch !== "~" && /^[A-Za-z0-9._-]$/.test(ch)) out += ch;
    else out += "~" + code.toString(16).toUpperCase().padStart(4, "0");
  }
  return out;
}

/** 调试：输出工作区注册表（path/title/id），用于诊断文件系统树。 */
async function handleDebug(ctx, req, res) {
  const registry = ctx.get("workspaceRegistry");
  if (!registry || typeof registry.list !== "function") {
    return sendJson(res, 200, { ok: false, error: "workspaceRegistry 不可用" });
  }
  const records = registry.list();
  const domain = getWorkspaceDomain(ctx);
  const archived = domain ? (domain.global.get().archivedSessionIds || []) : (registry.archivedSessionIds || []);
  sendJson(res, 200, {
    ok: true,
    archivedSessionIds: (archived || []).map(String),
    archivedCount: (archived || []).length,
    workspaces: records.map((r) => ({
      workspaceId: String(r.id),
      title: r.title,
      path: r.path,
      sessionCount: Array.isArray(r.sessionIds) ? r.sessionIds.length : 0,
      sessionIds: (r.sessionIds || []).map(String),
      archivedIds: (r.sessionIds || []).filter((id) => (archived || []).map(String).includes(String(id)))
    }))
  });
}

/** 新建子目录：增强安全校验的真实 fs.mkdir。 */
async function handleMkdir(req, res) {
  const raw = await parseJsonBody(req);
  const parentRaw = typeof raw.parent === "string" ? raw.parent.trim() : "";
  const nameRaw = typeof raw.name === "string" ? raw.name.trim() : "";
  if (!parentRaw || !nameRaw) return sendJson(res, 200, { ok: false, error: "parent 与 name 必填" });
  
  if (nameRaw === "." || nameRaw === ".." || /[\\\\/:*?"<>|\x00-\x1F]/.test(nameRaw)) {
    return sendJson(res, 200, { ok: false, error: "文件夹名包含非法字符或路径遍历片段" });
  }

  const parent = resolve(parentRaw);
  if (!isAbsolute(parent)) {
    return sendJson(res, 200, { ok: false, error: "parent 必须为绝对路径" });
  }

  try {
    const parentStat = await stat(parent);
    if (!parentStat.isDirectory()) {
      return sendJson(res, 200, { ok: false, error: "parent 不是有效目录" });
    }
  } catch (err) {
    return sendJson(res, 200, { ok: false, error: `parent 目录不存在: ${String(err.message || err)}` });
  }

  const target = resolve(parent, nameRaw);
  // 确保 target 确实位于 parent 内部，防路径逃逸
  if (!target.startsWith(parent) || target === parent) {
    return sendJson(res, 200, { ok: false, error: "目标路径非法" });
  }

  await mkdir(target, { recursive: true });
  sendJson(res, 200, { ok: true, path: target });
}

// ───── 归档域 helpers ─────
function getWorkspaceDomain(ctx) {
  try {
    const d = ctx.storageDomain.get("workspace");
    if (d) return d;
  } catch {}
  return null;
}

/**
 * 封装工作区状态事务：
 * 优先在 workspaceRegistry.enqueueOperation 队列中执行，并同步刷新内存缓存与实体；
 * 避免直接裸改 storageDomain 导致官方内存权威状态未更新而被后续操作回滚。
 */
async function mutateWorkspaceState(ctx, mutator) {
  const domain = getWorkspaceDomain(ctx);
  if (!domain) throw new Error("workspace domain 未就绪");
  const registry = ctx.get("workspaceRegistry");

  if (registry && typeof registry.enqueueOperation === "function") {
    return await registry.enqueueOperation(async () => {
      const g = registry.global || domain.global;
      const table = registry.table || domain.table("workspaces");
      const currentState = typeof registry.requireState === "function" ? registry.requireState() : g.get();
      const result = await mutator(currentState, table, g);
      if (registry.state) registry.state = g.get();
      if (typeof registry.rebuildEntities === "function") registry.rebuildEntities();
      return result;
    });
  } else {
    const g = domain.global;
    const table = domain.table("workspaces");
    const currentState = g.get();
    return await mutator(currentState, table, g);
  }
}

/** 精确、安全的物理会话文件删除。 */
async function deleteSessionFiles(ctx, sessionId) {
  if (!sessionId || typeof sessionId !== "string") return;
  const sid = sessionId.trim();
  const encodedId = encodeSegment(sid);
  if (!encodedId) return;

  const sessionsRoot = join(dshHome(), "sessions");
  try {
    const scopes = await readdir(sessionsRoot, { withFileTypes: true });
    for (const scope of scopes) {
      if (!scope.isDirectory()) continue;
      const projectPath = join(sessionsRoot, scope.name);
      // 精确匹配：projectDir/encodeSegment(sid)
      const targetSessionDir = join(projectPath, encodedId);
      try {
        const targetStat = await stat(targetSessionDir);
        if (targetStat.isDirectory()) {
          await rm(targetSessionDir, { recursive: true, force: true });
        }
      } catch {
        // 不存在或无权限时跳过
      }
    }
  } catch {}

  // 联动清理内存中的活跃会话
  try {
    const sessions = ctx.get("sessions");
    if (sessions && typeof sessions.delete === "function") {
      sessions.delete(sid);
    }
  } catch {}
}

// 从 archivedSet 计算待操作集合
function archivedForWorkspace(archivedIds, workspaceRecord) {
  const set = new Set(archivedIds);
  return (workspaceRecord.sessionIds || []).filter((id) => set.has(String(id)));
}

function ungroupedArchived(archivedIds, table) {
  const accounted = new Set();
  for (const [, rec] of table.entries()) {
    for (const sid of rec.sessionIds || []) accounted.add(String(sid));
  }
  return archivedIds.filter((id) => !accounted.has(String(id)));
}

async function handleUnarchive(ctx, req, res) {
  const raw = await parseJsonBody(req);
  const sessionId = typeof raw.sessionId === "string" ? raw.sessionId.trim() : "";
  if (!sessionId) return sendJson(res, 200, { ok: false, error: "sessionId 必填" });

  await mutateWorkspaceState(ctx, async (state, table, g) => {
    const archived = (state.archivedSessionIds || []).map(String);
    if (!archived.includes(sessionId)) return;
    const nextArchived = archived.filter((id) => id !== sessionId);
    const next = { ...state, archivedSessionIds: nextArchived };
    await g.set(next);
  });

  sendJson(res, 200, { ok: true });
}

async function handleUnarchiveAll(ctx, req, res) {
  const raw = await parseJsonBody(req);
  const workspaceId = raw.workspaceId === undefined ? undefined : raw.workspaceId;

  let restored = [];
  await mutateWorkspaceState(ctx, async (state, table, g) => {
    const archived = (state.archivedSessionIds || []).map(String);
    let toRemove;
    if (workspaceId === undefined) {
      toRemove = new Set(archived);
    } else if (workspaceId === null) {
      toRemove = new Set(ungroupedArchived(archived, table));
    } else {
      const rec = table.get(String(workspaceId));
      if (!rec) throw new Error("workspace 不存在: " + workspaceId);
      toRemove = new Set(archivedForWorkspace(archived, rec));
    }
    if (toRemove.size === 0) return;
    restored = [...toRemove];
    const next = { ...state, archivedSessionIds: archived.filter((id) => !toRemove.has(id)) };
    await g.set(next);
  });

  sendJson(res, 200, { ok: true, restored });
}

async function handleDelete(ctx, req, res) {
  const raw = await parseJsonBody(req);
  const sessionId = typeof raw.sessionId === "string" ? raw.sessionId.trim() : "";
  if (!sessionId) return sendJson(res, 200, { ok: false, error: "sessionId 必填" });

  await mutateWorkspaceState(ctx, async (state, table, g) => {
    // 从所有工作区 sessionIds 移除
    for (const [wid, rec] of table.entries()) {
      if ((rec.sessionIds || []).map(String).includes(sessionId)) {
        const nextIds = rec.sessionIds.filter((id) => String(id) !== sessionId);
        if (nextIds.length !== rec.sessionIds.length) {
          await table.update(wid, (cur) => ({
            ...cur,
            sessionIds: cur.sessionIds.filter((id) => String(id) !== sessionId),
            updatedAt: new Date().toISOString()
          }));
        }
      }
    }
    // 从归档移除
    const archived = (state.archivedSessionIds || []).map(String);
    if (archived.includes(sessionId)) {
      const next = { ...state, archivedSessionIds: archived.filter((id) => id !== sessionId) };
      try { await g.set(next); } catch {}
    }
  });

  // 物理删除磁盘文件
  await deleteSessionFiles(ctx, sessionId);
  sendJson(res, 200, { ok: true });
}

async function handleDeleteAll(ctx, req, res) {
  const raw = await parseJsonBody(req);
  const workspaceId = raw.workspaceId === undefined ? undefined : raw.workspaceId;

  let toRemove = new Set();
  await mutateWorkspaceState(ctx, async (state, table, g) => {
    const archived = (state.archivedSessionIds || []).map(String);
    if (workspaceId === undefined) {
      toRemove = new Set(archived);
    } else if (workspaceId === null) {
      toRemove = new Set(ungroupedArchived(archived, table));
    } else {
      const rec = table.get(String(workspaceId));
      if (!rec) throw new Error("workspace 不存在: " + workspaceId);
      toRemove = new Set(archivedForWorkspace(archived, rec));
    }
    if (toRemove.size === 0) return;

    // 清理各工作区
    for (const [wid, rec] of table.entries()) {
      const filtered = (rec.sessionIds || []).filter((id) => !toRemove.has(String(id)));
      if (filtered.length !== (rec.sessionIds || []).length) {
        await table.update(wid, (cur) => ({
          ...cur,
          sessionIds: filtered,
          updatedAt: new Date().toISOString()
        }));
      }
    }
    const next = { ...state, archivedSessionIds: archived.filter((id) => !toRemove.has(id)) };
    await g.set(next);
  });

  for (const sid of toRemove) {
    await deleteSessionFiles(ctx, String(sid));
  }
  sendJson(res, 200, { ok: true, deleted: [...toRemove] });
}

function apply(ctx) {
  ctx.effect(() => ctx.webServer.register({
    kind: "prefix",
    path: PREFIX,
    handler: async (req, res) => {
      const url = new URL(req.url || "/", "http://x");
      const rest = url.pathname.split("/").filter(Boolean).slice(2);
      const head = rest[0];
      try {
        if (head === "debug" && (req.method === "GET" || req.method === "HEAD")) return await handleDebug(ctx, req, res);
        if (head === "mkdir" && req.method === "POST") return await handleMkdir(req, res);
        if (head === "archive" && req.method === "POST") {
          const sub = rest[1];
          if (sub === "unarchive") return await handleUnarchive(ctx, req, res);
          if (sub === "unarchiveAll") return await handleUnarchiveAll(ctx, req, res);
          if (sub === "delete") return await handleDelete(ctx, req, res);
          if (sub === "deleteAll") return await handleDeleteAll(ctx, req, res);
        }
        sendJson(res, 404, { ok: false, error: "not found" });
      } catch (error) {
        sendJson(res, 400, { ok: false, error: String((error && error.message) || error) });
      }
    }
  }), "dsh-workspace-tree: routes");
}

export { apply, inject, name };
