<script>
	let div = $state(null);

	$effect(()=>{
		const to_add = document.createElement("div");
		to_add.innerHTML=`<b>children</b>`;
		div = to_add;
	})
</script>

<svelte:element this={div ?? "div"}>
	<p>children</p>
</svelte:element>