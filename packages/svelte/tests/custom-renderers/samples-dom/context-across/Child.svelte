<script>
	import { getContext } from 'svelte';

	const message = getContext('message');
</script>

<b>{message}</b>
