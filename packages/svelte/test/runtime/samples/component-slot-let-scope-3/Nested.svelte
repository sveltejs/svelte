<script>
	let count = 0;

	function increment() {
		count += 1;
	}
</script>

<div>
	<slot {count}></slot>
	<slot name="foo" {count}></slot>
	<slot name="bar"></slot>

	<button on:click={increment}>+1</button>
</div>