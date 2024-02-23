<script>
	import { getContext } from 'svelte';

	let context = getContext('container');

	$effect(() => {
		context.register('test');
		return () => context.unregister('test');
	});
</script>

<div>Item</div>
