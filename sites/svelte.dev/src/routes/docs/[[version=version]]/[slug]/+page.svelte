<script>
	import { page } from '$app/stores';
	import { Icon } from '@sveltejs/site-kit/components';
	import { copy_code_descendants } from '@sveltejs/site-kit/actions';
	import { DocsOnThisPage, setupDocsHovers } from '@sveltejs/site-kit/docs';

	export let data;

	$: pages = data.sections.flatMap((section) => section.pages);
	$: index = pages.findIndex(({ path }) => path === $page.url.pathname);
	$: prev = pages[index - 1];
	$: next = pages[index + 1];

	setupDocsHovers();
</script>

<svelte:head>
	<title>{data.page?.title} • Docs • Svelte</title>

	<meta name="twitter:title" content="{data.page.title} • Docs • Svelte" />
	<meta name="twitter:description" content="{data.page.title} • Svelte documentation" />
	<meta name="Description" content="{data.page.title} • Svelte documentation" />
</svelte:head>

<div class="text" id="docs-content" use:copy_code_descendants>
	<a
		class="edit"
		href="https://github.com/sveltejs/svelte/edit/master/documentation/docs/{data.page.file}"
	>
		<Icon size={50} name="edit" /> Edit this page on GitHub
	</a>

	<DocsOnThisPage details={data.page} />

	{@html data.page.content}
</div>

<div class="controls">
	<div>
		<span class:faded={!prev}>previous</span>

		{#if prev}
			<a href={prev.path}>{prev.title}</a>
		{/if}
	</div>

	<div>
		<span class:faded={!next}>next</span>
		{#if next}
			<a href={next.path}>{next.title}</a>
		{/if}
	</div>
</div>

<style>
	.edit {
		position: relative;
		font-size: 1.4rem;
		line-height: 1;
		z-index: 2;
	}

	.edit :global(.icon) {
		position: relative;
		top: -0.1rem;
		left: 0.3rem;
		width: 1.4rem;
		height: 1.4rem;
		margin-right: 0.5rem;
	}

	.controls {
		max-width: calc(var(--sk-line-max-width) + 1rem);
		border-top: 1px solid var(--sk-back-4);
		padding: 1rem 0 0 0;
		display: grid;
		grid-template-columns: 1fr 1fr;
		margin: 6rem 0 0 0;
	}

	.controls > :first-child {
		text-align: left;
	}

	.controls > :last-child {
		text-align: right;
	}

	.controls span {
		display: block;
		font-size: 1.2rem;
		text-transform: uppercase;
		font-weight: 600;
		color: var(--sk-text-3);
	}

	.controls span.faded {
		opacity: 0.4;
	}
</style>
