<script module lang="ts">
	export const state = $state<{ id?: string }>({});
	export const slow = Promise.withResolvers<string>();
</script>

<script lang="ts">
	import Child from './Child.svelte';

	// Written while hydrating, not before `hydrate()`
	state.id = 'ada';

	let { browser = true } = $props();
	const loaded = $derived(await (browser ? slow.promise : Promise.resolve('loaded')));

	async function load(id: string | undefined) {
		console.log(id);
		return { name: id };
	}
</script>

<output>
	<p>{loaded}</p>
	<svelte:boundary>
		<Child get_id={() => state.id} {load} />
		{#snippet pending()}{/snippet}
	</svelte:boundary>
</output>
