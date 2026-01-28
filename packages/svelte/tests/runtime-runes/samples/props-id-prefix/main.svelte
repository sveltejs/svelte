<script>
	import Child from './Child.svelte';

	let id = $props.id();

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
