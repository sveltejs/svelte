<script>
	import { Warp } from "svelte";

	const warp = new Warp('app');
	const value = warp.getOrInsertComputed('environment', () => Promise.resolve({
		nested: Promise.resolve({
			environment: 'server'
		})
	}));

	const resolved = await value;
	const nested = await resolved.nested;
	const environment = await nested.environment;
</script>

<h1>{environment}</h1>
