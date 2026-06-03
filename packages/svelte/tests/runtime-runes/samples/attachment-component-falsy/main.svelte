<script>
	import Child from './Child.svelte';

	function attachment(){
		console.log("up");
	}

	let enabled = $state(false);
</script>

<button onclick={() => enabled = !enabled}></button>

<Child {@attach enabled && attachment} />
