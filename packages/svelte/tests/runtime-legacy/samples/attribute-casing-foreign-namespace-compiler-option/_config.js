import { test } from '../../test';

export default test({
	skip: true, // TODO: needs fixing

	html: `
		<page horizontalAlignment="center">
			<button textWrap="true" text="button"></button>
			<text wordWrap="true"></text>
		</page>
	`,
	skip_if_hydrate: true,

	compileOptions: {
		namespace: 'foreign'
	},
	test({ assert, target }) {
		const attr = (sel) => target.querySelector(sel).attributes[0].name;
		assert.equal(attr('page'), 'horizontalAlignment');
		assert.equal(attr('button'), 'textWrap');
		assert.equal(attr('text'), 'wordWrap');
	}
});
