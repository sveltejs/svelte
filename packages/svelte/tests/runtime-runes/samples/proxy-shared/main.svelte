<script>
	let obj = { count: 0 };

	let a = $state(obj);
	let b = $state(obj);
</script>

<button onclick={() => a.count += 1}>
	{a.count}
</button>

<button onclick={() => b.count += 1}>
	{b.count}
</button>
