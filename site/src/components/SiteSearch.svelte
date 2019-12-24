<script>
	import { writable } from 'svelte/store';
	import { fade, fly} from 'svelte/transition';
	import SearchBar from './SearchBar.svelte';

	export let showing = false;
	let query = '';

	let results = [];
</script>

{#if showing}
	<div class="cover background" on:click={() => showing = false} transition:fade></div>
	<div class="cover search" transition:fly={{x: 400}}>
		<SearchBar bind:query on:close={() => showing = false} />
		<div class="divider" />
		{#if results.length}
			reuslts
		{:else}
			<img src="/icons/svelte-search.svg" alt="Search Icon">
		{/if}

		{#if query.length && !results.length}
			<p class="no-results">Couldn't find any results for "{query}"</p>
		{/if}
	</div>
{/if}

<style>
	.cover {
		position: fixed;
		top: 0;
		right: 0;
		left: 0;
		bottom: 0;
		z-index: 100;
	}
	.background {
		background: rgba(0, 0, 0, 0.6);
	}
	.search {
		left:unset;
		width: 385px;
		background: var(--back);
	}
	.divider {
		height: 0.5px;
		background: rgba(0, 0, 0, 0.1);
	}
	img {
		width: 150px;
		height: 150px;
		display: block;
		margin: calc(50vh - 160px) auto 0 auto;
	}
	.no-results {
		font-size: 14px;
		font-weight: bold;
		text-align: center;
		padding: 0 16px;
	}
</style>
