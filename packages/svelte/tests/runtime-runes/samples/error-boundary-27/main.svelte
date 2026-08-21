<script module>
	import { createContext } from "svelte";
	import Child from "./child.svelte";

	const [ get, set ] = createContext();
	export {get};
</script>

<script>
	set('hello');
</script>

<svelte:boundary>
	{#snippet failed(error)}
		<Child {error} />
	{/snippet}

	<Child />
</svelte:boundary>
