<script context="module">
	export async function preload({ params }) {
		const res = await this.fetch(`tutorial/${params.slug}.json`);

		if (!res.ok) {
			return this.redirect(301, `tutorial/basics`);
		}

		return {
			slug: params.slug,
			chapter: await res.json()
		};
	}
</script>

<script>
	import TableOfContents from './_components/TableOfContents.svelte';
	import Icon from '../../../components/Icon.svelte';
	import Repl from '@sveltejs/svelte-repl';
	import { getContext } from 'svelte';

	export let slug;
	export let chapter;

	const { sections } = getContext('tutorial');

	let repl;
	let prev;
	let scrollable;
	const lookup = new Map();

	sections.forEach(section => {
		section.chapters.forEach(chapter => {
			const obj = {
				slug: chapter.slug,
				section,
				chapter,
				prev
			};

			lookup.set(chapter.slug, obj);

			if (process.browser) { // pending https://github.com/sveltejs/svelte/issues/2135
				if (prev) prev.next = obj;
				prev = obj;
			}
		});
	});

	// TODO is there a non-hacky way to trigger scroll when chapter changes?
	$: if (scrollable) chapter, scrollable.scrollTo(0, 0);

	// TODO: this will need to be changed to the master branch, and probably should be dynamic instead of included
	//   here statically
	const tutorial_repo_link = 'https://github.com/sveltejs/svelte/tree/master/site/content/tutorial';

	$: selected = lookup.get(slug);
	$: improve_link = `${tutorial_repo_link}/${selected.chapter.section_dir}/${selected.chapter.chapter_dir}`;

	const clone = file => ({
		name: file.name,
		type: file.type,
		source: file.source
	});

	$: if (repl) {
		completed = false;
		repl.set({
			components: chapter.app_a.map(clone)
		});
	}

	function reset() {
		repl.update({
			components: chapter.app_a.map(clone)
		});
	}

	function complete() {
		repl.update({
			components: chapter.app_b.map(clone)
		});
	}

	let completed = false;

	function handle_change(event) {
		completed = event.detail.components.every((file, i) => {
			const expected = chapter.app_b[i];
			return expected && (
				file.name === expected.name &&
				file.type === expected.type &&
				file.source.trim().replace(/\s+$/gm, '') === expected.source.trim().replace(/\s+$/gm, '')
			);
		});
	}

	const svelteUrl = `https://unpkg.com/svelte@beta`;
	const rollupUrl = `https://unpkg.com/rollup@1/dist/rollup.browser.js`;

	// needed for context API tutorial
	const mapbox_setup = `window.MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;`;
</script>

<style>
	.tutorial-outer {
		position: relative;
		height: calc(100vh - var(--nav-h));
		overflow: hidden;
		padding: 0;
		/* margin: 0 calc(var(--side-nav) * -1); */
		box-sizing: border-box;
		display: grid;
		grid-template-columns: minmax(33.333%, 480px) auto;
		grid-auto-rows: 100%;
	}

	.tutorial-text {
		display: flex;
		flex-direction: column;
		height: 100%;
		border-right: 1px solid var(--second);
		background-color: var(--second);
		color: white;
	}

	.chapter-markup {
		padding: 1em;
		overflow: auto;
		flex: 1;
		height: 0;
	}

	.chapter-markup :global(h2) {
		font-size: var(--h3);
		margin: 3.2rem 0 1.6rem 0;
		line-height: 1;
		color: white;
	}

	.chapter-markup :global(a) {
		text-decoration: underline;
	}

	.chapter-markup :global(ul) {
		padding: 0 0 0 2em;
	}

	.chapter-markup :global(blockquote) {
		background-color: rgba(255,255,255,0.1);
		color: white;
	}

	.chapter-markup::-webkit-scrollbar {
		background-color: var(--second);
		width: 8px;
	}

	.chapter-markup::-webkit-scrollbar-thumb {
		background-color: rgba(255,255,255,0.7);
		border-radius: 1em;
		outline: 1px solid green;
	}

	.chapter-markup :global(p) > :global(code),
	.chapter-markup :global(ul) :global(code) {
		color: white;
		background: rgba(255,255,255,0.1);
		padding: 0.2em 0.4em;
		white-space: nowrap;
	}

	.controls {
		border-top: 1px solid rgba(255,255,255,0.1);
		padding: 1em 0 0 0;
		display: flex;
	}

	.show {
		text-transform: uppercase;
		background: rgba(255,255,255,0.1);
		padding: 0.2em 0.7em;
		border-radius: 2em;
		top: 0.1em;
		position: relative;
		font-size: var(--h5);
		font-weight: 300;
	}

	.show:hover {
		background: rgba(255,255,255,0.2);
	}

	a.next {
		margin-left: auto;
	}

	.improve-chapter {
		padding: 1em 0 .5em 0;
	}

	.improve-chapter a {
		font-size: 14px;
		text-decoration: none;
		opacity: 0.3;
		padding: 0 0.1em;
	}

	.improve-chapter a:hover {
		opacity: 1;
	}
</style>

<svelte:head>
	<title>{selected.section.title} / {selected.chapter.title} • Svelte Tutorial</title>
</svelte:head>

<div class="tutorial-outer">
	<div class="tutorial-text">
		<div class="table-of-contents">
			<TableOfContents {sections} {slug} {selected}/>
		</div>

		<div class="chapter-markup" bind:this={scrollable}>
			{@html chapter.html}

			<div class="controls">
				{#if chapter.app_b}
					<!-- TODO disable this button when the contents of the REPL
						matches the expected end result -->
					<button class="show" on:click="{() => completed ? reset() : complete()}">
						{completed ? 'Reset' : 'Show me'}
					</button>
				{/if}

				{#if selected.next}
					<a class="next" href="tutorial/{selected.next.slug}">Next <Icon name="arrow-right" /></a>
				{/if}
			</div>

			<div class="improve-chapter">
				<a href={improve_link}><Icon name="edit" size={14}/> Edit this chapter</a>
			</div>
		</div>
	</div>

	<div class="tutorial-repl">
		<Repl
			bind:this={repl}
			{svelteUrl}
			{rollupUrl}
			orientation="rows"
			on:change={handle_change}
			setup={mapbox_setup}
			relaxed
		/>
	</div>
</div>
