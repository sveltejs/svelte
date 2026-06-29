<script>
	import { createPortalKey } from 'svelte';

	const key = createPortalKey('example');
</script>

{#portal key}
	<p>portaled</p>
{/portal}

<main>
	{@portal key}
</main>
