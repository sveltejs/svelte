<script>
	import { hasContext } from 'svelte';

	const has = hasContext('test');
</script>

<div>{has}</div>