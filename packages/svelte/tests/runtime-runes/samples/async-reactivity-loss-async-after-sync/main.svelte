<script>
	let count = $state(0);
	let other = $state(0);

	function delayed(value, ms = 1000) {
		return new Promise((f) => setTimeout(() => f(value), ms))
	}

	async function foo() {
		await new Promise(r => setTimeout(r, 10));
	}

	async function bar() {
		const value = await delayed(count, 10);
		other; // should trigger warning
		return value;
	}

	async function get() {
		foo();
		return await bar();
	}
</script>

<button onclick={() => count++}>{count}</button>
<button onclick={() => other++}>{other}</button>
{await get()}
