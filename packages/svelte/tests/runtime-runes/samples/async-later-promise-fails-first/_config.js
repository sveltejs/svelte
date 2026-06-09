import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();
		const [increment, pop] = target.querySelectorAll('button');

		increment.click();
		await tick();
		increment.click();
		await tick();
		increment.click();
		await tick();
		pop.click();
		await tick();
		assert.htmlEqual(target.innerHTML, '<button>increment</button><button>pop</button> failed');

		pop.click();
		await tick();
		pop.click();
		await tick();
		assert.htmlEqual(target.innerHTML, '<button>increment</button><button>pop</button> failed');
	}
});
