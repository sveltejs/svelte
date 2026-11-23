import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `<button>preload</button><button>other</button><button>commit</button>`;

// If a fork is auto-discarded it should not throw on user-commit.
export default test({
	mode: ['client'],
	async test({ assert, target }) {
		const [preload, other, commit] = target.querySelectorAll('button');

		preload.click();
		await tick();
		other.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>true 1</p>`);

		commit.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>true 1</p>`);
	}
});
