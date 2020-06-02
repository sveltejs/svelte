<script>
	import Button from './Button.svelte'

	export let visible;
</script>

<Button on:click='{() => visible = !visible}'>toggle</Button>

{#if visible}
	<p>hello!</p>
{/if}
