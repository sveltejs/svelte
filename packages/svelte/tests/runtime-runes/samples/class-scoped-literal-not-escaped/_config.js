import { test } from '../../test';

export default test({
	test({ assert, target }) {
		const spans = target.querySelectorAll('span');

		assert.deepEqual(
			Array.from(spans, (span) => span.className),
			[
				'b [&>*]:a [&[data-x="y"]]:b a<b svelte-70s021',
				'b [&>*]:a svelte-70s021 active',
				'b [&>*]:a svelte-70s021'
			]
		);
	}
});
