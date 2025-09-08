import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();
		assert.htmlEqual(target.innerHTML, '<button>toggle</button> <p>foo</p><div>foo</div>');

		const [toggle] = target.querySelectorAll('button');
		toggle.click();
		await tick();
		assert.htmlEqual(target.innerHTML, '<button>toggle</button>');

		toggle.click();
		await tick();
		assert.htmlEqual(target.innerHTML, '<button>toggle</button> <p>foo</p><div>foo</div>');
	}
});
