<script>
	import { writable } from "svelte/store";
	import Component from "./Component.svelte";
	export let condition = writable(true);
</script>

{#if $condition}
	<button on:click={() => ($condition = false)} id="1"></button>
	<Component {condition} />
{/if}
