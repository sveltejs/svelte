<script>
	import { onMount } from "svelte";

	export let logs;

	onMount(() => {
		logs.push("mount");
		return () => {
			logs.push("unmount");
		};
	});
</script>
