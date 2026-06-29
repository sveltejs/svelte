<script>
	let count = $state(0);

	export function increment() {
		count += 1;
	}

	export function get_count() {
		return count;
	}
</script>

<p>{count}</p>
