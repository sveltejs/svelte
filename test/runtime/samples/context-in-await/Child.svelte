<script>
	import { getContext } from 'svelte';
	const num = getContext('test');
</script>

<p>Context value: {num}</p>