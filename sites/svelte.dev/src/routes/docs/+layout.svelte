<script>
	import { page } from '$app/stores';
	import Contents from './Contents.svelte';
	import { TSToggle } from '@sveltejs/site-kit/components';

	export let data;

	$: title = data.sections
		.find(({ pages }) => pages.find(({ path }) => path === $page.url.pathname))
		?.pages.find(({ path }) => path === $page.url.pathname).title;
</script>

<div class="container">
	<div class="page content">
		{#if title}
			<h1>{title}</h1>
		{/if}

		<slot />
	</div>

	<div class="toc-container">
		<Contents contents={data.sections} />
	</div>

	<div class="ts-toggle">
		<TSToggle />
	</div>
</div>

<style>
	.container {
		--sidebar-menu-width: 28rem;
		--sidebar-width: var(--sidebar-menu-width);
		--ts-toggle-height: 4.2rem;
	}

	.page {
		--on-this-page-display: none;
		padding: var(--sk-page-padding-top) var(--sk-page-padding-side);
	}

	.page :global(hr) {
		display: none;
	}

	.page :global(:where(h2, h3) code) {
		all: unset;
	}

	/* .content {
		width: 100%;
		margin: 0;
		padding: var(--sk-page-padding-top) var(--sk-page-padding-side);
		tab-size: 2;
		-moz-tab-size: 2;
	} */

	@media (min-width: 832px) {
		/* can't use vars in @media :( */
		.content {
			padding-left: calc(var(--sidebar-width) + var(--sk-page-padding-side));
		}
	}

	/* .content :global(h2[id])::after {
		content: '';
		position: absolute;
		width: 100%;
		left: 0;
		top: 8rem;
		height: 2px;
		background: #ddd;
	} */

	.toc-container {
		background: var(--sk-back-3);
	}

	.ts-toggle {
		width: 100%;
		border-top: 1px solid var(--sk-back-4);
		background-color: var(--sk-back-3);
	}

	@media (min-width: 832px) {
		.toc-container {
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

		.ts-toggle {
			position: fixed;
			width: var(--sidebar-width);
			bottom: 0;
			z-index: 1;
			margin-right: 0;
			border-right: 1px solid var(--sk-back-5);
		}
	}

	@media (min-width: 1200px) {
		.container {
			--sidebar-width: max(28rem, 23vw);
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
