import { flushSync, tick } from 'svelte';
import { test } from '../../test';

// This test counts mutations on hydration
// set_class() should not mutate class on hydration, except if mismatch
export default test({
	mode: ['server', 'hydrate'],

	server_props: {
		browser: false
	},

	props: {
		browser: true
	},

	html: `
		<main id="main" class="browser">
			<div class="custom svelte-1cjqok6 foo bar" title="a title"></div>
			<span class="svelte-1cjqok6 foo bar"></span>
			<b class="custom foo bar"></b>
			<i class="foo bar"></i>

			<div class="custom svelte-1cjqok6 foo bar" title="a title"></div>
			<span class="svelte-1cjqok6 foo bar"></span>
			<b class="custom foo bar"></b>
			<i class="foo bar"></i>
		</main>
	`,

	ssrHtml: `
		<main id="main">
			<div class="custom svelte-1cjqok6 foo bar" title="a title"></div>
			<span class="svelte-1cjqok6 foo bar"></span>
			<b class="custom foo bar"></b>
			<i class="foo bar"></i>

			<div class="custom svelte-1cjqok6 foo bar" title="a title"></div>
			<span class="svelte-1cjqok6 foo bar"></span>
			<b class="custom foo bar"></b>
			<i class="foo bar"></i>
		</main>
	`,

	async test({ target, assert, component, instance }) {
		flushSync();
		tick();
		assert.deepEqual(instance.get_and_clear_mutations(), ['MAIN']);

		component.foo = false;
		flushSync();
		tick();
		assert.deepEqual(
			instance.get_and_clear_mutations(),
			['DIV', 'SPAN', 'B', 'I', 'DIV', 'SPAN', 'B', 'I'],
			'first mutation'
		);

		assert.htmlEqual(
			target.innerHTML,
			`
			<main id="main" class="browser">
				<div class="custom svelte-1cjqok6 bar" title="a title"></div>
				<span class="svelte-1cjqok6 bar"></span>
				<b class="custom bar"></b>
				<i class="bar"></i>

				<div class="custom svelte-1cjqok6 bar" title="a title"></div>
				<span class="svelte-1cjqok6 bar"></span>
				<b class="custom bar"></b>
				<i class="bar"></i>
			</main>
			`
		);

		component.foo = true;
		flushSync();
		assert.deepEqual(
			instance.get_and_clear_mutations(),
			['DIV', 'SPAN', 'B', 'I', 'DIV', 'SPAN', 'B', 'I'],
			'second mutation'
		);

		assert.htmlEqual(
			target.innerHTML,
			`
			<main id="main" class="browser">
				<div class="custom svelte-1cjqok6 bar foo" title="a title"></div>
				<span class="svelte-1cjqok6 bar foo"></span>
				<b class="custom bar foo"></b>
				<i class="bar foo"></i>

				<div class="custom svelte-1cjqok6 bar foo" title="a title"></div>
				<span class="svelte-1cjqok6 bar foo"></span>
				<b class="custom bar foo"></b>
				<i class="bar foo"></i>
			</main>
			`
		);

		component.classname = 'another';
		flushSync();
		assert.deepEqual(
			instance.get_and_clear_mutations(),
			['DIV', 'B', 'DIV', 'B'],
			'class mutation'
		);

		assert.htmlEqual(
			target.innerHTML,
			`
			<main id="main" class="browser">
				<div class="another svelte-1cjqok6 foo bar" title="a title"></div>
				<span class="svelte-1cjqok6 bar foo"></span>
				<b class="another foo bar"></b>
				<i class="bar foo"></i>

				<div class="another svelte-1cjqok6 foo bar" title="a title"></div>
				<span class="svelte-1cjqok6 bar foo"></span>
				<b class="another foo bar"></b>
				<i class="bar foo"></i>
			</main>
			`
		);
	}
});
