import { flushSync } from 'svelte';
import { ok, test } from '../../test';

let ascending = `
<button>reverse</button>
<p>1</p>
<p>(1)</p>
<p>2</p>
<p>(2)</p>
<p>3</p>
<p>(3)</p>
`;

let descending = `
<button>reverse</button>
<p>3</p>
<p>(3)</p>
<p>2</p>
<p>(2)</p>
<p>1</p>
<p>(1)</p>
`;

export default test({
	html: ascending,

	async test({ assert, target }) {
		const btn = target.querySelector('button');
		ok(btn);

		flushSync(() => btn.click());
		assert.htmlEqual(target.innerHTML, descending);

		flushSync(() => btn.click());
		assert.htmlEqual(target.innerHTML, ascending);

		flushSync(() => btn.click());
		assert.htmlEqual(target.innerHTML, descending);

		flushSync(() => btn.click());
		assert.htmlEqual(target.innerHTML, ascending);
	}
});
