<script context="module">
	export async function preload({ params }) {
		const chapter = await this.fetch(`tutorial/${params.slug}.json`).then(r => r.json());

		return {
			slug: params.slug,
			chapter
		};
	}
</script>

<script>
	import TableOfContents from './_components/TableOfContents.svelte';
	import Icon from '../../../components/Icon.svelte';
	import Repl from '../../../components/Repl/index.svelte';
	import { getContext } from 'svelte';

	export let slug;
	export let chapter;

	const { sections } = getContext('tutorial');

	const lookup = new Map();
	let prev;

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

	$: selected = lookup.get(slug);

	$: app = {
		components: chapter.files,
		values: {}
	};
</script>

<style>
	.tutorial-outer {
		position: relative;
		height: calc(100vh - var(--nav-h));
		overflow: hidden;
		padding: 0;
		margin: 0 calc(var(--side-nav) * -1);
		box-sizing: border-box;
		display: grid;
		grid-template-columns: 400px 1fr;
	}

	.tutorial-text {
		display: flex;
		flex-direction: column;
		height: 100%;
		border-right: 1px solid var(--second);
		background-color: var(--second);
		color: white;
	}

	.tutorial-repl {

	}

	.table-of-contents {

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

	.chapter-markup :global(blockquote) {
		background-color: rgba(255,255,255,0.1);
		color: white;
	}

	/* .chapter-markup::-webkit-scrollbar-track {
		background-color: var(--second);
		width: 4px;
	} */

	.chapter-markup::-webkit-scrollbar {
		background-color: var(--second);
		width: 8px;
	}

	.chapter-markup::-webkit-scrollbar-thumb {
		background-color: rgba(255,255,255,0.7);
		border-radius: 1em;
		outline: 1px solid green;
	}

	.chapter-markup :global(p) > :global(code) {
		color: white;
		background: rgba(255,255,255,0.1);
		padding: 0.2em 0.4em;
		white-space: nowrap;
	}

	.chapter-markup :global(pre) :global(code) {
		/* color: var(--text); */
	}

	.next {
		display: block;
		text-align: right;
	}
</style>

<div class="tutorial-outer">
	<div class="tutorial-text">
		<div class="table-of-contents">
			<TableOfContents {sections} {slug} {selected}/>
		</div>

		<div class="chapter-markup">
			{@html chapter.html}

			{#if selected.next}
				<a class="next" href="tutorial/{selected.next.slug}">Next <Icon name="arrow-right" /></a>
			{/if}
		</div>
	</div>

	<div class="tutorial-repl">
		<Repl {app}/>
	</div>

</div>
