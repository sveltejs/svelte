<script context="module">
	export function preload({ params, query }) {
		return {
			version: query.version || '3',
			id: params.id
		};
	}
</script>

<script>
	import Repl from '@sveltejs/svelte-repl';
	import { onMount } from 'svelte';
	import { goto, stores } from '@sapper/app';
	import InputOutputToggle from '../../../components/Repl/InputOutputToggle.svelte';
	import AppControls from './_components/AppControls/index.svelte';

	export let version;
	export let id;

	const { session } = stores();

	let repl;
	let gist;
	let name = 'Loading...';
	let zen_mode = false;
	let is_relaxed_gist = false;
	let width = process.browser ? window.innerWidth : 1000;
	let checked = false;

	function update_query_string(version) {
		const params = [];

		if (version !== 'latest') params.push(`version=${version}`);

		const url = params.length > 0
			? `repl/${id}?${params.join('&')}`
			: `repl/${id}`;

		history.replaceState({}, 'x', url);
	}

	$: if (typeof history !== 'undefined') update_query_string(version);

	function fetch_gist(id) {
		if (gist && gist.uid === id) {
			// if the id changed because we just forked, don't refetch
			return;
		}

		// TODO handle `relaxed` logic
		fetch(`repl/${id}.json`).then(r => {
			if (r.ok) {
				r.json().then(data => {
					gist = data;
					name = data.name;

					is_relaxed_gist = data.relaxed;

					const components = data.files.map(file => {
						const dot = file.name.lastIndexOf(".");
						let name = file.name.slice(0, dot);
						let type = file.name.slice(dot + 1);

						if (type === 'html') type = 'svelte'; // TODO do this on the server
						return { name, type, source: file.source };
					});

					components.sort((a, b) => {
						if (a.name === 'App' && a.type === 'svelte') return -1;
						if (b.name === 'App' && b.type === 'svelte') return 1;

						if (a.type !== b.type) return a.type === 'svelte' ? -1 : 1;

						return a.name < b.name ? -1 : 1;
					});

					repl.set({ components });
				});
			} else {
				console.warn('TODO: 404 Gist');
			}
		});
	}

	$: if (process.browser) fetch_gist(id);

	onMount(() => {
		if (version !== 'local') {
			fetch(`https://unpkg.com/svelte@${version || '3'}/package.json`)
				.then(r => r.json())
				.then(pkg => {
					version = pkg.version;
				});
		}
	});

	function handle_fork(event) {
		console.log('> handle_fork', event);
		gist = event.detail.gist;
		goto(`/repl/${gist.uid}?version=${version}`);
	}

	$: svelteUrl = process.browser && version === 'local' ?
		`${location.origin}/repl/local` :
		`https://unpkg.com/svelte@${version}`;

	const rollupUrl = `https://unpkg.com/rollup@1/dist/rollup.browser.js`;

	// needed for context API example
	const mapbox_setup = `window.MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;`;

	$: mobile = width < 540;

	$: relaxed = is_relaxed_gist || ($session.user && gist && $session.user.uid === gist.owner);
</script>

<style>
	.repl-outer {
		position: relative;
		height: calc(100vh - var(--nav-h));
		--app-controls-h: 5.6rem;
		--pane-controls-h: 4.2rem;
		overflow: hidden;
		background-color: var(--back);
		padding: var(--app-controls-h) 0 0 0;
		/* margin: 0 calc(var(--side-nav) * -1); */
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
	}

	.viewport {
		width: 100%;
		height: 100%;
	}

	.mobile .viewport {
		width: 200%;
		height: calc(100% - 42px);
		transition: transform 0.3s;
		flex: 1;
	}

	.mobile .offset {
		transform: translate(-50%, 0);
	}

	/* temp fix for #2499 and #2550 while waiting for a fix for https://github.com/sveltejs/svelte-repl/issues/8 */

	.viewport :global(.tab-content),
	.viewport :global(.tab-content.visible) {
		pointer-events: all;
		opacity: 1;
	}
	.viewport :global(.tab-content) {
		visibility: hidden;
	}
	.viewport :global(.tab-content.visible) {
		visibility: visible;
	}

	.zen-mode {
		position: fixed;
		width: 100%;
		height: 100%;
		top: 0;
		z-index: 111;
	}

	@keyframes fade-in {
		0%   { opacity: 0 }
		100% { opacity: 1 }
	}
</style>

<svelte:head>
	<title>{name} • REPL • Svelte</title>

	<meta name="twitter:title" content="Svelte REPL">
	<meta name="twitter:description" content="Cybernetically enhanced web apps">
	<meta name="Description" content="Interactive Svelte playground">
</svelte:head>

<svelte:window bind:innerWidth={width}/>

<div class="repl-outer {zen_mode ? 'zen-mode' : ''}" class:mobile>
	<AppControls
		{gist}
		{repl}
		bind:name
		bind:zen_mode
		on:forked={handle_fork}
	/>

	{#if process.browser}
		<div class="viewport" class:offset={checked}>
			<Repl
				bind:this={repl}
				workersUrl="workers"
				{svelteUrl}
				{rollupUrl}
				{relaxed}
				fixed={mobile}
				injectedJS={mapbox_setup}
			/>
		</div>

		{#if mobile}
			<InputOutputToggle bind:checked/>
		{/if}
	{/if}
</div>
