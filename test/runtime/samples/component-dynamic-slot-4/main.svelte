<script>
	import Nested from './Nested.svelte';
	export let condition = 1;
	export let value = 'value';
	export let a = 'a';
	export let b = 'b';
</script>

<Nested {value} {a} {b}>
	{#if condition === 1}
		<svelte:fragment let:a>
			{a}
		</svelte:fragment>
	{:else if condition === 2}
		<svelte:fragment let:a let:b>
			{a} + {b} = {a + b}
		</svelte:fragment>
	{:else if condition === 3}
		<svelte:fragment let:b>
			b: {b}
		</svelte:fragment>
	{/if}
</Nested>
