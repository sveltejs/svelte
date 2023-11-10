import { test } from '../../test';
import { writable } from 'svelte/store';

export default test({
	html: `
		<p></p>
	`,
	test({ assert, component, target }) {
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
			<p></p>
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
});
