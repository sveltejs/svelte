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
	}

	.tutorial-repl {

	}

	.table-of-contents {
		background-color: white;
	}

	.chapter-markup {
		padding: 1em;
		overflow: auto;
		flex: 1;
		height: 0;
	}

	.chapter-markup :global(h2) {
		font-size: var(--h3);
		color: var(--second);
		margin: 3.2rem 0 1.6rem 0;
		line-height: 1;
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
		TODO add the REPL
	</div>

</div>
