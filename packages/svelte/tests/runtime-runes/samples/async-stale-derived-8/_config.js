import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [increment, pop] = target.querySelectorAll('button');

		increment.click();
		await tick();
		increment.click();
		await tick();
		pop.click();
		await tick();
		assert.htmlEqual(target.innerHTML, '<button>increment</button><button>pop</button> 2 2 1'); // showing nothing here yet would also be ok

		pop.click();
		await tick();
		assert.htmlEqual(target.innerHTML, '<button>increment</button><button>pop</button> 2 2 1');
	}
});
