<!-- FIXME sometimes it adds a trailing slash when landing -->
<script context="module">
	export async function preload({params, query}) {
		const sections = await this.fetch(`examples.json`).then(r => r.json());
		const title_by_slug = sections.reduce((acc, {examples}) => {
			examples.forEach(({slug, title}) => {
				acc[slug] = title;
			});

			return acc;
		}, {});

		return {sections, title_by_slug};
	}
</script>

<script>
	import { onMount } from 'svelte';
	import { goto } from '@sapper/app';
	import Repl from '@sveltejs/svelte-repl';

	import ScreenToggle from '../../components/ScreenToggle.svelte';
	import {
		mapbox_setup, // needed for context API example
		rollupUrl,
		svelteUrl
	} from '../../config';
	import { process_example } from '../../utils/examples';
	import { getFragment } from '../../utils/navigation';
	import TableOfContents from './_TableOfContents.svelte';

	export let sections;
	export let title_by_slug;

	let active_slug;
	let width;
	let offset = 1;
	let repl;

	$: title = title_by_slug[active_slug] || '';
	$: first_slug = sections[0].examples[0].slug;
	$: if (repl) {
		fetch(`examples/${active_slug}.json`)
		.then(async response => {
			if (response.ok) {
				const data = await response.json();

				repl.set({
					components: process_example(data.files)
				});
			}
		});
	}
	$: mobile = width < 768; // note: same as per media query below

	onMount(() => {
		const onhashchange = () => {
			active_slug = getFragment();
			offset = 1;
		};
		window.addEventListener('hashchange', onhashchange, false);

		if (getFragment()) {
			active_slug = getFragment();
		} else {
			active_slug = first_slug;
			goto(`examples#${active_slug}`);
		}

		return () => {
			window.removeEventListener('hashchange', onhashchange, false);
		};
	});
</script>

<svelte:head>
	<title>{title} {title ? '•' : ''} Svelte Examples</title>

	<meta name="twitter:title" content="Svelte examples">
	<meta name="twitter:description" content="Cybernetically enhanced web apps">
	<meta name="Description" content="Interactive example Svelte apps">
</svelte:head>

<div class='examples-container' bind:clientWidth={width}>
	<div class="viewport offset-{offset}">
		<TableOfContents {sections} active_section={active_slug} />
		<Repl
			bind:this={repl}
			{svelteUrl}
			{rollupUrl}
			orientation={mobile ? 'columns' : 'rows'}
			fixed={mobile}
			relaxed
			injectedJS={mapbox_setup}
		/>
	</div>
	{#if mobile}
	<ScreenToggle bind:offset labels={['index', 'input', 'output']}/>
	{/if}
</div>

<style>
	.examples-container {
		position: relative;
		height: calc(100vh - var(--nav-h));
		overflow: hidden;
		padding: 0 0 42px 0;
		box-sizing: border-box;
	}

	.viewport {
		display: grid;
		width: 300%;
		height: 100%;
		grid-template-columns: 33.333% 66.666%;
		transition: transform .3s;
		grid-auto-rows: 100%;
	}

	.offset-1 { transform: translate(-33.333%, 0); }
	.offset-2 { transform: translate(-66.666%, 0); }

	@media (min-width: 768px) {
		.examples-container { padding: 0 }

		.viewport {
			width: 100%;
			height: 100%;
			display: grid;
			grid-template-columns: var(--sidebar-mid-w) auto;
			grid-auto-rows: 100%;
			transition: none;
		}

		.offset-1, .offset-2 { transform: none; }
	}
</style>
