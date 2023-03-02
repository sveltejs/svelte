<script>
	export let clicked;
</script>

<button on:click='{() => clicked = true}'>click me</button>

{#if clicked}
	<p>clicked!</p>
{/if}
