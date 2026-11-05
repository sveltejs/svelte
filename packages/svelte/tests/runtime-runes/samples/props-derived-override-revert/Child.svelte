<script>
	let { show = false, cancel } = $props();
</script>

{#if show}
	<button
		onclick={() => {
			cancel();
			show = false;
		}}>cancel</button
	>
{/if}
