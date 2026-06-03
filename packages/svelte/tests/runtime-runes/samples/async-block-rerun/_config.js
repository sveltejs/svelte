import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [override, release, resolve] = target.querySelectorAll('button');

		resolve.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>override</button>
				<button>release</button>
				<button>resolve</button>
				<p>before</p>
				<p>before</p>
			`
		);

		override.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>override</button>
				<button>release</button>
				<button>resolve</button>
				<p>during</p>
				<p>during</p>
			`
		);

		release.click();
		await tick();

		resolve.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>override</button>
				<button>release</button>
				<button>resolve</button>
				<p>after</p>
				<p>after</p>
			`
		);
	}
});
