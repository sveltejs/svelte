import { flushSync } from '../../../../src/index-client.js';
import { test } from '../../test';

export default test({
	html: `
		<button>a</button>
		<button>b</button>

		<p>1</p>
		<p>2</p>
		<p>3</p>
		<p>4</p>
		<p>5</p>
	`,

	test({ assert, component, target, raf }) {
		const [btn1, btn2] = target.querySelectorAll('button');

		flushSync(() => btn1.click());
		raf.tick(500);

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>a</button>
				<button>b</button>

				<p>1</p>
				<p>2</p>
				<p style="transform: translate(100px, 0);">3</p>
				<p style="transform: translate(100px, 0);">4</p>
				<p>5</p>
			`
		);

		flushSync(() => btn2.click());
		raf.tick(750);

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>a</button>
				<button>b</button>

				<p>1</p>
				<p>2</p>
				<p style="transform: translate(50px, 0);">3</p>
				<p style="transform: translate(150px, 0);">4</p>
				<p style="transform: translate(50px, 0);">5</p>
			`
		);

		raf.tick(1000);

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>a</button>
				<button>b</button>

				<p>1</p>
				<p>2</p>
				<p style="transform: translate(0px, 0);">3</p>
				<p style="transform: translate(200px, 0);">4</p>
				<p style="transform: translate(100px, 0);">5</p>
			`
		);

		raf.tick(1500);

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>a</button>
				<button>b</button>

				<p>1</p>
				<p>2</p>
				<p style="transform: translate(0px, 0);">3</p>
			`
		);
	}
});
