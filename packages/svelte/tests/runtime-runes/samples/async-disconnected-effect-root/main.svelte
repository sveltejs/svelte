<script>
	let increment;

	setTimeout(() => {
		$effect.root(() => {
			async function fn() {
				let count = $state(1);
				increment = () => { count++; };
				$effect.pre(() => console.log(count))
				const value = $derived(await count);
				return { get value() { return value } };
			}
			fn().then(r => console.log(r.value));
		})
	})
</script>

<button onclick={() => increment()}>increment</button>
