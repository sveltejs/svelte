<script>
	import { deleteContext } from 'svelte';
	const deleted = deleteContext('test');
</script>

<div>{deleted}</div>
<slot />
