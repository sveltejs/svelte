<script>
	let a = $state(1);
	let b = 2;
</script>

<button onclick={() => a += 1}>a += 1</button>
<button onclick={() => b += 1}>b += 1</button>
<p>{a} + {b} = {a + b}</p>
