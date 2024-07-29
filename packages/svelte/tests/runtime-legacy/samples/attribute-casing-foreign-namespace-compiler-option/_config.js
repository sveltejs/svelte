import { test } from '../../test';

export default test({
	// TODO: needs fixing. Can only be fixed once we also support document.createElementNS-style creation of elements
	// because the $.template('...') approach has no option to preserve attribute name casing
	skip: true,

	html: `
		<page horizontalAlignment="center">
			<button textWrap="true" text="button"></button>
			<text wordWrap="true"></text>
		</page>
	`,

	compileOptions: {
		namespace: 'foreign'
	},

	test({ assert, target }) {
		// @ts-ignore
		const attr = (/** @type {string} */ sel) => target.querySelector(sel).attributes[0].name;
		assert.equal(attr('page'), 'horizontalAlignment');
		assert.equal(attr('button'), 'textWrap');
		assert.equal(attr('text'), 'wordWrap');
	}
});
