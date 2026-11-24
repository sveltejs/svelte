import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `<button>fork</button><button>show</button><button>commit</button>`;

export default test({
	async test({ assert, target }) {
		const [fork, show, commit] = target.querySelectorAll('button');

		fork.click();
		await tick();

		show.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p>`);

		commit.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<span>two</span><p>2</p>`);
	}
});
