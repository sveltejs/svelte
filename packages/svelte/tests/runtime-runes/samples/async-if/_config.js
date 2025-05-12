import { flushSync, tick } from 'svelte';
import { deferred } from '../../../../src/internal/shared/utils.js';
import { test } from '../../test';

/** @type {ReturnType<typeof deferred>} */
let d;

export default test({
	html: `<button>reset</button><button>true</button><button>false</button><p>pending</p>`,

	get props() {
		d = deferred();

		return {
			promise: d.promise
		};
	},

	async test({ assert, target }) {
		const [reset, t, f] = target.querySelectorAll('button');

		flushSync(() => t.click());
		await Promise.resolve();
		await Promise.resolve();
		await tick();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			'<button>reset</button><button>true</button><button>false</button><h1>yes</h1>'
		);

		flushSync(() => reset.click());
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>reset</button><button>true</button><button>false</button><h1>yes</h1>'
		);

		flushSync(() => f.click());
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>reset</button><button>true</button><button>false</button><h1>no</h1>'
		);
	}
});
