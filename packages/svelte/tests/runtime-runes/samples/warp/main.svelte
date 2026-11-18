<script lang="ts">
	import { Warp } from "svelte";

	let { environment }: { environment: 'server' | 'browser' } = $props();

	const warp = new Warp<string, string>('app');
	const value = warp.getOrInsert('environment', environment);
</script>

<p>The current environment is: {value}</p>
