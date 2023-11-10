import { test } from '../../test';

export default test({
	html: `
	<button>false</button>
	<button>false</button>
	<button>false</button>
	<p></p>
	`,

	async test({ assert, target }) {
		const [b1, b2, b3] = target.querySelectorAll('button');

		await b1.click();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>true</button>
			<button>false</button>
			<button>false</button>
			<p>1</p>
		`
		);

		await b3.click();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>false</button>
			<button>false</button>
			<button>true</button>
			<p>3</p>
		`
		);

		await b2.click();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>false</button>
			<button>true</button>
			<button>false</button>
			<p>2</p>
		`
		);
	}
});
