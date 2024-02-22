import { tick } from 'svelte';
import { test } from '../../test';

/** @param {number | null} selected */
function get_html(selected) {
	return `
		<button>1</button>
		<button>2</button>
		<button>3</button>

		<hr></hr>

		${selected !== null ? `<div>${selected}</div>` : ''}

		<hr></hr>

		<p>${selected ?? '...'}</p>
	`;
}

export default test({
	html: get_html(null),

	async test({ assert, target }) {
		const [btn1, btn2, btn3] = target.querySelectorAll('button');

		await btn1?.click();
		await tick();
		assert.htmlEqual(target.innerHTML, get_html(1));

		await btn2?.click();
		await tick();
		assert.htmlEqual(target.innerHTML, get_html(2));

		await btn1?.click();
		await tick();
		assert.htmlEqual(target.innerHTML, get_html(1));

		await btn3?.click();
		await tick();
		assert.htmlEqual(target.innerHTML, get_html(3));
	}
});
