import { test } from '../../test';

const tick = () => new Promise((r) => setTimeout(r, 0));

// Regression test for https://github.com/sveltejs/svelte/issues/18546
// A render-phase effect ($effect.pre) that calls flushSync() causes a batch to
// be dropped after its roots were populated, leaving ancestor effects marked
// not-CLEAN but owned by no batch. Every subsequent schedule() then hits the
// "branch is already dirty, bail" path and traverses nothing, permanently
// killing the reactivity of the whole root. Only reproduces with `dev: false`.
//
// NOTE: step2 must rely on the natural (microtask) flush — wrapping it in
// flushSync() rescues the orphaned batch and masks the bug.
export default test({
	mode: ['client'],

	compileOptions: {
		dev: false
	},

	async test({ assert, target }) {
		const [step1, step2] = target.querySelectorAll('button');

		// step1: enter "restoring" (render-phase flushSync) + switch item to B.
		// step1's own handler calls flushSync(), so this settles synchronously.
		step1?.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>step1</button><button>step2</button><p>shown=B</p>'
		);

		// step2: switch item to C, relying on the natural async flush.
		step2?.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>step1</button><button>step2</button><p>shown=C</p>'
		);
	}
});
