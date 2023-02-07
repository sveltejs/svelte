<script>
	import { page } from '$app/stores';
	import Contents from './Contents.svelte';
	import '@sveltejs/site-kit/styles/code.css';

	/** @type {import('./$types').LayoutServerData}*/
	export let data;
</script>

<div class="container">
	<div class="page content">
		<h1>{data.sections.find((val) => val.path === $page.url.pathname)?.title}</h1>
		<slot />
	</div>

	<div class="toc-container">
		<Contents contents={data.sections} />
	</div>
</div>

<style>
	.container {
		--sidebar-menu-width: 20rem;
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

	.content {
		width: 100%;
		margin: 0;
		padding: var(--sk-page-padding-top) var(--sk-page-padding-side);
		tab-size: 2;
		-moz-tab-size: 2;
	}

	@media (min-width: 832px) {
		/* can't use vars in @media :( */
		.content {
			padding-left: calc(var(--sidebar-width) + var(--sk-page-padding-side));
		}
	}

	.content :global(h1) {
		font-size: 3.2rem;
		margin: 0 0 0.5em 0;
	}

	.content :global(h2) {
		margin-top: 8rem;
		padding: 2rem 1.6rem 2rem 0.2rem;
		border-bottom: 1px solid hsl(0, 0%, 87%, 0.2);
		line-height: 1;
		font-size: var(--sk-text-m);
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}

	.content :global(section):first-of-type > :global(h2) {
		margin-top: 0;
	}

	.content :global(h4) {
		margin: 2em 0 1em 0;
	}

	.content :global(.offset-anchor) {
		position: relative;
		display: block;
		top: calc(-1 * var(--sk-page-padding-top));
		width: 0;
		height: 0;
	}

	.content :global(.anchor) {
		position: absolute;
		display: block;
		background: url(../icons/link.svg) 0 50% no-repeat;
		background-size: 1em 1em;
		width: 1.4em;
		height: 1em;
		left: -1.3em;
		bottom: 0.3rem;
		opacity: 0;
		transition: opacity 0.2s;
		user-select: none;
	}

	.content :global(h2) :global(.anchor) {
		bottom: 4rem;
	}

	.content :global(h3) :global(.anchor) {
		bottom: 1rem;
	}

	@media (min-width: 400px) {
		.content :global(h1) {
			font-size: 4.2rem;
		}
	}

	@media (min-width: 768px) {
		.content :global(h1) {
			font-size: 5.4rem;
		}

		.content :global(.anchor:focus),
		.content :global(h2):hover :global(.anchor),
		.content :global(h3):hover :global(.anchor),
		.content :global(h4):hover :global(.anchor),
		.content :global(h5):hover :global(.anchor),
		.content :global(h6):hover :global(.anchor) {
			opacity: 1;
		}
	}

	.content :global(h3),
	.content :global(h3 > code) {
		margin: 6.4rem 0 1rem 0;
		padding: 0 0 1rem 0;
		color: var(--sk-text-2);
		max-width: var(--sk-line-max-width);
		border-bottom: 1px solid hsl(0, 0%, 87%, 0.2);
		background: transparent;
		line-height: 1;
	}

	.content :global(h3):first-child {
		border: none;
		margin: 0;
	}

	/* avoid doubled border-top */
	.content :global(h3 > code) {
		border-radius: 0 0 0 0;
		border: none;
		font-size: inherit;
	}

	.content :global(h4),
	.content :global(h4 > code) {
		font-family: inherit;
		font-weight: 600;
		font-size: 2.4rem;
		color: var(--sk-text-2);
		margin: 6.4rem 0 1.6rem 0;
		padding-left: 0;
		background: transparent;
		line-height: 1;
		padding-top: 0;
		top: 0;
	}

	.content :global(h4::before) {
		display: inline;
		content: ' ';
		block-size: var(--sk-nav-height);
		margin-block-start: calc(-1 * var(--sk-nav-height));
	}

	.content :global(h4 > em) {
		opacity: 0.7;
	}

	.content :global(h4 > .anchor) {
		top: 0.05em;
	}

	.content :global(h5) {
		font-size: 2.4rem;
		margin: 2em 0 0.5em 0;
	}

	.content :global(code) {
		padding: 0.4rem;
		margin: 0 0.2rem;
		top: -0.1rem;
		background: var(--sk-back-4);
	}

	.content :global(pre) :global(code) {
		padding: 0;
		margin: 0;
		top: 0;
		background: transparent;
	}

	.content :global(pre) {
		margin: 0 0 2rem 0;
		width: 100%;
		max-width: var(--sk-line-max-width);
		padding: 1rem 1rem;
		box-shadow: inset 1px 1px 6px hsla(205.7, 63.6%, 30.8%, 0.06);
	}

	.content :global(.icon) {
		width: 2rem;
		height: 2rem;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
		fill: none;
	}

	.content :global(table) {
		margin: 0 0 2em 0;
	}

	.content :global(section) :global(p) {
		max-width: var(--sk-line-max-width);
		margin: 1em 0;
	}

	.content :global(small) {
		font-size: var(--sk-text-s);
		float: right;
		pointer-events: all;
		color: var(--sk-theme-1);
		cursor: pointer;
	}

	.content :global(blockquote) {
		color: var(--sk-text-1);
		background-color: rgba(255, 62, 0, 0.1);
		border-left: 4px solid var(--sk-theme-1-variant);
		padding: 1rem;
	}

	.content :global(blockquote) :global(:first-child) {
		margin-top: 0;
	}

	.content :global(blockquote) :global(:last-child) {
		margin-bottom: 0;
	}

	.content :global(blockquote) :global(code) {
		background: var(--sk-code-bg);
	}

	.content :global(section) :global(a):hover {
		text-decoration: underline;
	}

	.content :global(section) :global(a) :global(code) {
		color: inherit;
		background: rgba(255, 62, 0, 0.1) !important;
	}

	/* this replaces the offset-anchor hack, which we should remove from this CSS
	   once https://github.com/sveltejs/action-deploy-docs/issues/1 is closed */
	.content :global(h2[id]),
	.content :global(h3[id]) {
		padding-top: 10rem;
		margin-top: -2rem;
		border-top: none;
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
	/* 
	.ts-toggle {
		width: 100%;
		border-top: 1px solid var(--sk-back-4);
		background-color: var(--sk-back-3);
	} */

	@media (min-width: 832px) {
		.toc-container {
			width: var(--sidebar-width);
			height: calc(100vh - var(--sk-nav-height) - var(--ts-toggle-height));
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

		/* .ts-toggle {
			position: fixed;
			width: var(--sidebar-width);
			bottom: 0;
			z-index: 1;
			margin-right: 0;
			border-right: 1px solid var(--sk-back-5);
		} */
	}

	@media (min-width: 1200px) {
		.container {
			--sidebar-width: max(20rem, 18vw);
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
