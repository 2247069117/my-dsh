// dsh-llm-opencode-zen — browser half (lazy-CJS client bundle).
// Renders one "plugin configuration" card for the `llm-opencode-zen` settings
// namespace: a read-only status summary plus the single user-owned control —
// the provider on/off switch. Model rows stay read-only: they are auto-probed
// by the host half and selectable in the chat model picker like any provider.
window.__ModuleLoader__.load({
	id: "@dsh-external/dsh-llm-opencode-zen/client",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		let react = require("react");
		const storeKey = ["@deepseek-ai/dsh-client", "-store"].join("");
		const legacyKey = ["@deepseek-ai/dsh-client-runtime", "/client"].join("");
		let runtime;
		try {
			runtime = require(storeKey);
		} catch {
			runtime = require(legacyKey);
		}

		/** Settings namespace owned by the host half. */
		const NS = "llm-opencode-zen";
		/** Required browser services (cordis fiber inject). */
		const inject = ["slots", "locale", "settingsScope"];

		/**
		 * Card controller: mirrors the namespace snapshot and performs the one
		 * write the card owns (enabled). Everything else the card shows is
		 * read-only status text.
		 */
		class ZenCardController {
			constructor(scope) {
				this.scope = scope;
				this.disposed = false;
				this.failed = false;
				this.store = runtime.createSnapshotStore({
					status: "loading",
					enabled: true,
					failed: false
				});
				this.unsubscribe = scope.subscribe(() => this.publish());
				this.publish();
			}
			publish() {
				if (this.disposed) return;
				const snapshot = this.scope.getSnapshot();
				const enabled = snapshot.value === void 0 ? true : snapshot.value.enabled !== false;
				this.store.set({
					status: snapshot.status,
					enabled,
					failed: this.failed
				});
			}
			async toggle(enabled) {
				if (this.disposed) return;
				this.failed = false;
				try {
					await this.scope.set("enabled", enabled);
				} catch (_writeFailure) {
					this.failed = true;
				}
				this.publish();
			}
			dispose() {
				this.disposed = true;
				this.unsubscribe?.();
			}
			inject() {
				return {
					hooks: { zenCard: this.store },
					toggle: (value) => this.toggle(value)
				};
			}
		}

		/** One plugin card: header naming the provider, body with the switch. */
		function ZenCard(props) {
			const state = props.useZenCard((snapshot) => snapshot);
			const t = props.t;
			const enabled = state.enabled;
			const ready = state.status !== "loading";
			const switchStyle = {
				display: "inline-flex",
				alignItems: "center",
				gap: "8px",
				border: "1px solid var(--dsw-alias-border-l2)",
				background: enabled ? "color-mix(in srgb, var(--dsw-alias-state-success-primary) 14%, transparent)" : "var(--dsw-alias-bg-layer-1)",
				color: "var(--dsw-alias-label-primary)",
				borderRadius: "999px",
				padding: "4px 12px",
				font: "inherit",
				fontSize: "12px",
				lineHeight: "20px",
				cursor: "pointer"
			};
			const dotStyle = {
				width: "8px",
				height: "8px",
				borderRadius: "999px",
				background: enabled ? "var(--dsw-alias-state-success-primary)" : "var(--dsw-alias-label-tertiary)",
				flex: "none"
			};
			const hintStyle = {
				color: "var(--dsw-alias-label-tertiary)",
				margin: "10px 0 0",
				fontSize: "12px",
				lineHeight: "18px"
			};
			const failStyle = {
				color: "var(--dsw-alias-state-error-primary)",
				margin: "8px 0 0",
				fontSize: "12px",
				lineHeight: "18px"
			};
			return react.createElement("li", { style: { listStyle: "none", margin: 0, padding: 0 } },
				react.createElement("div", {
					style: { border: "1px solid var(--dsw-alias-border-l2)", background: "var(--dsw-alias-bg-layer-3)", borderRadius: "10px", overflow: "hidden" }
				},
					react.createElement("div", { style: { padding: "12px 14px" } },
						react.createElement("span", { style: { display: "block", fontSize: "14px", fontWeight: 600, color: "var(--dsw-alias-label-primary)", lineHeight: "20px" } }, t("zenTitle")),
						react.createElement("span", { style: { display: "block", color: "var(--dsw-alias-label-tertiary)", fontSize: "12px", lineHeight: "18px", marginTop: "2px" } }, t("zenDescription"))
					),
					react.createElement("div", { style: { borderTop: "1px solid var(--dsw-alias-border-l2)", background: "var(--dsw-alias-bg-module-platform)", padding: "10px 14px 12px" } },
						react.createElement("button", {
							type: "button",
							role: "switch",
							"aria-checked": enabled ? "true" : "false",
							"aria-label": t(enabled ? "zenDisableLabel" : "zenEnableLabel"),
							disabled: !ready,
							style: switchStyle,
							onClick: () => props.toggle(!enabled)
						},
							react.createElement("span", { style: dotStyle }),
							react.createElement("span", null, t(enabled ? "zenOn" : "zenOff"))
						),
						state.failed ? react.createElement("p", { style: failStyle, role: "status" }, t("zenSaveFailed")) : null,
						react.createElement("p", { style: hintStyle }, t("zenHint")),
						react.createElement("p", { style: hintStyle }, t("zenModelsHint"))
					)
				)
			);
		}

		/** English copy. */
		const en = {
			zenTitle: "OpenCode Zen (free models)",
			zenDescription: "Free models are probed and managed automatically; the list is read-only.",
			zenOn: "Enabled",
			zenOff: "Disabled",
			zenEnableLabel: "Enable the OpenCode Zen provider",
			zenDisableLabel: "Disable the OpenCode Zen provider",
			zenSaveFailed: "The deployment did not accept the change.",
			zenHint: "Turning this off hides the provider and its models from the model picker; turning it on re-enables the last probed models.",
			zenModelsHint: "Model list is auto-synced: expired models are removed and newly available ones are added without manual editing."
		};
		/** Simplified Chinese copy. */
		const zh = {
			zenTitle: "OpenCode Zen（免费模型）",
			zenDescription: "免费模型自动探测与管理，模型列表为只读。",
			zenOn: "已启用",
			zenOff: "已停用",
			zenEnableLabel: "启用 OpenCode Zen 供应商",
			zenDisableLabel: "停用 OpenCode Zen 供应商",
			zenSaveFailed: "本部署没有接受该变更。",
			zenHint: "停用后，该供应商及其模型将从模型选择器中隐藏；重新启用会恢复最近探测到的模型。",
			zenModelsHint: "模型列表自动同步：失效模型自动移除，新增模型自动添加，无需手动编辑。"
		};

		/**
		 * Mount the card into the "plugin configuration" tab, keyed by the
		 * namespace the host half serves.
		 */
		function apply(ctx) {
			const zen = new ZenCardController(ctx.settingsScope.bind({ namespace: NS }));
			ctx.effect(() => ctx.locale.register(NS, { zh, en }), "llm-opencode-zen: card dictionaries");
			ctx.slots.inject("settings.plugin.item", function* () {
				yield ctx.slots.register({
					name: "settings.plugin.item",
					key: NS,
					locale: NS,
					inject: () => zen.inject()
				}, ZenCard);
			});
			ctx.effect(() => () => zen.dispose(), "llm-opencode-zen: card controller");
		}

		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
