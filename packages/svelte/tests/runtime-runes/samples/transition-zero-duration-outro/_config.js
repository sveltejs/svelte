import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, raf, target }) {
		const [button] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		assert.htmlEqual(
			output.innerHTML,
			`
				<p>should fade out</p>
				<p>should disappear immediately</p>
				<p>should disappear after delay</p>
				<p>should tick immediately</p>
			`
		);

		flushSync(() => {
			button.click();
		});

		assert.htmlEqual(
			output.innerHTML,
			`
				<p style="opacity: 1;">should fade out</p>
				<p style="opacity: 0;">should disappear immediately</p>
				<p>should disappear after delay</p>
				<p data-t="0">should tick immediately</p>
			`
		);

		raf.tick(100);

		assert.htmlEqual(
			output.innerHTML,
			`
				<p style="opacity: 0.9;">should fade out</p>
				<p style="opacity: 0;">should disappear immediately</p>
				<p style="opacity: 0;">should disappear after delay</p>
				<p data-t="0">should tick immediately</p>
			`
		);

		// toggling back before the timed outro finishes aborts and resets the zero-duration outros
		flushSync(() => {
			button.click();
		});

		assert.htmlEqual(
			output.innerHTML,
			`
				<p style="">should fade out</p>
				<p style="">should disappear immediately</p>
				<p style="">should disappear after delay</p>
				<p data-t="1">should tick immediately</p>
			`
		);

		// toggling off again and letting the timed outro finish removes everything
		flushSync(() => {
			button.click();
		});

		assert.htmlEqual(
			output.innerHTML,
			`
				<p style="opacity: 1;">should fade out</p>
				<p style="opacity: 0;">should disappear immediately</p>
				<p style="">should disappear after delay</p>
				<p data-t="0">should tick immediately</p>
			`
		);

		raf.tick(1100);

		assert.htmlEqual(output.innerHTML, '');
	}
});
