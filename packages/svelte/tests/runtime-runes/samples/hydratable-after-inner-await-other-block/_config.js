import { test } from '../../test';

export default test({
	skip_no_async: true,
	skip_mode: ['server'],

	async test({ assert, target }) {
		// `Slow`'s expression resumes after its inner `await` and then waits on `slow` while
		// `Later`'s `{#await}` resolves, which must render normally rather than as if hydrating
		await new Promise((r) => setTimeout(r, 200));

		assert.htmlEqual(target.innerHTML, '<b>later</b><p>x</p>');
	}
});
