<script>
	let count = $state(0)

	export function increment() {
		count += 1
	}
</script>

<button on:click={increment}>Count: {count}</button>
