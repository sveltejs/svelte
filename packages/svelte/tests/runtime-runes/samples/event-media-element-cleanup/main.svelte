<script>
	const { handler } = $props();
	let show = $state(true);
</script>

<button onclick={() => show = false}>show/hide</button>
{#if show}
	<video onsomeevent={handler}></video>
{/if}
