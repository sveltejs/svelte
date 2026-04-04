import { flushSync } from 'svelte';
import { HMR } from 'svelte/internal/client';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true,
		hmr: true
	},

	html: `
		<div data-id="a"><button>count: 0</button></div>
		<div data-id="b"><button>count: 0</button></div>
		<div data-id="c"><button>count: 0</button></div>
	`,

	test({ assert, target, mod }) {
		const buttons = target.querySelectorAll('button');

		// Give each counter a distinct value: a=1, b=2, c=3
		flushSync(() => buttons[0]?.click()); // a=1
		flushSync(() => buttons[1]?.click()); // b=1
		flushSync(() => buttons[1]?.click()); // b=2
		flushSync(() => buttons[2]?.click()); // c=1
		flushSync(() => buttons[2]?.click()); // c=2
		flushSync(() => buttons[2]?.click()); // c=3

		assert.htmlEqual(
			target.innerHTML,
			`
			<div data-id="a"><button>count: 1</button></div>
			<div data-id="b"><button>count: 2</button></div>
			<div data-id="c"><button>count: 3</button></div>
			`
		);

		// HMR swap on the parent — children should preserve their
		// state in the correct order (a=1, b=2, c=3), not shuffled.
		const hmr_data = mod.default[HMR];
		const fake_incoming = /** @type {any} */ ({ [HMR]: { fn: hmr_data.fn, current: null } });
		hmr_data.update(fake_incoming);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<div data-id="a"><button>count: 1</button></div>
			<div data-id="b"><button>count: 2</button></div>
			<div data-id="c"><button>count: 3</button></div>
			`
		);
	}
});
