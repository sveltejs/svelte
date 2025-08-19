<script>
	import { route } from "./main.svelte";

	await new Promise(async (_, reject) => {
		route.reject = reject;
	});
</script>
