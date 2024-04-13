import { test } from '../../test';

export default test({
	mode: ['client', 'hydrate'], // there's no class instance to retrieve in SSR mode
	get props() {
		return { visible: true };
	},

	html: `
		<div>The text is hello</div>
		<h1>hello</h1>
	`,

	async test({ assert, component, target }) {
		component.visible = false;
		assert.htmlEqual(
			target.innerHTML,
			`
			<div>The text is missing</div>
		`
		);

		component.visible = true;
		assert.htmlEqual(
			target.innerHTML,
			`
			<div>The text is hello</div>
			<h1>hello</h1>
		`
		);
	}
});
