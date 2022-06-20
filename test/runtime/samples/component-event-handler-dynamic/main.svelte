<script>
	import Button from './Button.svelte';
	export let count = 0;
	let clickHandler = () => count += 1;
	function updateHandler(){
		clickHandler = () => count += 10;
	}
</script>

<button on:click={updateHandler}>update handler</button>
<Button on:click={clickHandler}>{count}</Button>