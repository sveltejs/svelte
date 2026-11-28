import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	ssrHtml: `
		<form>
			<input value="initial">
			<input value="initial">
			<input value="initial">
			<input value="initial">
			<input value="initial">
			<button type="reset">reset</button>
		</form>
		<button type="button">change default</button>
		<output>initial</output>
	`,

	async test({ assert, target }) {
		const inputs = target.querySelectorAll('input');
		const [reset, change_default] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		await Promise.resolve();
		assert.deepEqual(
			Array.from(inputs, (input) => input.value),
			['initial', 'initial', 'initial', 'initial', 'initial']
		);
		assert.deepEqual(
			Array.from(inputs, (input) => input.defaultValue),
			['', 'explicit', 'default', 'default', 'default']
		);

		for (const input of inputs) {
			input.value = 'edited';
		}

		reset.click();
		await Promise.resolve();
		flushSync();

		assert.deepEqual(
			Array.from(inputs, (input) => input.value),
			['', 'explicit', 'default', 'default', 'default']
		);
		assert.equal(output.innerHTML, 'default');

		change_default.click();
		flushSync();

		assert.deepEqual(
			Array.from(inputs, (input) => input.value),
			['', 'explicit', 'default', 'default', 'default']
		);
		assert.deepEqual(
			Array.from(inputs, (input) => input.defaultValue),
			['', 'explicit', 'changed', 'changed', 'changed']
		);

		reset.click();
		await Promise.resolve();
		flushSync();

		assert.deepEqual(
			Array.from(inputs, (input) => input.value),
			['', 'explicit', 'changed', 'changed', 'changed']
		);
		assert.equal(output.innerHTML, 'changed');
	}
});
