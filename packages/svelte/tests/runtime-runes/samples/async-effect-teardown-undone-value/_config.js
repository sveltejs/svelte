import { tick } from 'svelte';
import { test } from '../../test';

const buttons = '<button>increment</button><button>show</button><button>shift</button>';

// The `x` write waits for async work. In the meantime, another batch commits and creates the effect,
// in a view of the world that undoes the `x` write. So when the first batch commits and destroys the
// effect, its teardown sees the old value — even though the effect never read `x`, and the write
// happened before it ran
export default test({
	async test({ assert, target, logs }) {
		const [increment, show, shift] = target.querySelectorAll('button');

		shift.click();
		await tick();

		increment.click();
		await tick();

		show.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p><p>child</p>`);
		assert.deepEqual(logs, ['effect']);

		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1</p>`);
		assert.deepEqual(logs, ['effect', 'teardown: x=0']);
	}
});
