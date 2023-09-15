<script>
	import { Icon } from '@sveltejs/site-kit/components';
	import { DocsOnThisPage, setupDocsHovers } from '@sveltejs/site-kit/docs';
	import Pagination from './Pagination.svelte';

	export let data;
	export let version;

	setupDocsHovers();
</script>

<svelte:head>
	<title>{data.page?.title} • Docs • Svelte</title>

	<meta name="twitter:title" content="{data.page.title} • Docs • Svelte" />
	<meta name="twitter:description" content="{data.page.title} • Svelte documentation" />
	<meta name="Description" content="{data.page.title} • Svelte documentation" />
</svelte:head>

<div class="text" id="docs-content">
	<a
		class="edit"
		href="https://github.com/sveltejs/svelte/edit/master/documentation/docs/{version}/{data.page.file}"
	>
		<Icon size={50} name="edit" /> Edit this page on GitHub
	</a>

	<DocsOnThisPage details={data.page} />

	{@html data.page.content}
</div>

{#if version !== 5}
	<Pagination pages={data.sections.flatMap((section) => section.pages)} />
{/if}

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
</style>
