<script>
	import { writable } from 'svelte/store';
	import { fade, fly} from 'svelte/transition';
	import SearchBar from './SearchBar.svelte';

	export let showing = false;
	let query = '';
</script>

{#if showing}
	<div class="cover background" on:click={() => showing = false} transition:fade></div>
	<div class="cover search" transition:fly={{x: 400}}>
		<SearchBar bind:query on:close={() => showing = false} />
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
</style>
