<script>
	import Child from './Child.svelte';
	let text = $state('dont fuse this text with the one from the child');
</script>

<Child>{text}</Child>
