import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>a</button>
	<button>b</button>
	<button>shift</button>
	<button>pop</button>
`;

// A sync derived that returns a promise, with an abort signal (`$derived(load(x, getAbortSignal()))`), which
// async expressions await. It's evaluated in each batch's view: B evaluates it with A's `x = 1` undone, which mustn't
// abort the promise A's content awaits.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [a, b, shift, pop] = target.querySelectorAll('button');

		a.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['load 1']);

		// B evaluates `p` in its own view, which mustn't abort A's promise
		b.click();
		await tick();
		assert.htmlEqual(target.innerHTML, buttons);
		assert.deepEqual(logs.splice(0), ['load 0']);

		// B's promise
		pop.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<i>0 0</i>`);

		// B committed, so its run of `p` is dropped
		assert.deepEqual(logs.splice(0), ['aborted 0']);

		// A's promise
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1 1</p><i>1 1</i>`);
		assert.deepEqual(logs.splice(0), []);
	}
});
