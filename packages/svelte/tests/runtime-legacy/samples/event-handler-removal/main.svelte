<script>
	export let input;
	export let blurred = false;
	export let visible = true;

	setTimeout(() => {
		visible = false;

		// setTimeout(() => {
		// 	visible = true;
		// }, 1000)
	}, 1000)
</script>

{#if visible}
	<input bind:this={input} on:blur='{() => blurred = true}'>
{/if}
