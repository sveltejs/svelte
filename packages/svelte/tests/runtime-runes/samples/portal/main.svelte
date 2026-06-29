<script>
	import { createPortalKey } from 'svelte';

	const key = createPortalKey('example');
</script>

<main>
	{@portal key}
</main>

{#portal key}
	<p>portaled</p>
{/portal}
