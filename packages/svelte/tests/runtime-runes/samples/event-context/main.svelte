<script>
	let count = $state(0);
	let button = $state();

	function do_thing() {
		button?.click();
		return false;
	}
</script>

<button bind:this={button} onclick={() => count++ }>{count}</button>

{#if do_thing()}{/if}
