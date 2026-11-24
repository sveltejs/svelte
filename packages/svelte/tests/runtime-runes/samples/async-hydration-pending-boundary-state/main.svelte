<script module lang="ts">
	export const state = $state<{ id?: string }>({});
	export const slow = Promise.withResolvers<string>();
</script>

<script lang="ts">
	import Child from './Child.svelte';

	let { browser = true } = $props();
	const loaded = $derived(await (browser ? slow.promise : Promise.resolve('loaded')));

	async function load(id: string | undefined) {
		console.log(id);
		return { name: id };
	}
</script>

<button onclick={() => (state.id = 'grace')}>change user</button>

<output>
	<p>{loaded}</p>
	<svelte:boundary>
		{@const user = await load(state.id)}
		<p>const: {user.name}</p>
		{#snippet pending()}{/snippet}
	</svelte:boundary>
	<svelte:boundary>
		<Child get_id={() => state.id} {load} />
		{#snippet pending()}{/snippet}
	</svelte:boundary>
</output>
