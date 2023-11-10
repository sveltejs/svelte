import { test } from '../../test';
import { writable } from 'svelte/store';

export default test({
	html: `
		<p></p>
	`,
	async test({ assert, component, target }) {
		component.store = writable('foo');
		assert.htmlEqual(
			target.innerHTML,
			`
			<p>foo</p>
		`
		);
	}
});
