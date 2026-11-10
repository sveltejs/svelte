import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [x, shift] = target.querySelectorAll('button');
		assert.htmlEqual(target.innerHTML, '<button>x</button><button>shift</button><p>0 0</p>');
		assert.deepEqual(logs.splice(0), ['load 0']);

		x.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['load 1']);

		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, '<button>x</button><button>shift</button><p>1 1</p>');
	}
});
