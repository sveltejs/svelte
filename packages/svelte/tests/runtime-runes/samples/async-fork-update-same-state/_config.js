import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		assert.deepEqual(logs, [0]);

		const [fork1, fork2, commit] = target.querySelectorAll('button');

		fork1.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>fork 1</button>
			<button>fork 2</button>
			<button>commit</button>
			<p>0</p>
		`
		);
		assert.deepEqual(logs, [0]);

		fork2.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>fork 1</button>
			<button>fork 2</button>
			<button>commit</button>
			<p>0</p>
		`
		);
		assert.deepEqual(logs, [0]);

		commit.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>fork 1</button>
			<button>fork 2</button>
			<button>commit</button>
			<p>1</p>
		`
		);
		assert.deepEqual(logs, [0, 1]);
	}
});
