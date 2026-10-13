import { tick } from 'svelte';
import { test } from '../../test';

const buttons =
	'<button>X</button><button>Y</button><button>Z</button><button>W</button><button>resolve e</button><button>resolve x1</button>';

export default test({
	async test({ assert, target, logs }) {
		await tick();
		const [X, Y, Z, W, resolve_e, resolve_x1] = target.querySelectorAll('button');

		assert.htmlEqual(target.innerHTML, `<p>n = 0</p><p>x = 0</p>${buttons}`);

		// X is deferred on its own await
		X.click();
		await tick();
		// Y is deferred on the await inside the new branch
		Y.click();
		await tick();
		// Z hides that branch again, merges into Y, which merges into X
		Z.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `<p>n = 0</p><p>x = 0</p>${buttons}`);
		assert.deepEqual(logs, ['delay x0', 'delay x1', 'delay e']);

		// the branch's await resolves while it is hidden
		resolve_e.click();
		await tick();
		// W shows the branch again and merges into X
		W.click();
		await tick();

		// nothing is pending any more, so X commits
		resolve_x1.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `<p>n = 4</p><p>x = 1</p><p>cond: e</p>${buttons}`);
	}
});
