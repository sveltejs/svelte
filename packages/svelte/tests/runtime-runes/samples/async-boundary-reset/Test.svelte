<script>
	async function c(a) {
			await Promise.resolve()
			if (a) {
				throw new Error('error');
			} else {
				return 'ok';
			}
	}

	let a = $state();
	let b = $derived(await c(a));
</script>

<button onclick={() => a = 1}>{b}</button>
