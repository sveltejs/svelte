<script>
	import { page } from '$app/stores';
	import { DocsContents } from '@sveltejs/site-kit/docs';

	export let data;

	$: title = $page.data.page?.title;
</script>

<div class="container">
	<div class="toc-container" style="order: 1">
		<DocsContents contents={data.sections} />
	</div>

	<div class="page content">
		{#if title}
			<h1>{title}</h1>
		{/if}

		<slot />
	</div>
</div>

<style>
	.container {
		--sidebar-menu-width: 28rem;
		--sidebar-width: var(--sidebar-menu-width);
		--ts-toggle-height: 4.2rem;

		display: flex;
		flex-direction: column;
	}

	.page {
		--on-this-page-display: none;
		padding: var(--sk-page-padding-top) var(--sk-page-padding-side);

		min-width: 0 !important;
	}

	.page :global(:where(h2, h3) code) {
		all: unset;
	}

	@media (min-width: 832px) {
		.content {
			padding-left: calc(var(--sidebar-width) + var(--sk-page-padding-side));
		}
	}

	.toc-container {
		background: var(--sk-back-3);
		display: none;
	}

	@media (min-width: 832px) {
		.toc-container {
			display: block;
			width: var(--sidebar-width);
			height: calc(100vh - var(--sk-nav-height));
			position: fixed;
			left: 0;
			top: var(--sk-nav-height);
			overflow-x: hidden;
			overflow-y: auto;
		}

		.toc-container::before {
			content: '';
			position: fixed;
			width: 0;
			height: 100%;
			top: 0;
			left: calc(var(--sidebar-width) - 1px);
			border-right: 1px solid var(--sk-back-5);
		}

		.page {
			padding-left: calc(var(--sidebar-width) + var(--sk-page-padding-side));
		}
	}

	@media (min-width: 1200px) {
		.container {
			--sidebar-width: max(28rem, 23vw);
			flex-direction: row;
		}

		.page {
			--on-this-page-display: block;
			padding: var(--sk-page-padding-top) calc(var(--sidebar-width) + var(--sk-page-padding-side));
			margin: 0 auto;
			max-width: var(--sk-line-max-width);
			box-sizing: content-box;
		}
	}
</style>
