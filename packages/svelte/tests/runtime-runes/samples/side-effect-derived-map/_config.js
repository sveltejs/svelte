import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true,
		runes: true
	},

	test({ assert, target }) {
		const [button1, button2, button3, button4, button5, button6, button7, button8] =
			target.querySelectorAll('button');

		assert.throws(() => {
			button1?.click();
			flushSync();
		}, /state_unsafe_mutation/);

		assert.doesNotThrow(() => {
			button2?.click();
			flushSync();
		});

		assert.throws(() => {
			button3?.click();
			flushSync();
		}, /state_unsafe_mutation/);

		assert.doesNotThrow(() => {
			button4?.click();
			flushSync();
		});

		assert.throws(() => {
			button5?.click();
			flushSync();
		}, /state_unsafe_mutation/);

		assert.doesNotThrow(() => {
			button6?.click();
			flushSync();
		});

		assert.throws(() => {
			button7?.click();
			flushSync();
		}, /state_unsafe_mutation/);

		assert.doesNotThrow(() => {
			button8?.click();
			flushSync();
		});
	}
});
