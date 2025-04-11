import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<ul>
			<li>Gruyere</li>
			<li>Compté</li>
			<li>Beaufort</li>
			<li>Abondance</li>
		</ul>
	`,

	test({ assert, component, target }) {
		component.swap(0, 1);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<ul>
				<li>Compté</li>
				<li>Gruyere</li>
				<li>Beaufort</li>
				<li>Abondance</li>
			</ul>
		`
		);
	}
});
