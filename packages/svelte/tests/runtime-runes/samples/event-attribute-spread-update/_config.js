import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target }) {
		const [change, increment] = target.querySelectorAll('button');

		increment.click();
		flushSync();
		assert.htmlEqual(target.innerHTML, '<button>change handlers</button><button>1 / 1</button>');

		change.click();
		flushSync();
		increment.click();
		flushSync();
		assert.htmlEqual(target.innerHTML, '<button>change handlers</button><button>3 / 3</button>');
	}
});
