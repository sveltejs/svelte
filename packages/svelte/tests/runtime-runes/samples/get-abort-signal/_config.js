import { test } from '../../test';

export default test({
	html: `<button>increment</button><p>loading...</p>`,

	async test({ assert, target, variant, logs }) {
		await new Promise((f) => setTimeout(f, 50));

		if (variant === 'hydrate') {
			assert.deepEqual(logs, [
				'aborted',
				'StaleReactionError',
				'The reaction that called `getAbortSignal()` was re-run or destroyed'
			]);
		}

		logs.length = 0;

		const [button] = target.querySelectorAll('button');

		await new Promise((f) => setTimeout(f, 50));
		assert.htmlEqual(target.innerHTML, '<button>increment</button><p>0</p>');

		button.click();
		await new Promise((f) => setTimeout(f, 50));
		assert.htmlEqual(target.innerHTML, '<button>increment</button><p>2</p>');

		assert.deepEqual(logs, [
			'aborted',
			'StaleReactionError',
			'The reaction that called `getAbortSignal()` was re-run or destroyed'
		]);
	}
});
