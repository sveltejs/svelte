export default {
	ssrHtml: `
	<noscript>foo</noscript>

	<div>foo<noscript>foo</noscript></div>

	<div>foo<div>foo<noscript>foo</noscript></div></div>
	`,
	test({ assert, target, compileOptions }) {
		// if created on client side, should not build noscript
		if (!compileOptions.hydratable) {
			assert.equal(target.querySelectorAll('noscript').length, 0);
		}

		// it's okay not to remove the node during hydration
		// will not be seen by user anyway
		removeNoScript(target);

		assert.htmlEqual(
			target.innerHTML,
			`
				<div>foo</div>
				<div>foo<div>foo</div></div>
			`
		);
	}
};

function removeNoScript(target) {
	target.querySelectorAll('noscript').forEach(elem => {
		elem.parentNode.removeChild(elem);
	});
}
