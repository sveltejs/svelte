import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	async test({ assert, target }) {
		const [fork] = target.querySelectorAll('button');

		fork.click();
		await tick();

		assert.htmlEqual(target.innerHTML, '<button>fork</button><button>false</button>');

		const [, toggle] = target.querySelectorAll('button');

		toggle.click();
		await tick();

		assert.htmlEqual(target.innerHTML, '<button>fork</button><button>true</button>');
	}
});
