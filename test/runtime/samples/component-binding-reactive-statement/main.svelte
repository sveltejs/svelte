<script>
	import Button from './Button.svelte';
	
	let count = 0;

	$: if (count > 2) {
		count = 2;
	}

	function handleClick() {
		count += 1;
	}
</script>

<button on:click={handleClick}>
	main {count}
</button>

<Button bind:count />
