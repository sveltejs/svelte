<script>
	let a = $state({b: 0});
</script>

<button onclick={() => a.b += 1}>a += 1</button>
<p>{JSON.stringify(a)} + {a.b}</p>
