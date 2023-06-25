<script>
	import { browser } from '$app/environment';
	import ScreenToggle from '$lib/components/ScreenToggle.svelte';
	import Repl from '@sveltejs/repl';
	import { theme } from '@sveltejs/site-kit/stores';
	import { mapbox_setup, svelteUrl } from '../../../config.js';
	import TableOfContents from './TableOfContents.svelte';

	export let data;

	/** @type {import('@sveltejs/repl').default} */
	let repl;
	let prev;
	let scrollable;
	/** @type {Map<string, {
	 * 	slug: string,
	 * 	section: import('$lib/server/tutorial/types').TutorialSection,
	 * 	chapter: import('$lib/server/tutorial/types').Tutorial,
	 *  prev: { slug: string, section: import('$lib/server/tutorial/types').TutorialSection, chapter: import('$lib/server/tutorial/types').Tutorial }
	 *  next?: { slug: string, section: import('$lib/server/tutorial/types').TutorialSection, chapter: import('$lib/server/tutorial/types').Tutorial }
	 * }>} */
	const lookup = new Map();

	let width = browser ? window.innerWidth : 1000;
	let offset = 0;

	data.tutorials_list.forEach((section) => {
		section.tutorials.forEach((chapter) => {
			const obj = {
				slug: chapter.slug,
				section,
				chapter,
				prev
			};

			lookup.set(chapter.slug, obj);

			if (browser) {
				// pending https://github.com/sveltejs/svelte/issues/2135
				if (prev) prev.next = obj;
				prev = obj;
			}
		});
	});

	// TODO is there a non-hacky way to trigger scroll when chapter changes?
	$: if (scrollable) data.tutorial, scrollable.scrollTo(0, 0);

	$: selected = lookup.get(data.slug);
	$: improve_link = `https://github.com/sveltejs/svelte/tree/master/documentation/tutorial/${data.tutorial.dir}`;

	const clone = (file) => ({
		name: file.name.replace(/.\w+$/, ''),
		type: file.type,
		source: file.content
	});

	$: if (repl) {
		completed = false;
		repl.set({
			files: data.tutorial.initial.map(clone)
		});
	}

	$: mobile = width < 768;

	function reset() {
		repl.set({
			files: data.tutorial.initial.map(clone)
		});

		//! BUG: Fix handleChange on REPL side, setting repl.set doesn't trigger it, and repl.update doesn't even work
		completed = false;
	}

	function complete() {
		repl.set({
			files: data.tutorial.complete.map(clone)
		});

		completed = true;
	}

	let completed = false;

	/** @param {import('svelte').ComponentEvents<Repl>['change']} event */
	function handle_change(event) {
		completed = event.detail.files.every((file, i) => {
			const expected = data.tutorial.complete[i] && clone(data.tutorial.complete[i]);
			return (
				expected &&
				file.name === expected.name &&
				file.type === expected.type &&
				file.source.trim().replace(/\s+$/gm, '') === expected.source.trim().replace(/\s+$/gm, '')
			);
		});
	}
</script>

<svelte:head>
	<title>{selected.section.title} / {selected.chapter.title} • Svelte Tutorial</title>

	<meta name="twitter:title" content="Svelte tutorial" />
	<meta name="twitter:description" content="{selected.section.title} / {selected.chapter.title}" />
	<meta name="Description" content="{selected.section.title} / {selected.chapter.title}" />
</svelte:head>

<svelte:window bind:innerWidth={width} />

