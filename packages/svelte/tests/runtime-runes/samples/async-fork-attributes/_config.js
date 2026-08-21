import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [fork, commit] = target.querySelectorAll('button');

		fork.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>fork</button>
			<button>commit</button>
			<p style="">foo</p>
			<p style="">foo</p>
			<p>foo</p>
		`
		);

		commit.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>fork</button>
			<button>commit</button>
			<p style="color: red;">foo</p>
			<p style="color: red;" data-attached=true>foo</p>
			<p data-attached=true>foo</p>
		`
		);

		fork.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>fork</button>
			<button>commit</button>
			<p style="color: red;">foo</p>
			<p style="color: red;" data-attached=true>foo</p>
			<p data-attached=true>foo</p>
		`
		);

		commit.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>fork</button>
			<button>commit</button>
			<p style="">foo</p>
			<p style="">foo</p>
			<p>foo</p>
		`
		);
	}
});
