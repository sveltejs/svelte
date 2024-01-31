<script>
	let a = $state(1);
	let b = 2;
	let c = 3;
	let d = 4;
</script>

<button onclick={() => a += 1}>a += 1</button>
<button onclick={() => b += 1}>b += 1</button>
<button onclick={() => c += 1}>c += 1</button>
<button onclick={() => d += 1}>d += 1</button>
<p>{a} + {b} + {c} = {a + b + c}</p>
