<script>
	let count = $state(0);
	let checked = $state(false);

	$effect(() => {
		$inspect.trace("effect");
		if(checked && count > 0 && count < 3){
			let old = count;
			// this should not show up in the logs
			count = 1000;
			count = old + 1;
		}
	});
</script>
<input type="checkbox" bind:checked />
<button onclick={()=>{
	count++;
}}>{count}</button>