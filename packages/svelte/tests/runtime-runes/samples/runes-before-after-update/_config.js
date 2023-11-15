import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: '<button>0</button>',

	async test({ assert, target, component }) {
		const [btn] = target.querySelectorAll('button');
		flushSync(() => {
			btn.click();
		});
		assert.deepEqual(component.log, ['beforeUpdate', 'afterUpdate']);
		assert.htmlEqual(target.innerHTML, `<button>1</button>`);
	}
});
