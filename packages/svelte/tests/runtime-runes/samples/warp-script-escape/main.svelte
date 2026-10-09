<script>
	import { Warp } from "svelte";

	let { key } = $props();

	const warp = new Warp('app');
	const value = await warp.getOrInsertComputed(key, () => Promise.resolve('safe'));
</script>

<h1>{value}</h1>
