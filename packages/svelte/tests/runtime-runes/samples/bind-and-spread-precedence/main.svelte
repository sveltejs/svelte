<script>
	import Button from './input.svelte';
	
	let value = $state('foo');

	const props = $state({
		value: 'bar'
	});
</script>

<Button bind:value {...props} />
