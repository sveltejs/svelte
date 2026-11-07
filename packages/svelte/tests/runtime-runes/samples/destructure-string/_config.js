import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: '<button>update</button><p>J.D.</p><p>J: 2</p><p>J.D.</p><p>J.D.</p><p>J: D</p>',

	test({ assert, target }) {
		const button = target.querySelector('button');

		flushSync(() => button?.click());
		assert.htmlEqual(
			target.innerHTML,
			'<button>update</button><p>J.D.</p><p>J: 2</p><p>𝟘.𝟙.</p><p>𝟘.𝟙.</p><p>𝟘: 𝟙,𝟚</p>'
		);
	}
});
