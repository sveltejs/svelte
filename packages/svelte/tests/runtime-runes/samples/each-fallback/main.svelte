<script>
	let data = $state({a:1, b:2, c:3});
	let filter = $state(false);

	function toggle_filter(){
		if(filter) {
			filter = false;
			data = {a:1, b:2, c:3};
		} else {
			filter = true;
			data = {};
		}
	}
</script>
<div>
	{#each Object.keys(data) as key}
		{key}
	{:else}
		Fallback
	{/each}
</div>
<button onclick={toggle_filter}>Toggle</button>
