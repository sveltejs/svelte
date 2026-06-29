<script>
	import { createPortalKey } from 'svelte';

	const key = createPortalKey('example');
	let target = $state(null);
</script>

<main bind:this={target}></main>

{#portal target}
	<p>portaled</p>
{/portal}
