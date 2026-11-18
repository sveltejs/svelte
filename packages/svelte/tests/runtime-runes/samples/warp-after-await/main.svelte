<script>
	import { Warp } from "svelte";

	await Promise.resolve();

	const warp = new Warp('app');
	const value = warp.getOrInsert('value', 'hello after await');
</script>

<h1>{value}</h1>
