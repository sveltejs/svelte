<script>
	let active;

	$: console.log(active?.id || active?.nodeName || '...');
</script>

<svelte:document bind:activeElement={active} />

<button id="one">one</button>
<button id="two">two</button>
