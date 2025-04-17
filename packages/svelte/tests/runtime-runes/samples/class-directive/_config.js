import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
	<div class="svelte-tza1s0"></div>
	<span></span>
	<div class="svelte-tza1s0"><span class="svelte-tza1s0"></span></div>

	<div class="foo svelte-tza1s0"></div>
	<span class="foo"></span>
	<div class="svelte-tza1s0"><span class="foo svelte-tza1s0"></span></div>


	<div class="foo svelte-tza1s0 bar"></div>
	<span class="foo bar"></span>
	<div class="svelte-tza1s0"><span class="foo svelte-tza1s0 bar"></span></div>

	<div class="svelte-tza1s0"></div>
	<span></span>
	<div class="svelte-tza1s0"><span class="svelte-tza1s0"></span></div>

	<div class="svelte-tza1s0 bar"></div>
	<span class="bar"></span>
	<div class="svelte-tza1s0"><span class="svelte-tza1s0 bar"></span></div>

	<div class="football svelte-tza1s0 bar"></div>
	<span class="football bar"></span>
	<div class="svelte-tza1s0"><span class="football svelte-tza1s0 bar"></span></div>

	<div class="svelte-tza1s0 bar not-foo"></div>
	<span class="bar not-foo"></span>
	<div class="svelte-tza1s0"><span class="svelte-tza1s0 bar not-foo"></span></div>

	`,
	test({ assert, target, component }) {
		component.foo = true;
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<div class="svelte-tza1s0"></div>
			<span></span>
			<div class="svelte-tza1s0"><span class="svelte-tza1s0"></span></div>

			<div class="foo svelte-tza1s0"></div>
			<span class="foo"></span>
			<div class="svelte-tza1s0"><span class="foo svelte-tza1s0"></span></div>

			<div class="foo svelte-tza1s0 bar"></div>
			<span class="foo bar"></span>
			<div class="svelte-tza1s0"><span class="foo svelte-tza1s0 bar"></span></div>

			<div class="svelte-tza1s0 foo"></div>
			<span class="foo"></span>
			<div class="svelte-tza1s0"><span class="svelte-tza1s0 foo"></span></div>

			<div class="svelte-tza1s0 bar foo"></div>
			<span class="bar foo"></span>
			<div class="svelte-tza1s0"><span class="svelte-tza1s0 bar foo"></span></div>

			<div class="football svelte-tza1s0 bar foo"></div>
			<span class="football bar foo"></span>
			<div class="svelte-tza1s0"><span class="football svelte-tza1s0 bar foo"></span></div>

			<div class="svelte-tza1s0 bar foo"></div>
			<span class="bar foo"></span>
			<div class="svelte-tza1s0"><span class="svelte-tza1s0 bar foo"></span></div>
			`
		);

		component.bar = false;
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<div class="svelte-tza1s0"></div>
			<span></span>
			<div class="svelte-tza1s0"><span class="svelte-tza1s0"></span></div>

			<div class="foo svelte-tza1s0"></div>
			<span class="foo"></span>
			<div class="svelte-tza1s0"><span class="foo svelte-tza1s0"></span></div>

			<div class="foo svelte-tza1s0"></div>
			<span class="foo"></span>
			<div class="svelte-tza1s0"><span class="foo svelte-tza1s0"></span></div>

			<div class="svelte-tza1s0 foo"></div>
			<span class="foo"></span>
			<div class="svelte-tza1s0"><span class="svelte-tza1s0 foo"></span></div>

			<div class="svelte-tza1s0 foo"></div>
			<span class="foo"></span>
			<div class="svelte-tza1s0"><span class="svelte-tza1s0 foo"></span></div>

			<div class="football svelte-tza1s0 foo"></div>
			<span class="football foo"></span>
			<div class="svelte-tza1s0"><span class="football svelte-tza1s0 foo"></span></div>

			<div class="svelte-tza1s0 foo"></div>
			<span class="foo"></span>
			<div class="svelte-tza1s0"><span class="svelte-tza1s0 foo"></span></div>
			`
		);

		component.foo = false;
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<div class="svelte-tza1s0"></div>
			<span></span>
			<div class="svelte-tza1s0"><span class="svelte-tza1s0"></span></div>

			<div class="foo svelte-tza1s0"></div>
			<span class="foo"></span>
			<div class="svelte-tza1s0"><span class="foo svelte-tza1s0"></span></div>

			<div class="foo svelte-tza1s0"></div>
			<span class="foo"></span>
			<div class="svelte-tza1s0"><span class="foo svelte-tza1s0"></span></div>

			<div class="svelte-tza1s0"></div>
			<span class=""></span>
			<div class="svelte-tza1s0"><span class="svelte-tza1s0"></span></div>

			<div class="svelte-tza1s0"></div>
			<span class=""></span>
			<div class="svelte-tza1s0"><span class="svelte-tza1s0"></span></div>

			<div class="football svelte-tza1s0"></div>
			<span class="football"></span>
			<div class="svelte-tza1s0"><span class="football svelte-tza1s0"></span></div>

			<div class="svelte-tza1s0 not-foo"></div>
			<span class="not-foo"></span>
			<div class="svelte-tza1s0"><span class="svelte-tza1s0 not-foo"></span></div>
			`
		);
	}
});
