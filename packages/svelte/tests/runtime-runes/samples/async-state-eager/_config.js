import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [count, shift] = target.querySelectorAll('button');

		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `<button>0</button><button>shift</button><p>0</p>`);

		count.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `<button>1</button><button>shift</button><p>0</p>`);

		count.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `<button>2</button><button>shift</button><p>0</p>`);

		count.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `<button>3</button><button>shift</button><p>0</p>`);

		// the three updates all write `count` and therefore share the async
		// work — they are merged into a single batch, in which the first two
		// in-flight runs are superseded. Only resolving the final run commits
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `<button>3</button><button>shift</button><p>0</p>`);

		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `<button>3</button><button>shift</button><p>0</p>`);

		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `<button>3</button><button>shift</button><p>3</p>`);
	}
});
