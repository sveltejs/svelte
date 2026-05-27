<script>
	let increment;

	async function fn() {
		let count = $state(1);
		increment = () => { count++; };
		const value = $derived(await count);
		$effect.pre(() => console.log(value))
		return { get value() { return value } };
	}
	fn().then(r => console.log(r.value));

</script>

<button onclick={() => increment()}>increment</button>
