<script>
	import { slide } from "svelte/transition";
	export let open = false;
	export let color = "red";
	export let border = false;
</script>

<p>foo</p>
{#if open}
	<p class={color} class:border transition:slide|local={{ duration: 100 }}>bar</p>
{/if}

<style>
	.border {
		border: 4px solid black;
	}
</style>
