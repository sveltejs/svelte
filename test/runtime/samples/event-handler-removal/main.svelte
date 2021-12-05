<script>
	export let input;
	export let blurred = false;
	export let visible = true;
</script>

{#if visible}
	<input bind:this={input} on:blur='{() => blurred = true}'>
{/if}
