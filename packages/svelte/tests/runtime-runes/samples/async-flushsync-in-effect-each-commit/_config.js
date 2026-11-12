import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target, logs }) {
		const [go, add] = target.querySelectorAll('button');

		go.click();
		flushSync();

		assert.htmlEqual(target.innerHTML, '<button>go</button> <button>add</button> <p>1</p><p>2</p>');
		assert.deepEqual(logs, ['effect', 'effect']);

		// the each block was committed inside the effect's `flushSync`,
		// which must not make its collection a dependency of the effect
		add.click();
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			'<button>go</button> <button>add</button> <p>1</p><p>2</p><p>3</p>'
		);
		assert.deepEqual(logs, ['effect', 'effect']);
	}
});
