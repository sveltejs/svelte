<script>
	const fast = async () => 'x';
	const slow = (v) => new Promise((r) => setTimeout(() => r(v), 100));
</script>

<p>{await slow(await fast())}</p>
