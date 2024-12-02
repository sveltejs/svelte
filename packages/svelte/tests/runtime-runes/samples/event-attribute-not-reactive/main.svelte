<script>
	let count = $state(0);

	const handlers = {
		current: increment
	};

	function increment() {
		count += 1;
	}

	function decrement() {
		count -= 1;
	}
</script>

<button onclick={() => (handlers.current = increment)}>increment</button>
<button onclick={() => (handlers.current = decrement)}>decrement</button>
<button onclick={handlers.current}>clicks: {count}</button>
