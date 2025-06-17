<script>
	let { message } = $props();

	using x = {
		message,
		[Symbol.dispose]() {
			console.log(`disposing ${message}`);
		}
	}
</script>

<p>{x.message}</p>
