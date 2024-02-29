<script>
	import Sub from './sub.svelte';
	import { onMount } from 'svelte';

	let count = 0;
	let component;

	onMount(() => {
		component.$on('increment', (e) => {
			count += e.detail;
			component.$set({ count });
		});
	});
</script>

<Sub bind:this={component} />
