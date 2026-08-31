// dsh-check-update —— Client 面（浏览器 bundle）
//
// DSH web 前端通过 __ModuleLoader__ 加载本 bundle（格式同第一方 ui 包）。
// 零外部依赖：React 由 loader 的 require 提供；检查走同源 HTTP 路由
// （fetch('/dsh-check/check')，由 host.js 注册）。
// 注册设置页「DSH 更新」（settings.section），有更新时导航标签带 ● 红点。
// 适配 npm 全局安装：只做版本检查 + 更新指引，不做 git 拉取。
window.__ModuleLoader__.load({
  id: 'dsh-check-update',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    var React = require('react')

    var name = 'dsh-check-update'
    var inject = ['slots', 'timer']

    var cardStyle = {
      display: 'flex', flexDirection: 'column', gap: 4,
      padding: '10px 12px', border: '1px solid rgba(128,128,128,.35)',
      borderRadius: 8, fontSize: 13, lineHeight: 1.5,
    }
    var rowStyle = { display: 'flex', gap: 8, alignItems: 'baseline' }
    var labelStyle = { opacity: 0.55, minWidth: 70, flex: 'none' }
    var monoStyle = { fontFamily: 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace', fontSize: 12, wordBreak: 'break-all' }
    var okStyle = { color: '#2e7d32', fontWeight: 600 }
    var warnStyle = { color: '#b26a00', fontWeight: 600 }
    var errStyle = { color: '#c62828' }
    var btnStyle = {
      padding: '4px 14px', borderRadius: 6, border: '1px solid rgba(128,128,128,.5)',
      background: 'transparent', cursor: 'pointer', fontSize: 12,
    }
    var noteStyle = { opacity: 0.6, fontSize: 12, marginTop: 4 }
    var commandBoxStyle = {
      display: 'flex', alignItems: 'center', gap: 8, marginTop: 6,
      padding: '6px 8px', borderRadius: 6, background: 'rgba(128,128,128,.1)',
    }

    var copyText = function (text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text)
      }
      return new Promise(function (resolve, reject) {
        var area = document.createElement('textarea')
        area.value = text
        area.setAttribute('readonly', '')
        area.style.position = 'fixed'
        area.style.opacity = '0'
        document.body.appendChild(area)
        area.select()
        try {
          if (!document.execCommand('copy')) throw new Error('浏览器拒绝复制')
          resolve()
        } catch (error) {
          reject(error)
        } finally {
          document.body.removeChild(area)
        }
      })
    }

    function apply(ctx) {
      var slots = ctx.get('slots')
      var timer = ctx.get('timer')
      if (slots === undefined) return
      var dshHasUpdate = false
      var pluginHasUpdate = false
      var hasUpdate = false

      var callCheck = function () {
        return fetch('/dsh-check/check', { method: 'POST', cache: 'no-store', signal: AbortSignal.timeout(30000) })
          .then(function (r) { return r.json() })
      }

      // 一键更新：串行执行 DSH 本体 + 所有有更新插件，可能耗时数分钟
      var callUpdate = function () {
        return fetch('/dsh-check/update', { method: 'POST', cache: 'no-store', signal: AbortSignal.timeout(600000) })
          .then(function (r) { return r.json() })
      }

      // 回滚：按备份 id 装回更新前版本
      var callRollback = function (id) {
        return fetch('/dsh-check/rollback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: id }),
          cache: 'no-store',
          signal: AbortSignal.timeout(600000),
        }).then(function (r) { return r.json() })
      }

      // 从检查结果提取三类状态：DSH 本体更新 / 插件更新 / 任一更新
      var computeState = function (data) {
        if (!data || !data.ok) return { dsh: false, plugin: false, any: false }
        var dshUpd = !!(data.localVersion && data.latestVersion && data.localVersion !== data.latestVersion)
        var pluginUpd = !!(data.plugins || []).some(function (p) { return p.hasUpdate })
        return { dsh: dshUpd, plugin: pluginUpd, any: dshUpd || pluginUpd }
      }

      // 模块加载即检查一次：红点不依赖设置页组件挂载（否则不打开设置页永远看不到 ●）
      callCheck().then(function (data) {
        var s = computeState(data)
        applyHasUpdate(s.dsh, s.plugin)
      }).catch(function () { /* 静默 */ })

      function UpdView() {
        var el = React.createElement
        var state0 = React.useState({ phase: 'running', data: null, error: null, updating: false, updateResult: null, rollingBack: false, rollbackResult: null, copied: null })
        var state = state0[0]
        var setState = state0[1]

        var copyCommand = function (key, command) {
          copyText(command).then(function () {
            setState(function (s) { return Object.assign({}, s, { copied: key }) })
            setTimeout(function () {
              setState(function (s) { return s.copied === key ? Object.assign({}, s, { copied: null }) : s })
            }, 1800)
          }).catch(function () {
            setState(function (s) { return Object.assign({}, s, { copied: 'error' }) })
          })
        }

        var applyData = function (data) {
          var s = computeState(data)
          applyHasUpdate(s.dsh, s.plugin)
        }

        var runCheck = function () {
          setState({ phase: 'running', data: null, error: null, updating: false, updateResult: null, rollingBack: false, rollbackResult: null })
          callCheck().then(function (data) {
            applyData(data)
            setState({ phase: 'done', data: data, error: null, updating: false, updateResult: null })
          }).catch(function (error) {
            setState({ phase: 'done', data: null, error: String((error && error.message) || error), updating: false, updateResult: null })
          })
        }

        var runUpdate = function () {
          var pending = state.data
          var hasAny = !!(pending && pending.ok && pending.hasUpdate)
          if (!hasAny) return
          if (!window.confirm('将一键更新 DSH 本体和所有有更新的插件，预计需要几分钟，期间请勿关闭页面。确认执行？')) return
          setState({ phase: 'done', data: pending, error: null, updating: true, updateResult: null })
          callUpdate().then(function (res) {
            if (res && res.ok) {
              applyData(res.check || pending)
              setState(function (s) { return Object.assign({}, s, { updating: false, updateResult: res }) })
            } else {
              setState(function (s) { return Object.assign({}, s, { updating: false, updateResult: { ok: false, error: (res && res.error) || '更新失败' } }) })
            }
          }).catch(function (err) {
            setState(function (s) { return Object.assign({}, s, { updating: false, updateResult: { ok: false, error: String((err && err.message) || err) } }) })
          })
        }

        var runRollback = function (id) {
          var bk = (state.data && state.data.backups || []).find(function (b) { return b.id === id })
          if (!bk) return
          var desc = bk.items.map(function (it) { return it.name + ' ' + it.from + '→' + it.to }).join('，')
          if (!window.confirm('将回滚以下更新到更新前版本：' + desc + '。确认执行？')) return
          setState(Object.assign({}, state, { rollingBack: true, rollbackResult: null }))
          callRollback(id).then(function (res) {
            if (res && res.ok) {
              applyData(res.check || state.data)
              setState(function (s) { return Object.assign({}, s, { rollingBack: false, rollbackResult: res }) })
            } else {
              setState(function (s) { return Object.assign({}, s, { rollingBack: false, rollbackResult: { ok: false, error: (res && res.error) || '回滚失败' } }) })
            }
          }).catch(function (err) {
            setState(function (s) { return Object.assign({}, s, { rollingBack: false, rollbackResult: { ok: false, error: String((err && err.message) || err) } }) })
          })
        }

        var pollCheck = function () {
          callCheck().then(function (data) {
            applyData(data)
            // 只刷新 data，保留 updating/updateResult 字段（否则 60s 轮询会打断更新中状态）
            setState(function (s) { return s.phase === 'done' ? Object.assign({}, s, { data: data }) : s })
          }).catch(function () { /* 静默 */ })
        }

        React.useEffect(function () {
          runCheck()
          if (timer !== undefined) {
            var dispose = timer.interval(function () { pollCheck() }, 60000)
            return function () { dispose() }
          }
        }, [])

        function row(label, value, mono) {
          return el('div', { style: rowStyle },
            el('span', { style: labelStyle }, label),
            el('span', { style: mono ? monoStyle : undefined }, value === null || value === undefined ? '—' : String(value)))
        }

        var statusLine
        if (state.phase === 'running') {
          statusLine = el('div', null, '正在检查更新…')
        } else if (state.error) {
          statusLine = el('div', { style: errStyle }, '检查失败: ' + state.error)
        } else if (!state.data || !state.data.ok) {
          statusLine = el('div', { style: errStyle }, '检查失败: ' + ((state.data && state.data.error) || '未知错误'))
        } else {
          var d = state.data
          var pluginUpd = (d.plugins || []).filter(function (p) { return p.hasUpdate })
          if (d.hasUpdate) {
            var parts = []
            if (d.localVersion && d.latestVersion && d.localVersion !== d.latestVersion) {
              parts.push('DSH 本体 v' + d.localVersion + ' → v' + d.latestVersion)
            }
            for (var i = 0; i < pluginUpd.length; i++) {
              parts.push(pluginUpd[i].name + ' v' + pluginUpd[i].localVersion + ' → v' + pluginUpd[i].latestVersion)
            }
            statusLine = el('div', { style: warnStyle }, '⚠️ 有更新可用：' + parts.join('；'))
          } else {
            statusLine = el('div', { style: okStyle }, '✅ 全部已是最新（DSH v' + d.localVersion + '）')
          }
        }

        var pluginBox = null
        if (state.data && state.data.ok && Array.isArray(state.data.plugins) && state.data.plugins.length) {
          pluginBox = el('div', { style: { marginTop: 6 } },
            el('div', { style: { opacity: 0.55, fontSize: 12 } }, '已装插件：'),
            state.data.plugins.map(function (p) {
              var pStyle = p.hasUpdate ? warnStyle : { opacity: 0.8 }
              return el('div', { style: Object.assign({ marginTop: 2 }, rowStyle) },
                el('span', { style: Object.assign({}, labelStyle, { minWidth: 0 }) }, p.name),
                el('span', { style: Object.assign({}, monoStyle, pStyle) },
                  (p.localVersion || '?') + (p.hasUpdate ? ' → ' + p.latestVersion : '')))
            }))
        }

        var commandBox = null
        if (state.data && state.data.ok && Array.isArray(state.data.updateCommands) && state.data.updateCommands.length) {
          var commands = state.data.updateCommands
          var allCommands = commands.map(function (item) { return item.command }).join('\n')
          commandBox = el('div', { style: { marginTop: 6 } },
            el('div', { style: { opacity: 0.55, fontSize: 12 } }, '更新命令（点击即可复制）：'),
            commands.map(function (item, index) {
              var key = 'command-' + index
              return el('div', { style: commandBoxStyle },
                el('code', { style: Object.assign({}, monoStyle, { flex: 1 }) }, item.command),
                el('button', {
                  style: btnStyle,
                  onClick: function () { copyCommand(key, item.command) },
                  disabled: state.updating,
                  title: '复制这条更新命令',
                }, state.copied === key ? '已复制' : '复制'))
            }),
            el('button', {
              style: Object.assign({}, btnStyle, { marginTop: 6 }),
              onClick: function () { copyCommand('all-commands', allCommands) },
              disabled: state.updating,
              title: '复制全部更新命令，每条命令占一行',
            }, state.copied === 'all-commands' ? '已复制全部命令' : '复制全部命令'),
            state.copied === 'error' ? el('span', { style: Object.assign({}, errStyle, { marginLeft: 8, fontSize: 12 }) }, '复制失败，请手动选择命令') : null)
        }

        var hintBox = null
        if (state.data && state.data.ok && state.data.hasUpdate && state.data.updateHint) {
          hintBox = el('div', { style: { marginTop: 4 } },
            el('details', null,
              el('summary', { style: { cursor: 'pointer' } }, '手动更新指引'),
              el('div', { style: Object.assign({ marginLeft: 10 }, monoStyle) }, state.data.updateHint)))
        }

        // 一键更新按钮：有更新才亮起；更新中禁用并提示
        var updateBtn = null
        var hasAnyUpdate = !!(state.data && state.data.ok && state.data.hasUpdate)
        if (state.updating) {
          updateBtn = el('button', { style: Object.assign({}, btnStyle, { background: 'rgba(178,106,0,.18)' }), disabled: true }, '更新中…（约 1-3 分钟）')
        } else if (hasAnyUpdate) {
          updateBtn = el('button', {
            style: Object.assign({}, btnStyle, { background: '#2e7d32', color: '#fff', borderColor: '#2e7d32', fontWeight: 600 }),
            onClick: runUpdate,
            title: '一键更新 DSH 本体与所有有更新的插件',
          }, '⚡ 立即更新全部')
        }

        // 更新结果
        var updateResultBox = null
        if (state.updateResult) {
          var ur = state.updateResult
          if (ur.ok) {
            updateResultBox = el('div', { style: { marginTop: 8, border: '1px solid rgba(46,125,50,.45)', borderRadius: 6, padding: '8px 10px', background: 'rgba(46,125,50,.08)' } },
              el('div', { style: { fontWeight: 600, marginBottom: 4 } }, '更新完成'),
              ur.results.map(function (r) {
                return el('div', { style: Object.assign({}, rowStyle, { marginTop: 2 }) },
                  el('span', { style: Object.assign({}, monoStyle, { color: r.ok ? '#2e7d32' : '#c62828' }) },
                    (r.ok ? '✓ ' : '✗ ') + r.name + ' ' + r.from + ' → ' + r.to),
                  el('span', { style: { opacity: 0.7 } }, r.message || ''))
              }),
              ur.needRestart
                ? el('div', { style: { marginTop: 6, color: '#b26a00', fontWeight: 600 } },
                    '⚠️ DSH 本体已更新，请重启 DSH 使新版本生效：launchctl kickstart -k gui/$(id -u)/com.tiezhu.dsh-web')
                : null)
          } else {
            updateResultBox = el('div', { style: { marginTop: 8, color: '#c62828' } }, '更新失败：' + (ur.error || '未知错误'))
          }
        }

        // 更新说明（GitHub releases，只对有更新的项）
        var releaseNotesBox = null
        if (state.data && state.data.ok && state.data.releaseNotes) {
          var rn = state.data.releaseNotes
          var rnEntries = []
          if (rn.dsh) rnEntries.push({ name: '@deepseek-ai/dsh', notes: rn.dsh })
          for (var rni = 0; rni < (rn.plugins || []).length; rni++) {
            if (rn.plugins[rni].notes) rnEntries.push({ name: rn.plugins[rni].name, notes: rn.plugins[rni].notes })
          }
          if (rnEntries.length) {
            releaseNotesBox = el('div', { style: { marginTop: 4 } },
              el('details', null,
                el('summary', { style: { cursor: 'pointer' } }, '📝 更新说明（' + rnEntries.length + ' 项）'),
                el('div', { style: { marginLeft: 10, marginTop: 4 } },
                  rnEntries.map(function (e) {
                    return el('div', { style: { marginTop: 6 } },
                      el('div', { style: { fontWeight: 600 } }, e.name + (e.notes.tag ? ' ' + e.notes.tag : '')),
                      el('div', { style: Object.assign({}, monoStyle, { whiteSpace: 'pre-wrap' }) }, e.notes.body))
                  }))))
          }
        }

        // 备份与回滚（更新自动生成备份，保留最近 5 次）
        var backupBox = null
        if (state.data && state.data.ok && Array.isArray(state.data.backups) && state.data.backups.length) {
          backupBox = el('div', { style: { marginTop: 8, border: '1px solid rgba(128,128,128,.35)', borderRadius: 6, padding: '8px 10px' } },
            el('div', { style: { fontWeight: 600, marginBottom: 4 } }, '备份与回滚（保留最近 5 次更新）'),
            state.data.backups.map(function (b) {
              var when = new Date(b.at).toLocaleString()
              return el('div', { style: Object.assign({}, rowStyle, { marginTop: 4, gap: 6 }) },
                el('span', { style: { opacity: 0.7, minWidth: 0 } },
                  when + ' · ' + b.items.map(function (it) { return it.name + ' ' + it.from + '→' + it.to }).join('，')),
                el('button', {
                  style: btnStyle,
                  disabled: state.rollingBack || state.updating,
                  onClick: function () { runRollback(b.id) },
                }, '回滚'))
            }),
            state.rollbackResult
              ? (state.rollbackResult.ok
                  ? el('div', { style: { marginTop: 6, borderTop: '1px solid rgba(128,128,128,.25)', paddingTop: 6 } },
                      state.rollbackResult.results.map(function (r) {
                        return el('div', { style: rowStyle },
                          el('span', { style: Object.assign({}, monoStyle, { color: r.ok ? '#2e7d32' : '#c62828' }) },
                            (r.ok ? '✓ ' : '✗ ') + r.name + ' ' + r.from + ' → ' + r.to),
                          el('span', { style: { opacity: 0.7 } }, r.message || ''))
                      }),
                      state.rollbackResult.needRestart
                        ? el('div', { style: { marginTop: 4, color: '#b26a00', fontWeight: 600 } },
                            '⚠️ DSH 本体已回滚，请重启 DSH 生效：launchctl kickstart -k gui/$(id -u)/com.tiezhu.dsh-web')
                        : null)
                  : el('div', { style: { marginTop: 6, color: '#c62828' } }, '回滚失败：' + (state.rollbackResult.error || '未知错误')))
              : null)
        }

        var data = state.data
        return el('div', { style: cardStyle },
          el('div', { style: { fontWeight: 600 } }, 'DSH 更新'),
          statusLine,
          data && data.ok ? el('div', null,
            row('DSH 本体', data.localVersion, true),
            row('最新版本', data.latestVersion, true),
            row('最近检查', data.checkedAt ? new Date(data.checkedAt).toLocaleTimeString() : '—')) : null,
          pluginBox,
          commandBox,
          hintBox,
          releaseNotesBox,
          updateResultBox,
          backupBox,
          el('div', { style: { display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' } },
            updateBtn,
            el('button', { style: btnStyle, onClick: runCheck, disabled: state.phase === 'running' || state.updating }, state.phase === 'running' ? '检查中…' : '重新检查')),
          el('div', { style: noteStyle }, '自动检查每 6 小时一次（页面每 60 秒刷新缓存结果）；检查 DSH 本体 + 已装插件（modlens / better-sidebar 等）。有新版时点「立即更新全部」一键更新（自动备份，可回滚），或按手动指引操作。'))
      }

      var disposeInject = null

      // 侧边栏底部更新 chip：有更新才渲染（常驻可见，不依赖打开设置页）
      function FooterChip(props) {
        if (!hasUpdate) return null
        var el = React.createElement
        // 颜色语义：红色 = DSH 本体有更新；黄色 = 仅插件有更新
        var isRed = dshHasUpdate
        var chipStyle = isRed
          ? {
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '4px 10px', margin: '2px 8px',
              borderRadius: 6, border: '1px solid rgba(211,47,47,.55)',
              background: 'rgba(211,47,47,.12)', color: '#ef5350',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }
          : {
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '4px 10px', margin: '2px 8px',
              borderRadius: 6, border: '1px solid rgba(178,106,0,.55)',
              background: 'rgba(178,106,0,.14)', color: '#e6a23c',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }
        var chipText = isRed ? '● DSH 更新' : '● 插件更新'
        return el('button', {
          style: chipStyle,
          title: isRed ? 'DSH 本体有更新，打开设置页查看详情' : '有插件可更新，打开设置页查看详情',
          onClick: function () { window.location.hash = '#/settings' },
        }, chipText)
      }

      var registerAll = function () {
        var disposes = []
        disposes.push(slots.inject('settings.section', function () {
          return slots.register(
            { name: 'settings.section', id: 'dsh-check-update', order: 30, label: function () { return hasUpdate ? 'DSH 更新 ●' : 'DSH 更新' } },
            function (props) { return React.createElement(UpdView, null) })
        }))
        disposes.push(slots.inject('sidebar.footer.action', function () {
          return slots.register(
            { name: 'sidebar.footer.action', id: 'dsh-check-update', order: 10 },
            function (props) { return React.createElement(FooterChip, props) })
        }))
        return function () { disposes.forEach(function (d) { d() }) }
      }
      // 状态变化 → 解除旧注册并重新注册（ledger bump 触发 shell 重渲染，
      // 导航 label / 侧边栏 chip 才会刷新；官方机制：注册者重新注册即重渲染触发）
      var applyHasUpdate = function (dsh, plugin) {
        if (dshHasUpdate === dsh && pluginHasUpdate === plugin) return
        dshHasUpdate = dsh
        pluginHasUpdate = plugin
        hasUpdate = dsh || plugin
        if (disposeInject) { disposeInject(); disposeInject = null }
        disposeInject = registerAll()
      }
      disposeInject = registerAll()
      ctx.effect(function () { return function () { if (disposeInject) disposeInject() } })
    }

    exports.name = name
    exports.inject = inject
    exports.apply = apply
    return module.exports
  },
})
