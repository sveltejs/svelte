<script>
	export let store;

	let currentStore;
	function update(){
		currentStore = store
	}
</script>

<button on:click={update}></button>
<p>{$currentStore}</p>