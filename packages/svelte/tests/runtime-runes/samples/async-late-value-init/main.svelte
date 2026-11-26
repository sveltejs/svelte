<script>
	let name = $derived(await new Promise((a) => a('aaa')));
	function use() {
		return () => 1;
	}
	const aa = use();
</script>

{name}
{aa()}
