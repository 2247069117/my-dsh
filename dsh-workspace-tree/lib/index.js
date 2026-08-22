/**
 * dsh-workspace-tree — node half (v3)。
 *
 * v3 设计（grill 收敛）：工作区 = 目录强绑定，树结构完全由文件系统推导，
 * 不再有自定义逻辑文件夹（旧 folders/assignments 模型废弃，避免
 * 「UI 隔离 ≠ cwd 隔离」的环境污染问题）。
 *
 * 路由：
 *  - GET  /debug   工作区注册表投影（诊断用）
 *  - POST /mkdir   真实创建子目录 { parent, name } → { path }
 *                  （浏览器半区新建文件夹走这里，绕开官方 browse 能力——
 *                  官方 directoryFlow hole 被替换后 browse 装配不可用）
 *  - POST /archive/unarchive   恢复单条 { sessionId }
 *  - POST /archive/unarchiveAll 恢复批量 { workspaceId? }  (null=未分组,  omit=全部)
 *  - POST /archive/delete      永久删除单条 { sessionId }
 *  - POST /archive/deleteAll   永久删除批量 { workspaceId? }
 */
import { mkdir, readdir, rm, stat } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";

/** Cordis 插件名（patch 行 id）。 */
const name = "dsh-workspace-tree";
/** 依赖的服务。 */
const inject = ["webServer", "storageDomain"];

/** Host 路由前缀（避开 /plugins/ 的 client bundle 保留空间）。 */
const PREFIX = "/api/dsh-workspace-tree";

/** DSH 配置根目录（仅用于 README 说明；v3 无持久化）。 */
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
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1024 * 1024) {
        req.destroy();
        reject(new Error("request body too large"));
      }
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

/** 调试：输出工作区注册表（path/title/id），用于诊断文件系统树。 */
async function handleDebug(ctx, req, res) {
  const registry = ctx.get("workspaceRegistry");
  if (!registry || typeof registry.list !== "function") {
    return sendJson(res, 200, { ok: false, error: "workspaceRegistry 不可用" });
  }
  const records = registry.list();
  const domain = getWorkspaceDomain(ctx);
  const archived = domain ? domain.global.get().archivedSessionIds : (registry.archivedSessionIds || []);
  sendJson(res, 200, {
    ok: true,
    archivedSessionIds: archived.map(String),
    archivedCount: archived.length,
    workspaces: records.map((r) => ({
      workspaceId: String(r.id),
      title: r.title,
      path: r.path,
      sessionCount: Array.isArray(r.sessionIds) ? r.sessionIds.length : 0,
      sessionIds: r.sessionIds.map(String),
      archivedIds: r.sessionIds.filter((id) => archived.map(String).includes(String(id)))
    }))
  });
}

