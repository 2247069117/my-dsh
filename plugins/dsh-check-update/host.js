// dsh-check-update —— Host 面（npm 版更新检查）
//
// 通过 HTTP 路由暴露检查接口给浏览器端设置页（仅接受 POST，防跨站触发）：
//   POST /dsh-check/check —— 检查 @deepseek-ai/dsh 是否有新版（10 分钟缓存）
// timer 每 6 小时自动检查并刷新缓存。
// 与 dsh-updater-ui 不同：本插件适配 npm 全局安装（npm install -g），
// 不做 git pull；有新版时提示用户执行 npm install -g @deepseek-ai/dsh@latest。
// 仅依赖 node 内置模块、纯 ESM：不依赖部署的 node_modules 解析。
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
export const name = 'dsh-check-update'
export const inject = ['shell', 'timer', 'webServer']

const GLOBAL_PKG = process.env.HOME + '/.npm-global/lib/node_modules/@deepseek-ai/dsh/package.json'
const PROFILE_PKG = process.env.HOME + '/.dsh/profiles/web/package.json'
const PROFILE_DIR = process.env.HOME + '/.dsh/profiles/web'
const REGISTRY_URL = 'https://registry.npmjs.org/@deepseek-ai/dsh/latest'
// npm cache 目录可能有 root 权限残留（已知 npm bug），更新命令统一用独立缓存
const NPM_CACHE = '/tmp/dsh-update-npm-cache'
const CACHE_MS = 10 * 60 * 1000
const AUTO_INTERVAL_MS = 6 * 60 * 60 * 1000
// 更新备份：~/.dsh/storages 是 DSH 惯例的持久化目录，保留最近 5 次
const BACKUP_DIR = process.env.HOME + '/.dsh/storages'
const BACKUP_FILE = BACKUP_DIR + '/dsh-check-update-backups.json'
const BACKUP_MAX = 5
// 更新说明（GitHub releases）缓存 6 小时：无 token 限流 60/h，只对有更新项请求
const RELEASE_CACHE_MS = 6 * 60 * 60 * 1000

