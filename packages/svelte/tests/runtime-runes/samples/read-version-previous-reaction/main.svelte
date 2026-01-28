<script>
	import Component from "./Component.svelte";	
	
	let props = $state({
		label: 0,
		size: 0,
	});
	
	let filteredProps = $state();
	
	$effect.pre(() => {
		filteredProps = $state.snapshot(props);
	});
</script>

<button onclick={()=>props.label++}></button>

<Component {...filteredProps} />