<script>
	let div = $state(null);
	let show = $state(false);
</script>

<div bind:this={div}></div>
<button onclick={() => show = !show}></button>
<svelte:element this={show && div}>
</svelte:element>