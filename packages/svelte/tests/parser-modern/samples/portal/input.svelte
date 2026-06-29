<script>
	import { createPortalKey } from 'svelte';

	const key = createPortalKey('example');
</script>

{@portal key}

{#portal key}
	<p>portaled</p>
{/portal}
