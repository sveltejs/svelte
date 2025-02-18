<script>
	import { get_id } from "./get_id.svelte.js";
	import Child from './Child.svelte';

	let id = get_id();

	let show = $state(false);
</script>

<button onclick={() => show = !show}>toggle</button>

<h1>{id}</h1>

<Child />
<Child />
<Child />

{#if show}
	<Child />
{/if}
