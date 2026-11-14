import { tick } from 'svelte';
import { test } from '../../test';

// A fork's write to a dependency of an assigned derived doesn't make the assignment
// outdated in the real world, where the dependency didn't change
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [assign, f, discard, log] = target.querySelectorAll('button');

		assign.click();
		await tick();

		f.click();
		await tick();

		log.click();
		await tick();
		assert.deepEqual(logs, ['d 100']);

		discard.click();
		await tick();

		log.click();
		await tick();
		assert.deepEqual(logs, ['d 100', 'd 100']);
		assert.htmlEqual(
			target.innerHTML,
			'<button>assign</button><button>fork</button><button>discard</button><button>log</button><p>100</p>'
		);
	}
});