<div class="tutorial-outer">
	<div class="viewport offset-{offset}">
		<div class="tutorial-text">
			<div class="table-of-contents">
				<TableOfContents sections={data.tutorials_list} slug={data.slug} {selected} />
			</div>

			<div class="chapter-markup content" bind:this={scrollable}>
				{@html data.tutorial.content}

				<div class="controls">
					{#if data.tutorial.complete.length}
						<!-- TODO disable this button when the contents of the REPL
							matches the expected end result -->
						<button class="show" on:click={() => (completed ? reset() : complete())}>
							{completed ? 'Reset' : 'Show me'}
						</button>
					{/if}

					{#if selected.next}
						<a class="next" href="/tutorial/{selected.next.slug}">Next</a>
					{/if}
				</div>

				<div class="improve-chapter">
					<a class="no-underline" href={improve_link}>Edit this chapter</a>
				</div>
			</div>
		</div>

		<div class="tutorial-repl">
			{#if browser}
				<Repl
					bind:this={repl}
					{svelteUrl}
					orientation={mobile ? 'columns' : 'rows'}
					fixed={mobile}
					on:change={handle_change}
					injectedJS={mapbox_setup}
					relaxed
					previewTheme={$theme.current}
				/>
			{/if}
		</div>
	</div>

	{#if mobile}
		<ScreenToggle bind:offset labels={['tutorial', 'input', 'output']} />
	{/if}
</div>

<style>
	.tutorial-outer {
		position: relative;
		height: calc(100vh - var(--sk-nav-height));
		overflow: hidden;
		padding: 0 0 42px 0;
		box-sizing: border-box;
	}

	.viewport {
		display: grid;
		width: 300%;
		height: 100%;
		grid-template-columns: 33.333% 66.666%;
		transition: transform 0.3s;
		grid-auto-rows: 100%;
	}

	.offset-1 {
		transform: translate(-33.333%, 0);
	}
	.offset-2 {
		transform: translate(-66.666%, 0);
	}

	@media (min-width: 768px) {
		.tutorial-outer {
			padding: 0;
		}

		.viewport {
			width: 100%;
			height: 100%;
			display: grid;
			/* TODO */
			grid-template-columns: minmax(33.333%, 48rem) auto;
			grid-auto-rows: 100%;
			transition: none;
		}

		.offset-1,
		.offset-2 {
			transform: none;
		}
	}

	.tutorial-text {
		display: flex;
		flex-direction: column;
		height: 100%;
		border-right: 1px solid var(--sk-back-4);
		background-color: var(--sk-back-3);
		color: var(--sk-text-2);
	}

	.chapter-markup {
		padding: 3.2rem 4rem;
		overflow: auto;
		flex: 1;
		height: 0;
	}

	.chapter-markup :global(h2) {
		margin: 4rem 0 1.6rem 0;
		font-size: var(--sk-text-m);
		line-height: 1;
		font-weight: 400;
		color: var(--sk-text-2);
	}

	.chapter-markup :global(h2:first-child) {
		margin-top: 0.4rem;
	}

	.chapter-markup :global(a) {
		transition: color 0.2s;
		text-decoration: underline;
		color: var(--sk-text-2);
	}

	.chapter-markup :global(a:hover) {
		color: var(--sk-text-1);
	}

	.chapter-markup :global(ul) {
		padding: 0 0 0 2em;
	}

	.chapter-markup :global(blockquote) {
		background-color: rgba(0, 0, 0, 0.17);
		color: var(--sk-text-2);
	}

	.chapter-markup::-webkit-scrollbar {
		background-color: var(--sk-theme-2);
		width: 8px;
	}

	.chapter-markup::-webkit-scrollbar-thumb {
		background-color: var(--sk-scrollbar);
		border-radius: 1em;
	}

	.chapter-markup :global(p) > :global(code),
	.chapter-markup :global(ul) :global(code) {
		color: var(--sk-code-base);
		background: var(--sk-code-bg);
		padding: 0.2em 0.4em 0.3em;
		white-space: nowrap;
		position: relative;
		top: -0.1em;
	}

	.chapter-markup :global(code) {
		/* padding: 0.4rem; */
		margin: 0 0.2rem;
		top: -0.1rem;
		background: var(--sk-back-4);
	}

	.chapter-markup :global(pre) :global(code) {
		padding: 0;
		margin: 0;
		top: 0;
		background: transparent;
	}

	.chapter-markup :global(pre) {
		margin: 0 0 2rem 0;
		width: 100%;
		max-width: var(--sk-line-max-width);
		padding: 1rem 1rem;
		box-shadow: inset 1px 1px 6px hsla(205.7, 63.6%, 30.8%, 0.06);
		border-radius: 0.5rem;
		--shiki-color-background: var(--sk-back-1);
	}

	.controls {
		border-top: 1px solid rgba(255, 255, 255, 0.15);
		padding: 1em 0 0 0;
		display: flex;
		align-items: center;
	}

	.show {
		background: var(--sk-theme-1);
		padding: 0.3em 0.7em;
		border-radius: var(--sk-border-radius);
		top: 0.1em;
		position: relative;
		font-size: var(--sk-text-s);
		font-weight: 300;
		color: rgba(255, 255, 255, 0.7);
	}

	.show:hover {
		color: white;
	}

	a.next {
		padding-right: 1.2em;
		/* TODO */
		/* background: no-repeat 100% 50% url(@sveltejs/site-kit/icons/arrow-right.svg); */
		background-size: 1em 1em;
		margin-left: auto;
	}

	.improve-chapter {
		padding: 1em 0 0.5em 0;
	}

	.improve-chapter a {
		color: var(--sk-text-2);
		font-size: 14px;
		text-decoration: none;
		opacity: 0.6;
		padding: 0 0.1em 0 1.2em;
	}

	.improve-chapter a::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;

		height: 100%;
		width: 1em;

		background: no-repeat 0 50% url(/icons/edit.svg);
		background-size: 1em 1em;
	}

	@media (prefers-color-scheme: light) {
		.improve-chapter a::before {
			filter: invert(1);
		}
	}

	.improve-chapter a:hover {
		opacity: 1;
	}
</style>
