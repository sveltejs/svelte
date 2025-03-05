<script>
	import Component from './Component.svelte';

	let value = { foo: 'bar' };
</script>

<button
	onclick={() => {
		value = undefined;
	}}>Reset value</button
>

{#if value !== undefined}
	<Component my_prop={value} />
{/if}
