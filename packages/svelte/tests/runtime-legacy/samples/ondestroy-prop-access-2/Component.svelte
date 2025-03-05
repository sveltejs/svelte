<script>
	import { onDestroy } from 'svelte';

	export let my_prop;

	onDestroy(() => {
		console.log(my_prop.foo);
	});
</script>

{my_prop.foo}
