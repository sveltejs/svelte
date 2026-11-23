import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>preload</button>
	<button>reveal</button>
	<button>hide</button>
	<button>commit</button>
`;

export default test({
	async test({ assert, target }) {
		const [preload, reveal, hide, commit] = target.querySelectorAll('button');

		preload.click();
		reveal.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`${buttons}<b>0</b><p>constant</p><p>keyed</p><p>boundary</p>`
		);

		hide.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<b>0</b>`);

		// The remaining fork write must not resurrect its obsolete branch selection.
		commit.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<b>1</b>`);
	}
});
