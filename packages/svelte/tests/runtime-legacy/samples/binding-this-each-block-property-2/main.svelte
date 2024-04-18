<script>
	import { tick } from 'svelte';
	let refs = [];

	export function addItem() {
		refs = refs.concat({ ref: null });
		return tick();
	}

	export let callback;

	$: callback(refs);
</script>

{#each refs as xxx}
	<div bind:this={xxx.ref}></div>
{/each}
