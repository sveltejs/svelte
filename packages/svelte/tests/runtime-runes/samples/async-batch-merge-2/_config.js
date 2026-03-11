import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();
		const [count1, count2, both, resolve] = target.querySelectorAll('button');

		count1.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>count1: 0</button><button>count2: 0</button><button>both</button><button>resolve</button><p>0</p>'
		);

		count2.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>count1: 0</button><button>count2: 1</button><button>both</button><button>resolve</button><p>0</p>'
		);

		resolve.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>count1: 1</button><button>count2: 1</button><button>both</button><button>resolve</button><p>1</p>'
		);

		count1.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>count1: 1</button><button>count2: 1</button><button>both</button><button>resolve</button><p>1</p>'
		);

		both.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>count1: 1</button><button>count2: 1</button><button>both</button><button>resolve</button><p>1</p>'
		);

		resolve.click();
		resolve.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>count1: 3</button><button>count2: 2</button><button>both</button><button>resolve</button><p>3</p>'
		);
	}
});
