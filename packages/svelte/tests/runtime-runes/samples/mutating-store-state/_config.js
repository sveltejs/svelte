import { flushSync } from 'svelte';
import { test } from '../../test';

// Test ensures that reading the state that's mutated is done in a manner
// so that the read is untracked so it doesn't trigger infinite loops
export default test({
	html: `
		<input>
		<input>
		<p>text: foo</p>
		<p>wrapped.contents: foo</p>
	`,
	skip_if_ssr: true,

	test({ assert, target }) {
		const [input1, input2] = target.querySelectorAll('input');

		input1.value = 'bar';
		flushSync(() => input1.dispatchEvent(new Event('input')));
		assert.htmlEqual(
			target.innerHTML,
			`
			<input>
			<input>
			<p>text: bar</p>
			<p>wrapped.contents: bar</p>
		`
		);

		input2.value = 'baz';
		flushSync(() => input2.dispatchEvent(new Event('input')));
		assert.htmlEqual(
			target.innerHTML,
			`
			<input>
			<input>
			<p>text: bar</p>
			<p>wrapped.contents: baz</p>
		`
		);

		input1.value = 'foo';
		flushSync(() => input1.dispatchEvent(new Event('input')));
		assert.htmlEqual(
			target.innerHTML,
			`
			<input>
			<input>
			<p>text: foo</p>
			<p>wrapped.contents: foo</p>
		`
		);
	}
});
