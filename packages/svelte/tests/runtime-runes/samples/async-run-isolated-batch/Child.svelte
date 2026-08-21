<script>
	import { push } from "./main.svelte";
	const x = await push(1);
	const y = await push(2);
</script>

{x} {y}
