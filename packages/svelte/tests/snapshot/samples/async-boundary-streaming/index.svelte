<script>
	import { Warp } from 'svelte';

	const warp = new Warp('app');
</script>

<svelte:boundary>
	<p>{await warp.getOrInsertComputed('data', () => Promise.resolve('data'))}</p>

	{#snippet pending()}
		<p>loading</p>
	{/snippet}
</svelte:boundary>
