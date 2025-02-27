<script>
	import { onDestroy } from 'svelte';

	let { my_prop } = $props();

	onDestroy(() => {
		console.log(my_prop.foo);
	});
</script>

{my_prop.foo}
