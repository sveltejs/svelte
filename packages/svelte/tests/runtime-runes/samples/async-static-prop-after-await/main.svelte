<script>
	import Child from './Child.svelte';
	
	await 1;

	let value = 'value';
</script>
 
<Child {value} />
<div class={value}></div>
