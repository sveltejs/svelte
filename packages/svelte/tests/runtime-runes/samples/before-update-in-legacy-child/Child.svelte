<svelte:options runes={false} />

<script>
	import { beforeUpdate } from 'svelte';

	export let object;

	beforeUpdate(() => {
		console.log('changed');
	});
</script>
