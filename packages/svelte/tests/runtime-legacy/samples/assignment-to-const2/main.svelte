<script>
	const a = 100;
	const arr = [{ a: 1 }, 2];
	[arr[0].a, arr[1] = a] = [arr[1]];
</script>

<p>{JSON.stringify(arr)}</p>
