import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<div>Hello World</div>
		<div>Hello World</div>
	`,

	test({ assert, component, target }) {
		component.update_value('Hi Svelte');
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<div>Hi Svelte</div>
			<div>Hi Svelte</div>
		`
		);
	}
});
