<script>
	import Nested from './Nested.svelte';
	export let show;
</script>

{#if show}
	<Nested bind:show/>
{:else}
	<button on:click="{() => show = true}">Show</button>
{/if}