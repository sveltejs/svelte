/**
 * @param {Node} anchor
 * @param {{ hash: string, code: string }} css
 */
export function append_styles(anchor, css) {
	var root = anchor.getRootNode();

	var target = /** @type {ShadowRoot} */ (root).host
		? /** @type {ShadowRoot} */ (root)
		: /** @type {Document} */ (root).head ?? /** @type {Document} */ (root.ownerDocument).head;

	if (!target.querySelector('#' + css.hash)) {
		const style = document.createElement('style');
		style.id = css.hash;
		style.textContent = css.code;

		target.appendChild(style);
	}
}
