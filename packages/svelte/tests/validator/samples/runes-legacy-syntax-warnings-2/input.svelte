<script>
	let { foo } = $props();
</script>

<!-- ok -->
<button onclick={foo}>click me</button>
<Button on:click={foo}>click me</Button>
<Button on:click={foo}>click me</Button>

<!-- error -->
<button on:click={foo}>click me</button>
