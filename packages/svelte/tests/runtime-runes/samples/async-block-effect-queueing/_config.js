import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [fork, commit, toggle] = target.querySelectorAll('button');

		fork.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>fork</button>
			<button>commit</button>
			<button>toggle</button>
		`
		);

		toggle.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>fork</button>
			<button>commit</button>
			<button>toggle <span>A</span></button>
		`
		);

		toggle.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>fork</button>
			<button>commit</button>
			<button>toggle</button>
		`
		);

		toggle.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>fork</button>
			<button>commit</button>
			<button>toggle <span>A</span></button>
		`
		);

		commit.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>fork</button>
			<button>commit</button>
			B
		`
		);
	}
});
