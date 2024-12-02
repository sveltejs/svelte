import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: '<input> <input> <input>',
	ssrHtml: '<input value="Blub"> <input value="Blub"> <input value="Blub">',

	test({ assert, target, component, window }) {
		const [input1, input2, inputFallback] = target.querySelectorAll('input');

		// TODO this works differently now, deduplicates to one subscription - ok?
		// assert.equal(component.getSubscriberCount(), 3);

		input1.value = 'a';
		input1.dispatchEvent(new window.Event('input'));
		flushSync();
		input1.value = 'ab';
		input1.dispatchEvent(new window.Event('input'));
		flushSync();
		assert.equal(input1.value, 'ab');
		assert.equal(input2.value, 'ab');
		assert.equal(inputFallback.value, 'ab');

		component.props = 'hello';

		assert.htmlEqual(
			target.innerHTML,
			`
			<input> hello
			<input> hello
			<input>
			`
		);

		component.fallback = 'world';
		assert.htmlEqual(
			target.innerHTML,
			`
			<input> hello
			<input> hello
			<input> world
		`
		);
	}
});
