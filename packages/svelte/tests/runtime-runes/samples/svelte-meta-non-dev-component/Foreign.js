// Stands in for a component that wasn't compiled with `dev: true`
// (or isn't a Svelte component at all), so its elements have no `__svelte_meta`
/** @param {Comment} anchor */
export default function Foreign(anchor) {
	anchor.before(document.createElement('section'));
}
