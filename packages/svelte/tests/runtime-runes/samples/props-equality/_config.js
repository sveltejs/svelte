import { test } from '../../test';

export default test({
	html: `
		<button>a true</button><button>b true</button>
		<button>a true</button><button>b true</button>
		<button>a true</button><button>b true</button>
	`,

	async test({ assert, target }) {
		let [btn1, _btn2, btn3, _btn4, btn5] = target.querySelectorAll('button');

		await btn1.click();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>a+ true</button><button>b true</button>
			<button>a+ true</button><button>b true</button>
			<button>a+ true</button><button>b true</button>
		`
		);

		[btn1, _btn2, btn3, _btn4, btn5] = target.querySelectorAll('button');
		await btn3.click();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>a++ true</button><button>b true</button>
			<button>a++ true</button><button>b true</button>
			<button>a++ true</button><button>b true</button>
		`
		);

		[btn1, _btn2, btn3, _btn4, btn5] = target.querySelectorAll('button');
		await btn5.click();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>a+++ true</button><button>b true</button>
			<button>a+++ true</button><button>b true</button>
			<button>a+++ true</button><button>b true</button>
		`
		);
	}
});
