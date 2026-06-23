import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ target, assert }) {
		const [update_parent, push] = target.querySelectorAll('button');
		let p_tags = target.querySelectorAll('p');

		assert.equal(p_tags.length, 3);
		assert.equal(p_tags[0].textContent, '1');
		assert.equal(p_tags[1].textContent, '2');
		assert.equal(p_tags[2].textContent, '3');

		flushSync(() => {
			push.click();
		});

		p_tags = target.querySelectorAll('p');

		assert.equal(p_tags.length, 4);
		assert.equal(p_tags[0].textContent, '1');
		assert.equal(p_tags[1].textContent, '2');
		assert.equal(p_tags[2].textContent, '3');
		assert.equal(p_tags[3].textContent, '4');

		flushSync(() => {
			update_parent.click();
		});

		p_tags = target.querySelectorAll('p');

		assert.equal(p_tags.length, 3);
		assert.equal(p_tags[0].textContent, '4');
		assert.equal(p_tags[1].textContent, '5');
		assert.equal(p_tags[2].textContent, '6');
	}
});
