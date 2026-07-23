<script>
	import { getContext } from 'svelte';

	const message = getContext('message');
</script>

<span>{message}</span>
