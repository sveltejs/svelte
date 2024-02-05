<script>
	let count = $state(0);
	let el;
	$effect(() => {
		document.getElementsByTagName('body')[0].appendChild(el);
	})
</script>

<div>
	<button bind:this={el} onclick={() => count++}>clicks: {count}</button>
	<button onclick={() => count++}>clicks: {count}</button>
</div>
