<script>
	let content1 = `<style>body { color: red; }</style>`;
	let content2 = `<style>body { color: blue; }</style>`

	let show = false;
	$: content = show ? content1 : content2;
</script>

<button on:click={() => show = !show}>
	Switch
</button>

<svelte:head>
	{@html content}
	<style>body { color: green; }</style>
</svelte:head>
