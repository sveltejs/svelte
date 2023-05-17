<script>
	import { onMount } from 'svelte';
	import Child from './Child.svelte';

	let root;
	export let count = 0;

	onMount(() => {
		if (count < 5) {
			count++;
			new Child({ target: root });
		}
	});
</script>

<div bind:this={root}></div>
