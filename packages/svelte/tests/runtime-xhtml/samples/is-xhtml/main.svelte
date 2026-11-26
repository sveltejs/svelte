<script>
	let elem = $state();
	let nodeName = $derived(elem?.nodeName);
</script>
<div bind:this={elem}>{nodeName}</div>
