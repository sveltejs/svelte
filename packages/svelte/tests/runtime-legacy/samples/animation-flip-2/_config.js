import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	async test({ assert, target, window }) {
		const button = target.querySelector('button');
		ok(button);

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>Remove last</button><div class="list"><label><input type="checkbox">
			write
			some
			docs</label><label><input type="checkbox">
			start
			writing
			JSConf
			talk</label><label><input type="checkbox">
			buy
			some
			milk</label><label><input type="checkbox">
			mow
			the
			lawn</label><label><input type="checkbox">
			feed
			the
			turtle</label><label><input type="checkbox">
			fix
			some
			bugs</label></div>`
		);

		flushSync(() => {
			button.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>Remove last</button><div class="list"><label><input type="checkbox">
			write
			some
			docs</label><label><input type="checkbox">
			start
			writing
			JSConf
			talk</label><label><input type="checkbox">
			buy
			some
			milk</label><label><input type="checkbox">
			mow
			the
			lawn</label><label><input type="checkbox">
			feed
			the
			turtle</label></div>`
		);
	}
});
