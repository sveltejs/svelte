import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();
		const [count1, count2, resolve] = target.querySelectorAll('button');

		count1.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>count1: 0</button><button>count2: 0</button><button>resolve</button><p>0</p>'
		);

		count2.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>count1: 0</button><button>count2: 1</button><button>resolve</button><p>0</p>'
		);

		count2.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>count1: 0</button><button>count2: 2</button><button>resolve</button><p>0</p>'
		);

		count2.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>count1: 0</button><button>count2: 2</button><button>resolve</button><p>0</p>'
		);

		resolve.click();
		await tick();
		resolve.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>count1: 1</button><button>count2: 3</button><button>resolve</button><p>1</p><p>1nested</p>'
		);
	}
});
