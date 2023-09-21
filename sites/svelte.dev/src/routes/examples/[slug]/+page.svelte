<!-- FIXME sometimes it adds a trailing slash when landing -->
<script>
	// @ts-check
	import { navigating } from '$app/stores';
	import ScreenToggle from '$lib/components/ScreenToggle.svelte';
	import Repl from '@sveltejs/repl';
	import { theme } from '@sveltejs/site-kit/stores';
	import { mapbox_setup, svelteUrl } from '../../../config';
	import TableOfContents from './TableOfContents.svelte';

	export let data;

	/** @type {number} */
	let width;
	let offset = 1;
	/** @type {import('@sveltejs/repl').default} */
	let repl;

	const clone = (file) => ({
		name: file.name.replace(/.\w+$/, ''),
		type: file.type,
		source: file.content
	});

	$: mobile = width < 768; // note: same as per media query below
	/** @type {'columns' | 'rows'} */
	$: replOrientation = mobile || width > 1080 ? 'columns' : 'rows';

	$: repl && repl.set({ files: data.example.files.map(clone) });
</script>

<svelte:head>
	<title>{data.example?.title} {data.example?.title ? '•' : ''} Svelte Examples</title>

	<meta name="twitter:title" content="Svelte examples" />
	<meta name="twitter:description" content="Cybernetically enhanced web apps" />
	<meta name="Description" content="Interactive example Svelte apps" />
</svelte:head>

<h1 class="visually-hidden">Examples</h1>
<div class="examples-container" bind:clientWidth={width}>
	<div class="viewport offset-{offset}">
		<TableOfContents
			sections={data.examples_list}
			active_section={data.example?.slug}
			isLoading={!!$navigating}
		/>
		<div class="repl-container" class:loading={$navigating}>
			<Repl
				bind:this={repl}
				{svelteUrl}
				orientation={replOrientation}
				fixed={mobile}
				relaxed
				injectedJS={mapbox_setup}
				previewTheme={$theme.current}
			/>
		</div>
	</div>
	{#if mobile}
		<ScreenToggle bind:offset labels={['index', 'input', 'output']} />
	{/if}
</div>

<style>
	.examples-container {
		position: relative;
		height: calc(100vh - var(--sk-nav-height) - var(--sk-banner-bottom-height));
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

	.repl-container.loading {
		opacity: 0.6;
	}

	/* temp fix for #2499 and #2550 while waiting for a fix for https://github.com/sveltejs/svelte-repl/issues/8 */

	.repl-container :global(.tab-content),
	.repl-container :global(.tab-content.visible) {
		pointer-events: all;
		opacity: 1;
	}
	.repl-container :global(.tab-content) {
		visibility: hidden;
	}
	.repl-container :global(.tab-content.visible) {
		visibility: visible;
	}

	.offset-1 {
		transform: translate(-33.333%, 0);
	}
	.offset-2 {
		transform: translate(-66.666%, 0);
	}

	@media (min-width: 768px) {
		.examples-container {
			padding: 0;
		}

		.viewport {
			width: 100%;
			height: 100%;
			display: grid;
			/* TODO */
			grid-template-columns: 36rem auto;
			grid-auto-rows: 100%;
			transition: none;
		}

		.offset-1,
		.offset-2 {
			transform: none;
		}
	}
</style>
