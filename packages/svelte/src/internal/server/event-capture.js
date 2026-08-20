/**
 * head script that catches `load`/`error` on cached elements before hydration
 * attaches the real listeners. replaces the per-element `onload="this.__e=event"`
 * attribute when `csp` is set on `render()`. if you change the body, update the
 * hash below — the test in `event-capture.test.ts` will tell you the new value.
 */
// the `if(e.target)` guard skips events whose target is unset (e.g. retargeted to window)
export const EVENT_CAPTURE_SCRIPT =
	'var r=(e)=>{if(e.target)e.target.__e=e};document.addEventListener("load",r,true);document.addEventListener("error",r,true);';

/** sha256 of {@link EVENT_CAPTURE_SCRIPT} */
export const EVENT_CAPTURE_SCRIPT_SHA256 = 'sha256-VyPjBqafUNeHE2rLgLKQN7xM97MwGeuS77U6ASqjaYY=';
