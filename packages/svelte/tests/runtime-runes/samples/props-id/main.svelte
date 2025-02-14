<script>
	import Child from './Child.svelte';

	let id = $props.id();

	let show = $state(false);
</script>

<button onclick={() => show = !show}>toggle</button>

<p>{id}</p>

<Child />
<Child />
<Child />

{#if show}
	<Child />
{/if}
