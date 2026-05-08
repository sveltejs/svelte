import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();
		const [one, two, both, resolve] = target.querySelectorAll('button');

		one.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>count1: 0</button><button>count2: 0</button><button>both</button><button>resolve</button> 0'
		);

		two.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>count1: 0</button><button>count2: 1</button><button>both</button><button>resolve</button> 0'
		);

		resolve.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>count1: 1</button><button>count2: 1</button><button>both</button><button>resolve</button> 1'
		);

		one.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>count1: 1</button><button>count2: 1</button><button>both</button><button>resolve</button> 1'
		);

		both.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>count1: 1</button><button>count2: 1</button><button>both</button><button>resolve</button> 1'
		);

		two.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>count1: 1</button><button>count2: 1</button><button>both</button><button>resolve</button> 1'
		);

		resolve.click();
		resolve.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>count1: 3</button><button>count2: 3</button><button>both</button><button>resolve</button> 3'
		);
	}
});
