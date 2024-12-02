import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	immutable: true,

	html: '<button>1</button> <button>2</button> <button>3</button>',

	test({ assert, target, logs }) {
		assert.deepEqual(logs, [
			'$:1',
			'beforeUpdate:1',
			'$:2',
			'beforeUpdate:2',
			'$:3',
			'beforeUpdate:3',
			'afterUpdate:1',
			'afterUpdate:2',
			'afterUpdate:3',
			'beforeUpdate:1',
			'beforeUpdate:2',
			'beforeUpdate:3'
		]);

		const [button1, button2] = target.querySelectorAll('button');

		logs.length = 0;
		button1.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			'<button>X 1</button> <button>2</button> <button>3</button>'
		);
		assert.deepEqual(logs, ['$:1', 'beforeUpdate:1', 'afterUpdate:1']);

		logs.length = 0;
		button2.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			'<button>X 1</button> <button>X 2</button> <button>3</button>'
		);
		assert.deepEqual(logs, ['$:2', 'beforeUpdate:2', 'afterUpdate:2']);
	}
});
