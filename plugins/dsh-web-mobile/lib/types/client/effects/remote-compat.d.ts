import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
/**
 * Compatibility guard against @linxin666/dsh-remote-web-ui (the dsh-web-all
 * bundle). That plugin ships its own portrait adaptation aimed at the vanilla
 * shell; co-installed with this plugin it fights the mobile-nav drawer layout.
 * Both breakages below were reproduced via CDP against dsh-remote-web-ui
 * 0.3.10 + host 0.1.2-alpha.2.
 *
 * 1. Dead composer picker buttons. Its "compact picker" injects two icon
 *    buttons (#dshRemoteModelPick cube / #dshRemoteEffortPick levels) into
 *    the composer tools lane and — while body.dsh-remote-compact-picker is
 *    set — squeezes the trailing lane to width:0, clipping the official
 *    model pill to ~12px. Its click handler drillIntoPicker() searches for
 *    `_composerSeat _trailing _trigger:has(_triggerEffort)`, an element the
 *    current host build no longer renders (the model trigger carries only
 *    triggerLabel + chevron), so both injected buttons are silent no-ops.
 *    Fix: keep the body class off (its sync loop re-adds it every 600ms) and
 *    hide the buttons via CSS; the stylesheet additionally un-squeezes the
 *    trailing lane as a belt-and-braces fallback.
 *
 * 2. The drawer collapses while Settings is open. Its document-capture
 *    click handler collapses the sidebar for any click inside the open
 *    sidebarCol that reaches the settings area, a session row, or the
 *    brand/new-session row. The host portals the settings dialog INTO the
 *    sidebar's settings area, so tapping 设置 — then anything inside the
 *    dialog — collapses the drawer under the dialog; the user must re-expand
 *    to see it, and the next tap collapses it again, endlessly.
 *    Fix: while the mobile layout is armed, (a) make the foreign adapter's
 *    window.__dshRemoteAdapt.toggleSidebar inert (our own controls call
 *    ctx.layout.toggleSidebar directly), and (b) swallow the adapter's
 *    untrusted fallback — a synthetic (isTrusted === false) .click() on the
 *    sidebar collapse toggle it dispatches 150ms later when the layout face
 *    did not flip the frame state. Trusted user clicks pass untouched.
 */
export declare function installRemoteCompat(ctx: ClientContext): void;
//# sourceMappingURL=remote-compat.d.ts.map