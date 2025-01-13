import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client', 'hydrate'],

	html: `
		<span>3</span>
		<span>2</span>
		<span>1</span>
	`,

	test({ assert, component, target }) {
		component.list.update();
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<span>1</span>
			<span>2</span>
			<span>3</span>
			<span>4</span>
			<span>5</span>
		`
		);
	}
});
