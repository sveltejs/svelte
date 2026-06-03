<script>
	import Child from './Child.svelte';
	
	await Promise.resolve();

	let value = 'value';
</script>
 
<Child {value} />
<div class={value}></div>
