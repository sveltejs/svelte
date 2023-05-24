import { writable } from 'svelte/store';

export default {
	html: `
		<p>undefined</p>
	`,
	async test({ assert, component, target }) {
		component.store = writable('foo');
		assert.htmlEqual(
			target.innerHTML,
			`
			<p>foo</p>
		`
		);
		component.store = undefined;
		assert.htmlEqual(
			target.innerHTML,
			`
			<p>undefined</p>
		`
		);
		component.store = writable('bar');
		assert.htmlEqual(
			target.innerHTML,
			`
			<p>bar</p>
		`
		);
	}
};
