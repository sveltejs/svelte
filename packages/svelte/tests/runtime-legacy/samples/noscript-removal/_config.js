import { test } from '../../test';

export default test({
	ssrHtml: `
	<noscript>foo</noscript>

	<div>foo<noscript>foo</noscript></div>

	<div>foo<div>foo<noscript>foo</noscript></div></div>
	`,
	test({ assert, target, compileOptions, variant }) {
		// if created on client side, should not build noscript
		if (variant === 'dom') {
			assert.equal(target.querySelectorAll('noscript').length, 0);
		}

		// it's okay not to remove the node during hydration
		// will not be seen by user anyway
		remove_noscript(target);

		assert.htmlEqual(
			target.innerHTML,
			`
				<div>foo</div>
				<div>foo<div>foo</div></div>
			`
		);
	}
});

/**
 * @param {HTMLElement} target
 */
function remove_noscript(target) {
	target.querySelectorAll('noscript').forEach((elem) => {
		elem.parentNode?.removeChild(elem);
	});
}
