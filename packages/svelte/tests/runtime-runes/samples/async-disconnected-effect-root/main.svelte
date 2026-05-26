<script>
	setTimeout(() => {
		$effect.root(() => {
			async function fn() {
				const value = $derived(await 1);
				return { get value() { return value } };
			}
			fn().then(r => console.log(r.value));
		})
	})
</script>
