<script>
	let { foo } = $props();
</script>

<!-- ok -->
<button onclick={foo}>click me</button>
<Button onclick={foo}>click me</Button>
<Button on:click={foo}>click me</Button>

<!-- warn -->
<slot></slot>
<slot name="foo"></slot>
<button on:click={foo}>click me</button>
