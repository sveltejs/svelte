<script>
	import { browser } from '$app/environment';
	import ReplWidget from '$lib/components/ReplWidget.svelte';

	export let data;
</script>

<svelte:head>
	<title>REPL • Svelte</title>

	<meta name="twitter:title" content="Svelte REPL" />
	<meta name="twitter:description" content="Cybernetically enhanced web apps" />
	<meta name="description" content="Interactive Svelte playground" />
</svelte:head>

<div class="repl-outer">
	{#if browser}
		<ReplWidget version={data.version} gist={data.gist} example={data.example} embedded={true} />
	{/if}
</div>

<style>
	.repl-outer {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: var(--sk-back-1);
		overflow: hidden;
		box-sizing: border-box;
		--pane-controls-h: 4.2rem;
		display: flex;
		flex-direction: column;
	}
</style>
