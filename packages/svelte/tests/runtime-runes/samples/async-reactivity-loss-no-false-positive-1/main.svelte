<script>
	let x = $state(0);
	let y = $state(0);
	async function foo(x) {
		if (x) {
			await 1; // restores reactivity loss warning context
			await new Promise(r => setTimeout(r, 10)) // saves reactivity loss warning context; should not keep it while running
		}
		return x
	}
</script>

{x} {await foo(y)}

<button onclick={() => x += 1}>x++</button>
<button onclick={() => y += 1}>y++</button>
