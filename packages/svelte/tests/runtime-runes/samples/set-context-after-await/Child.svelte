<script>
	import { setContext } from 'svelte';

	await Promise.resolve();

	try {
		setContext('potato', {});
	} catch (e) {
		console.log(e.message);
	}
</script>
