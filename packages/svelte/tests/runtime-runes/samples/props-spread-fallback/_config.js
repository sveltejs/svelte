import { flushSync } from 'svelte';
import { test } from '../../test';

// Tests that fallback values are kept as long as the prop is not defined in the case of a spread
export default test({
	accessors: false, // so that propA actually becomes $.prop and not $.prop_source
	html: `
		<button>change propA</button>
		<button>change propB</button>
		<p>true fallback</p>
	`,

	test({ assert, target }) {
		const [propA, propB] = target.querySelectorAll('button');

		propA.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>change propA</button>
				<button>change propB</button>
				<p>false fallback</p>
			`
		);

		propB.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>change propA</button>
				<button>change propB</button>
				<p>false defined</p>
			`
		);

		propA.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>change propA</button>
				<button>change propB</button>
				<p>true defined</p>
			`
		);

		propB.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>change propA</button>
				<button>change propB</button>
				<p>true fallback</p>
			`
		);
	}
});