/** 新建子目录：真实 fs.mkdir（不依赖官方 browse 能力）。 */
async function handleMkdir(req, res) {
  const raw = JSON.parse(await readBody(req));
  const parent = typeof raw.parent === "string" ? raw.parent.trim() : "";
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  if (!parent || !name) return sendJson(res, 200, { ok: false, error: "parent 与 name 必填" });
  if (/[\\/:*?"<>|]/.test(name)) return sendJson(res, 200, { ok: false, error: "文件夹名包含非法字符" });
  const target = join(parent, name);
  await mkdir(target);
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

async function deleteSessionFiles(sessionId) {
  const sessionsRoot = join(dshHome(), "sessions");
  try {
    const scopes = await readdir(sessionsRoot, { withFileTypes: true });
    for (const scope of scopes) {
      if (!scope.isDirectory()) continue;
      const scopePath = join(sessionsRoot, scope.name);
      // 直接匹配 session-<id>
      const direct = join(scopePath, `session-${sessionId}`);
      try { await rm(direct, { recursive: true, force: true }); } catch {}
      // 兜底：扫描 scope 下所有目录，凡含该 id 的都删（兼容不同命名）
      try {
        const entries = await readdir(scopePath, { withFileTypes: true });
        for (const e of entries) {
          if (e.isDirectory() && e.name.includes(sessionId)) {
            try { await rm(join(scopePath, e.name), { recursive: true, force: true }); } catch {}
          }
        }
      } catch {}
    }
  } catch {}
}

// 从 archivedSet 计算待操作集合
function archivedForWorkspace(archivedIds, workspaceRecord) {
  const set = new Set(archivedIds);
  return (workspaceRecord.sessionIds || []).filter((id) => set.has(id));
}
function ungroupedArchived(archivedIds, table) {
  const accounted = new Set();
  for (const [, rec] of table.entries()) {
    for (const sid of rec.sessionIds || []) accounted.add(String(sid));
  }
  return archivedIds.filter((id) => !accounted.has(String(id)));
}

async function handleUnarchive(ctx, req, res) {
  const { sessionId } = JSON.parse(await readBody(req));
  if (typeof sessionId !== "string" || !sessionId.trim()) return sendJson(res, 200, { ok: false, error: "sessionId 必填" });
  const sid = sessionId.trim();
  const domain = getWorkspaceDomain(ctx);
  if (!domain) return sendJson(res, 200, { ok: false, error: "workspace domain 未就绪" });
  const g = domain.global;
  const state = g.get();
  if (!state.archivedSessionIds.includes(sid)) return sendJson(res, 200, { ok: true });
  const next = { ...state, archivedSessionIds: state.archivedSessionIds.filter((id) => String(id) !== sid) };
  await g.set(next);
  sendJson(res, 200, { ok: true });
}

async function handleUnarchiveAll(ctx, req, res) {
  const raw = JSON.parse(await readBody(req) || "{}");
  const workspaceId = raw.workspaceId === undefined ? undefined : raw.workspaceId;
  const domain = getWorkspaceDomain(ctx);
  if (!domain) return sendJson(res, 200, { ok: false, error: "workspace domain 未就绪" });
  const g = domain.global;
  const state = g.get();
  const table = domain.table("workspaces");
  let toRemove;
  if (workspaceId === undefined) {
    toRemove = new Set(state.archivedSessionIds.map(String));
  } else if (workspaceId === null) {
    toRemove = new Set(ungroupedArchived(state.archivedSessionIds.map(String), table).map(String));
  } else {
    const rec = table.get(String(workspaceId));
    if (!rec) return sendJson(res, 200, { ok: false, error: "workspace 不存在: " + workspaceId });
    toRemove = new Set(archivedForWorkspace(state.archivedSessionIds.map(String), rec).map(String));
  }
  if (toRemove.size === 0) return sendJson(res, 200, { ok: true });
  const next = { ...state, archivedSessionIds: state.archivedSessionIds.filter((id) => !toRemove.has(String(id))) };
  await g.set(next);
  sendJson(res, 200, { ok: true, restored: [...toRemove] });
}

async function handleDelete(ctx, req, res) {
  const { sessionId } = JSON.parse(await readBody(req));
  if (typeof sessionId !== "string" || !sessionId.trim()) return sendJson(res, 200, { ok: false, error: "sessionId 必填" });
  const sid = sessionId.trim();
  const domain = getWorkspaceDomain(ctx);
  if (!domain) return sendJson(res, 200, { ok: false, error: "workspace domain 未就绪" });
  const g = domain.global;
  const state = g.get();
  const table = domain.table("workspaces");
  // 从所有工作区 sessionIds 移除
  for (const [wid, rec] of table.entries()) {
    if ((rec.sessionIds || []).map(String).includes(sid)) {
      const nextIds = rec.sessionIds.filter((id) => String(id) !== sid);
      if (nextIds.length !== rec.sessionIds.length) {
        await table.update(wid, (cur) => ({ ...cur, sessionIds: cur.sessionIds.filter((id) => String(id) !== sid), updatedAt: new Date().toISOString() }));
      }
    }
  }
  // 从归档移除
  if (state.archivedSessionIds.map(String).includes(sid)) {
    const next = { ...state, archivedSessionIds: state.archivedSessionIds.filter((id) => String(id) !== sid) };
    try { await g.set(next); } catch {}
  }
  await deleteSessionFiles(sid);
  sendJson(res, 200, { ok: true });
}

async function handleDeleteAll(ctx, req, res) {
  const raw = JSON.parse(await readBody(req) || "{}");
  const workspaceId = raw.workspaceId === undefined ? undefined : raw.workspaceId;
  const domain = getWorkspaceDomain(ctx);
  if (!domain) return sendJson(res, 200, { ok: false, error: "workspace domain 未就绪" });
  const g = domain.global;
  const state = g.get();
  const table = domain.table("workspaces");
  let toRemove;
  if (workspaceId === undefined) {
    toRemove = new Set(state.archivedSessionIds.map(String));
  } else if (workspaceId === null) {
    toRemove = new Set(ungroupedArchived(state.archivedSessionIds.map(String), table).map(String));
  } else {
    const rec = table.get(String(workspaceId));
    if (!rec) return sendJson(res, 200, { ok: false, error: "workspace 不存在: " + workspaceId });
    toRemove = new Set(archivedForWorkspace(state.archivedSessionIds.map(String), rec).map(String));
  }
  if (toRemove.size === 0) return sendJson(res, 200, { ok: true });
  // 清理各工作区
  for (const [wid, rec] of table.entries()) {
    const filtered = (rec.sessionIds || []).filter((id) => !toRemove.has(String(id)));
    if (filtered.length !== rec.sessionIds.length) {
      await table.update(wid, (cur) => ({ ...cur, sessionIds: filtered, updatedAt: new Date().toISOString() }));
    }
  }
  const next = { ...state, archivedSessionIds: state.archivedSessionIds.filter((id) => !toRemove.has(String(id))) };
  await g.set(next);
  for (const sid of toRemove) await deleteSessionFiles(String(sid));
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
