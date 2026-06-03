import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<div class="foo svelte-owbekl"></div>
		<div class="foo svelte-owbekl"></div>
		<div class="foo svelte-owbekl"></div>
		<div class="foo svelte-owbekl"></div>
		<div class="foo svelte-owbekl"></div>

		<div class="foo">child</div>
		<div class="foo">child</div>
		<div class="foo">child</div>
		<div class="foo">child</div>
		<div class="foo">child</div>

		<applied-to-custom-element class="foo svelte-owbekl"></applied-to-custom-element>

		<button>update</button>
	`,
	test({ assert, target }) {
		const button = target.querySelector('button');

		button?.click();
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
				<div class="foo svelte-owbekl"></div>
				<div class="foo svelte-owbekl"></div>
				<div class="bar svelte-owbekl"></div>
				<div class="bar svelte-owbekl"></div>
				<div class="foo svelte-owbekl"></div>

				<div class="foo">child</div>
				<div class="foo">child</div>
				<div class="bar">child</div>
				<div class="bar">child</div>
				<div class="foo">child</div>

				<applied-to-custom-element class="bar svelte-owbekl"></applied-to-custom-element>

				<button>update</button>
			`
		);
	}
});
