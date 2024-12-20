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

		<button>update</button>
	`,
	test({ assert, target }) {
		const button = target.querySelector('button');

		button?.click();

		assert.htmlEqual(
			target.innerHTML,
			`
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

				<button>update</button>
			`
		);
	}
});