export function apply(ctx) {
  let cached = null
  let checking = false

  const run = async (command, timeoutMs) => {
    const spec = ctx.shell.resolve({
      command,
      timeoutMs: timeoutMs || 30000,
      stdoutMaxBytes: 131072,
    })
    return ctx.shell.run(spec)
  }

  const readLocalVersion = async () => {
    // 优先直接读全局包 package.json（快、不依赖 PATH）
    const res = await run(`node -p "require('${GLOBAL_PKG}').version"`)
    if (res.exitCode === 0) {
      const v = (res.stdout && res.stdout.text || '').trim()
      if (v) return v
    }
    // 兜底：dsh --version
    const fallback = await run('dsh --version')
    return fallback.exitCode === 0 ? (fallback.stdout && fallback.stdout.text || '').trim() : null
  }

  const readLatestVersion = async (pkgName) => {
    // scoped 包名需 URL 编码斜杠：@liustack/modlens → @liustack%2Fmodlens
    const encoded = pkgName.startsWith('@') ? pkgName.replace('/', '%2F') : pkgName
    const res = await run(`curl -fsSL --max-time 15 https://registry.npmjs.org/${encoded}/latest`)
    if (res.exitCode !== 0) return null
    try {
      const data = JSON.parse(res.stdout.text)
      return data.version || null
    } catch (error) {
      return null
    }
  }

  // 拿最新版本 + repository（/latest 端点 manifest 自带 repository 字段，
  // 更新说明要用的 GitHub repo 路径从这里解析，不用额外请求）
  const readPkgMeta = async (pkgName) => {
    const encoded = pkgName.startsWith('@') ? pkgName.replace('/', '%2F') : pkgName
    const res = await run(`curl -fsSL --max-time 15 https://registry.npmjs.org/${encoded}/latest`)
    if (res.exitCode !== 0) return { version: null, repository: null }
    try {
      const data = JSON.parse(res.stdout.text)
      let repo = null
      const r = data.repository
      if (r) {
        const url = (typeof r === 'string' ? r : r.url) || ''
        // 支持 https://github.com/owner/repo.git、git+https://...、owner/repo 三种形态
        const m = url.match(/github\.com[:/]([^/]+\/[^/.]+)/) || url.match(/^([^/]+\/[^/]+)$/)
        if (m) repo = m[1]
      }
      return { version: data.version || null, repository: repo }
    } catch (error) {
      return { version: null, repository: null }
    }
  }

  // 更新说明：GitHub releases API（无 token 限流 60/h，带 6h 缓存）
  // 先按版本号精确找 tag；找不到就退回最新一条 release；失败静默返回 null
  const releaseCache = new Map()
  const readReleaseNotes = async (ownerRepo, version) => {
    if (!ownerRepo) return null
    const key = ownerRepo
    const hit = releaseCache.get(key)
    if (hit && Date.now() - hit.at < RELEASE_CACHE_MS) return hit.notes
    const res = await run(`curl -fsSL --max-time 15 "https://api.github.com/repos/${ownerRepo}/releases?per_page=10"`)
    let notes = null
    if (res.exitCode === 0) {
      try {
        const list = JSON.parse(res.stdout.text)
        if (Array.isArray(list)) {
          const exact = list.find((rel) => rel.tag_name && (rel.tag_name === version || rel.tag_name === 'v' + version || rel.tag_name.endsWith(version)))
          const rel = exact || list.find((r) => r.body) || list[0]
          if (rel && rel.body) {
            notes = {
              tag: rel.tag_name || version,
              name: rel.name || rel.tag_name || '',
              body: rel.body.slice(0, 800),
            }
          }
        }
      } catch (error) { /* 解析失败静默 */ }
    }
    releaseCache.set(key, { at: Date.now(), notes })
    return notes
  }

  const readInstalledPlugins = async () => {
    // 读 profile dependencies，跳过 file:/link: 等非 registry 依赖（含插件自身）
    const res = await run(`node -p "JSON.stringify(require('${PROFILE_PKG}').dependencies || {})"`)
    if (res.exitCode !== 0) return []
    let deps = {}
    try {
      deps = JSON.parse(res.stdout.text)
    } catch (error) {
      return []
    }
    const plugins = []
    for (const name of Object.keys(deps)) {
      const spec = deps[name]
      if (typeof spec === 'string' && /^(file:|link:|workspace:|github:|git\+)/.test(spec)) continue
      if (name === 'dsh-check-update') continue
      // 本地版本：node_modules/<name>/package.json
      const localRes = await run(`node -p "require('${process.env.HOME}/.dsh/profiles/web/node_modules/${name}/package.json').version"`)
      const local = localRes.exitCode === 0 ? (localRes.stdout && localRes.stdout.text || '').trim() : null
      const meta = await readPkgMeta(name)
      plugins.push({
        name,
        localVersion: local,
        latestVersion: meta.version,
        repository: meta.repository,
        hasUpdate: !!(local && meta.version && local !== meta.version),
      })
    }
    return plugins
  }

  const runFullCheck = async () => {
    const local = await readLocalVersion()
    const latest = await readLatestVersion('@deepseek-ai/dsh')
    const plugins = await readInstalledPlugins()
    const hasDshUpdate = !!(local && latest && local !== latest)
    const hasPluginUpdate = plugins.some((p) => p.hasUpdate)
    const hasUpdate = hasDshUpdate || hasPluginUpdate
    const updatedPlugins = plugins.filter((p) => p.hasUpdate)
    const updateCommands = []
    if (hasDshUpdate) {
      updateCommands.push({
        label: 'DSH 本体',
        command: 'npm install -g @deepseek-ai/dsh@latest',
      })
    }
    for (const p of updatedPlugins) {
      updateCommands.push({
        label: p.name,
        command: `npx -y @deepseek-ai/dsh plugin --profile web update ${p.name}`,
      })
    }
    const hintParts = updateCommands.map((item) => `${item.label}：${item.command}`)
    // 更新说明：只对有更新的项请求（GitHub releases，6h 缓存，失败静默）
    const dshMeta = await readPkgMeta('@deepseek-ai/dsh')
    const releaseNotes = {
      dsh: hasDshUpdate ? await readReleaseNotes(dshMeta.repository, latest) : null,
      plugins: [],
    }
    for (const p of updatedPlugins) {
      releaseNotes.plugins.push({
        name: p.name,
        notes: await readReleaseNotes(p.repository, p.latestVersion),
      })
    }
    return {
      ok: true,
      localVersion: local,
      latestVersion: latest,
      hasUpdate,
      plugins,
      updateCommands,
      releaseNotes,
      backups: readBackups(),
      updateHint: hintParts.length
        ? `更新命令：\n${hintParts.join('\n')}\n然后重启 DSH（launchctl kickstart -k gui/$(id -u)/com.tiezhu.dsh-web）`
        : null,
      checkedAt: Date.now(),
    }
  }

  const check = async () => {
    try {
      const now = Date.now()
      if (cached !== null && now - cached.at < CACHE_MS) {
        return { ...cached.data, cached: true }
      }
      if (checking) {
        if (cached !== null) return { ...cached.data, cached: true }
        for (let i = 0; i < 40; i += 1) {
          if (!checking && cached !== null) return { ...cached.data, cached: true }
          await ctx.timer.timeout(1000)
        }
        return { ok: false, error: '检查超时，请稍后重试' }
      }
      checking = true
      try {
        const data = await runFullCheck()
        cached = { data, at: data.checkedAt || now }
        return { ...data, cached: false }
      } finally {
        checking = false
      }
    } catch (error) {
      return { ok: false, error: String((error && error.message) || error).slice(0, 500) }
    }
  }

  // ── 立即更新：一键更新 DSH 本体 + 所有有更新的插件 ────────────────
  // 串行执行，避免 npm 并发锁冲突；每项记录 from/to/ok/message。
  // 更新完成后清缓存强制重新检查。更新 DSH 本体后需要用户重启 DSH 生效。
  let updating = false

  const updateAll = async () => {
    if (updating) return { ok: false, error: '更新进行中，请稍候' }
    updating = true
    try {
      // 1. 先跑一次全新检查（绕过缓存），确定要更新什么
      cached = null
      const data = await runFullCheck()
      cached = { data, at: data.checkedAt || Date.now() }
      const results = []
      let skipped = 0

      // 2. DSH 本体
      if (data.localVersion && data.latestVersion && data.localVersion !== data.latestVersion) {
        const res = await run(
          `npm install -g @deepseek-ai/dsh@latest --cache ${NPM_CACHE}`,
          300000,
        )
        results.push({
          kind: 'dsh',
          name: '@deepseek-ai/dsh',
          from: data.localVersion,
          to: data.latestVersion,
          ok: res.exitCode === 0,
          message: res.exitCode === 0 ? '已更新，重启 DSH 后生效' : ((res.stderr && res.stderr.text || res.stdout && res.stdout.text || '').slice(0, 300)),
       })
      }

      // 3. 有更新的插件（跳过 file:/link: 等非 registry 依赖——已在检查端过滤）
      const updatedPlugins = (data.plugins || []).filter((p) => p.hasUpdate)
      for (const p of updatedPlugins) {
        const res = await run(
          `cd ${PROFILE_DIR} && npm install ${p.name}@latest --cache ${NPM_CACHE}`,
          180000,
        )
        results.push({
          kind: 'plugin',
          name: p.name,
          from: p.localVersion,
          to: p.latestVersion,
          ok: res.exitCode === 0,
          message: res.exitCode === 0 ? '已更新' : ((res.stderr && res.stderr.text || res.stdout && res.stdout.text || '').slice(0, 300)),
       })
      }

      // 4. 至少一项成功则写入备份（记录更新前版本，供回滚）
      const anyOk = results.some((r) => r.ok)
      if (anyOk) {
        const backup = {
          id: String(Date.now()),
          at: Date.now(),
          items: results.map((r) => ({ kind: r.kind, name: r.name, from: r.from, to: r.to })),
        }
        saveBackup(backup)
      }

      // 5. 清缓存并重新检查，返回最新状态
      cached = null
      const fresh = await runFullCheck()
      cached = { data: fresh, at: fresh.checkedAt || Date.now() }
      const needRestart = results.some((r) => r.kind === 'dsh' && r.ok)
      return {
        ok: true,
        results,
        skipped,
        needRestart,
        backups: readBackups(),
        check: fresh,
      }
    } catch (error) {
      return { ok: false, error: String((error && error.message) || error).slice(0, 500) }
    } finally {
      updating = false
    }
  }

  const update = async () => {
    try {
      return await updateAll()
    } catch (error) {
      return { ok: false, error: String((error && error.message) || error).slice(0, 500) }
    }
  }

  // ── 备份记录：~/.dsh/storages/dsh-check-update-backups.json，保留最近 5 次 ──
  const readBackups = () => {
    try {
      if (!existsSync(BACKUP_FILE)) return []
      return JSON.parse(readFileSync(BACKUP_FILE, 'utf8')) || []
    } catch (error) {
      return []
    }
  }

  const saveBackup = (backup) => {
    try {
      const list = readBackups()
      list.unshift(backup)
      const trimmed = list.slice(0, BACKUP_MAX)
      mkdirSync(BACKUP_DIR, { recursive: true })
      writeFileSync(BACKUP_FILE, JSON.stringify(trimmed, null, 2), 'utf8')
    } catch (error) { /* 备份写失败不阻塞更新主流程 */ }
  }

  // ── 回滚：按备份 id 把每项装回 from 版本（串行，与更新同一套 shell 逻辑）─
  let rollingBack = false

  const rollbackAll = async (backupId) => {
    if (rollingBack) return { ok: false, error: '回滚进行中，请稍候' }
    rollingBack = true
    try {
      const backup = readBackups().find((b) => b.id === String(backupId))
      if (!backup) return { ok: false, error: '备份记录不存在' }
      const results = []
      for (const item of backup.items) {
        const target = item.from
        const cmd = item.kind === 'dsh'
          ? `npm install -g ${item.name}@${target} --cache ${NPM_CACHE}`
          : `cd ${PROFILE_DIR} && npm install ${item.name}@${target} --cache ${NPM_CACHE}`
        const res = await run(cmd, 300000)
        results.push({
          kind: item.kind,
          name: item.name,
          from: item.to,
          to: item.from,
          ok: res.exitCode === 0,
          message: res.exitCode === 0 ? (item.kind === 'dsh' ? '已回滚，重启 DSH 后生效' : '已回滚') : ((res.stderr && res.stderr.text || res.stdout && res.stdout.text || '').slice(0, 300)),
       })
      }
      // 回滚后清缓存重新检查
      cached = null
      const fresh = await runFullCheck()
      cached = { data: fresh, at: fresh.checkedAt || Date.now() }
      return {
        ok: true,
        results,
        needRestart: results.some((r) => r.kind === 'dsh' && r.ok),
        check: fresh,
      }
    } catch (error) {
      return { ok: false, error: String((error && error.message) || error).slice(0, 500) }
    } finally {
      rollingBack = false
    }
  }

  const rollback = async (payload) => {
    try {
      return await rollbackAll(payload && payload.id)
    } catch (error) {
      return { ok: false, error: String((error && error.message) || error).slice(0, 500) }
    }
  }

  const respond = async (req, res, fn) => {
    // 仅接受 POST：GET 可被任意网页 <img>/<a> 跨站触发（CSRF 面）
    if (req.method !== 'POST') {
      const text = JSON.stringify({ ok: false, error: 'method not allowed' })
      res.writeHead(405, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
      res.end(text)
      return
    }
    let body
    try {
      body = await fn()
    } catch (error) {
      body = { ok: false, error: String((error && error.message) || error).slice(0, 500) }
    }
    const text = JSON.stringify(body)
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
    res.end(text)
  }

  const disposeCheckRoute = ctx.webServer.register({
    kind: 'exact',
    path: '/dsh-check/check',
    handler: (req, res) => respond(req, res, check),
  })

  const disposeUpdateRoute = ctx.webServer.register({
    kind: 'exact',
    path: '/dsh-check/update',
    handler: (req, res) => respond(req, res, update),
  })

  // 回滚接口：respond 只传函数，payload 需从请求体解析——
  // 这里包一层取 body（respond 的 fn 不接收 payload，回滚需要 id）
  const rollbackRoute = async (req, res) => {
    if (req.method !== 'POST') {
      const text = JSON.stringify({ ok: false, error: 'method not allowed' })
      res.writeHead(405, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
      res.end(text)
      return
    }
    let payload = {}
    try {
      const chunks = []
      for await (const chunk of req) chunks.push(chunk)
      if (chunks.length) payload = JSON.parse(Buffer.concat(chunks).toString('utf8'))
    } catch (error) { /* body 解析失败用空 payload */ }
    const body = await rollback(payload)
    const text = JSON.stringify(body)
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
    res.end(text)
  }

  const disposeRollbackRoute = ctx.webServer.register({
    kind: 'exact',
    path: '/dsh-check/rollback',
    handler: rollbackRoute,
  })

  let disposeTimer = null
  disposeTimer = ctx.timer.interval(() => {
    if (checking) return
    checking = true
    runFullCheck()
      .then((data) => { cached = { data, at: data.checkedAt } })
      .catch(() => { /* 静默失败，保留旧缓存 */ })
      .finally(() => { checking = false })
  }, AUTO_INTERVAL_MS)

  ctx.effect(() => () => {
    disposeCheckRoute()
    disposeUpdateRoute()
    disposeRollbackRoute()
    if (disposeTimer) disposeTimer()
  })
}
