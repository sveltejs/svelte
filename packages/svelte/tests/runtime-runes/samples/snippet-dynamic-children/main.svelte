<script>
	import Button from "./Button.svelte";

	let show = $state(false);
</script>

<Button change={() => show = true}>
	{#if show}
		<span>showing</span>
	{:else}
		<span>hidden</span>
	{/if}
</Button>
