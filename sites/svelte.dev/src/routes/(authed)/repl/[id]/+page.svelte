<script>
	import { browser } from '$app/environment';
	import { afterNavigate, goto } from '$app/navigation';
	import Repl from '@sveltejs/repl';
	import { theme } from '@sveltejs/site-kit/stores';
	import { onMount } from 'svelte';
	import { mapbox_setup } from '../../../../config.js';
	import AppControls from './AppControls.svelte';

	export let data;

	let version = data.version;

	/** @type {import('@sveltejs/repl').default} */
	let repl;
	let name = data.gist.name;
	let zen_mode = false;
	let modified_count = 0;

	function update_query_string(version) {
		const params = [];

		if (version !== 'latest') params.push(`version=${version}`);

		const url =
			params.length > 0 ? `/repl/${data.gist.id}?${params.join('&')}` : `/repl/${data.gist.id}`;

		history.replaceState({}, 'x', url);
	}

	$: if (typeof history !== 'undefined') update_query_string(version);

	onMount(() => {
		if (data.version !== 'local') {
			fetch(`https://unpkg.com/svelte@${data.version || '4'}/package.json`)
				.then((r) => r.json())
				.then((pkg) => {
					version = pkg.version;
				});
		}
	});

	afterNavigate(() => {
		repl?.set({
			files: data.gist.components
		});
	});

	function handle_fork(event) {
		console.log('> handle_fork', event);
		goto(`/repl/${event.detail.gist.id}?version=${version}`);
	}

	function handle_change(event) {
		modified_count = event.detail.files.filter((c) => c.modified).length;
	}

	$: svelteUrl =
		browser && version === 'local'
			? `${location.origin}/repl/local`
			: `https://unpkg.com/svelte@${version}`;

	$: relaxed = data.gist.relaxed || (data.user && data.user.id === data.gist.owner);
</script>

<svelte:head>
	<title>{name} • REPL • Svelte</title>

	<meta name="twitter:title" content="{data.gist.name} • REPL • Svelte" />
	<meta name="twitter:description" content="Cybernetically enhanced web apps" />
	<meta name="Description" content="Interactive Svelte playground" />
</svelte:head>

<div class="repl-outer {zen_mode ? 'zen-mode' : ''}">
	<AppControls
		user={data.user}
		gist={data.gist}
		{repl}
		bind:name
		bind:zen_mode
		bind:modified_count
		on:forked={handle_fork}
	/>

	{#if browser}
		<Repl
			bind:this={repl}
			{svelteUrl}
			{relaxed}
			injectedJS={mapbox_setup}
			showModified
			showAst
			on:change={handle_change}
			on:add={handle_change}
			on:remove={handle_change}
			previewTheme={$theme.current}
		/>
	{/if}
</div>

<style>
	.repl-outer {
		position: relative;
		height: calc(100% - var(--sk-nav-height));
		height: calc(100dvh - var(--sk-nav-height));
		--app-controls-h: 5.6rem;
		--pane-controls-h: 4.2rem;
		overflow: hidden;
		background-color: var(--sk-back-1);
		padding: var(--app-controls-h) 0 0 0;
		/* margin: 0 calc(var(--side-nav) * -1); */
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
	}

	/* temp fix for #2499 and #2550 while waiting for a fix for https://github.com/sveltejs/svelte-repl/issues/8 */

	.repl-outer :global(.tab-content),
	.repl-outer :global(.tab-content.visible) {
		pointer-events: all;
		opacity: 1;
	}
	.repl-outer :global(.tab-content) {
		visibility: hidden;
	}
	.repl-outer :global(.tab-content.visible) {
		visibility: visible;
		z-index: 1;
	}

	.zen-mode {
		position: fixed;
		width: 100%;
		height: 100%;
		top: 0;
		z-index: 111;
	}

	@keyframes fade-in {
		0% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}
</style>
