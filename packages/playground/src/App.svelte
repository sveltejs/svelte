<script>
	import { onMount } from 'svelte';

	let name = 'world';

	onMount(() => {
		console.log('The component has been mounted');
	});
</script>

<h1>Hello {name}!</h1>

<input bind:value={name} />
