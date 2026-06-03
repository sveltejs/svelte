import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [show, commit] = target.querySelectorAll('button');

		show.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>show</button>
				<button>commit</button>
				<button>discard</button>
			`
		);

		commit.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>show</button>
				<button>commit</button>
				<button>discard</button>
				failed
			`
		);
	}
});
