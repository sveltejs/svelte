<script module>
	import { createContext } from 'svelte';

	const [get_child] = createContext();

	export { get_child };
</script>

<script>
	import { get } from './main.svelte';
	import Required from './Required.svelte';
	import Optional from './Optional.svelte';

	const message = get();
</script>

<h1>{message}</h1>

<svelte:boundary>
	<Required />
	{#snippet failed()}
		<p>caught</p>
	{/snippet}
</svelte:boundary>

<Optional />
