<script>
	import { onMount } from 'svelte';
	let arr = [1];
	
	onMount(() => {
		arr.push(arr.length + 1);
		arr = arr;
	});
</script>

{#each arr as num}
	static
{/each}