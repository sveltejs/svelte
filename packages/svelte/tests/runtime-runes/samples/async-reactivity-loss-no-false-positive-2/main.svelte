<script>
	let count = $state(0);
	async function delay(c) {
		if (c) {
			await new Promise(r => setTimeout(r));
			count; // count already read synchronously; should not result in reacitive loss warning
		}
		return c;
	}
</script>

{await delay(count)}

<button onclick={() => count += 1}>count++</button>
