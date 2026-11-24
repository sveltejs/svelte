<script>
	import { getContext } from 'svelte';
	const _unused = $derived(await 1);
	//This must be created after any $derived(await...)
	const bar = $derived(getContext('') ?? 'hi');
</script>

{#if true}
	{@const foo = bar}
    {foo}
{/if}
