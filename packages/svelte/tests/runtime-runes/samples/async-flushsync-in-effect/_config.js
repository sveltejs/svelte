import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();

		const [increment, shift] = target.querySelectorAll('button');

		increment.click();
		await tick();

		assert.htmlEqual(target.innerHTML, '<button>clicks: 0</button><button>shift</button> 0');

		shift.click();
		await tick();

		assert.htmlEqual(target.innerHTML, '<button>clicks: 1</button><button>shift</button> 1');

		shift.click();
		await tick();

		assert.htmlEqual(target.innerHTML, '<button>clicks: 2</button><button>shift</button> 2');
	}
});
