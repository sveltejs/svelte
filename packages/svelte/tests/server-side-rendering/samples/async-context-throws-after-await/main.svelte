<script>
	import { setContext } from 'svelte';

	await Promise.resolve('hi');

	setContext('key', 'value');
</script>
