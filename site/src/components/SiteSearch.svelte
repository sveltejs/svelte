<script>
	import { writable } from 'svelte/store';

	export let showing = false;
</script>

{#if showing}
	<div class="search"></div>
{/if}

<style>
	.search {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		width: 385px;
		background: var(--back);
		z-index: 100;
	}
</style>
