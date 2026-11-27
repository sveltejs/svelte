<script>
	let count = $state(0);

	export function increment() {
		count += 1;
	}
</script>

<counter>{count}</counter>
