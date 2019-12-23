<script>
	import { writable } from 'svelte/store';
	import { fade, fly} from 'svelte/transition';

	export let showing = false;
</script>

{#if showing}
	<div class="cover background" on:click={() => showing = false} transition:fade></div>
	<div class="cover search" transition:fly={{x: 400}}></div>
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
