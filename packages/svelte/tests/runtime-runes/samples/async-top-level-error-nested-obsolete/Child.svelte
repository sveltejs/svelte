<script>
	import { route } from "./main.svelte";

	await new Promise(async (_, reject) => {
		await Promise.resolve();
		route.current = 'other'
		route.reject = reject;
	});
</script>
