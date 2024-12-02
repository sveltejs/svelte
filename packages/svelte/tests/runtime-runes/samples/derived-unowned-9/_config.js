import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		let [btn1, btn2] = target.querySelectorAll('button');

		btn1.click();
		btn2.click();

		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`<button>a</button><button>b</button><div>1</div>\ndouble:\n2`
		);

		btn1.click();
		btn2.click();

		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`<button>a</button><button>b</button><div>2</div>\ndouble:\n4`
		);

		btn1.click();

		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`<button>a</button><button>b</button><div>3</div>\ndouble:\n6`
		);

		btn1.click();

		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`<button>a</button><button>b</button><div>4</div>\ndouble:\n8`
		);

		btn1.click();

		flushSync();

		assert.htmlEqual(target.innerHTML, `<button>a</button><button>b</button><div>5</div>`);

		btn1.click();

		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`<button>a</button><button>b</button><div>6</div>\ndouble:\n12`
		);

		btn1.click();

		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`<button>a</button><button>b</button><div>7</div>\ndouble:\n14`
		);
	}
});
