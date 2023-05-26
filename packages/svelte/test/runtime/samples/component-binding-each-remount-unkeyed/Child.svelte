<script>
	import InnerChild from './InnerChild.svelte';

	export let id = 1;
	export let count;
	export let increment;

	let list;
	$: {
		list = [];
		for (let i = 0; i < count; ++i) {
			list.push(i);
		}
	}
</script>

<div data-id={id}>
	{#each list as item}
		<InnerChild val={item} {increment} />
	{/each}
</div>
