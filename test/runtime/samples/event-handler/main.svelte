<script>
	export let visible;
</script>

<button on:click='{() => visible = !visible}'>toggle</button>

{#if visible}
	<p>hello!</p>
{/if}
