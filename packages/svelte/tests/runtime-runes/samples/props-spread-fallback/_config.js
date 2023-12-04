import { test } from '../../test';

// Tests that fallback values are kept as long as the prop is not defined in the case of a spread
export default test({
	accessors: false, // so that propA actually becomes $.prop and not $.prop_source
	html: `
		<button>change propA</button>
		<button>change propB</button>
		<p>true fallback</p>
	`,

	async test({ assert, target }) {
		const [propA, propB] = target.querySelectorAll('button');

		await propA.click();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>change propA</button>
				<button>change propB</button>
				<p>false fallback</p>
			`
		);

		await propB.click();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>change propA</button>
				<button>change propB</button>
				<p>false defined</p>
			`
		);

		await propA.click();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>change propA</button>
				<button>change propB</button>
				<p>true defined</p>
			`
		);

		await propB.click();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>change propA</button>
				<button>change propB</button>
				<p>true</p>
			`
		);
	}
});
