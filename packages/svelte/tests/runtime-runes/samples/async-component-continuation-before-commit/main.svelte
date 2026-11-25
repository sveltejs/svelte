<script lang="ts">
	import Child from './Child.svelte';

	const { promise, resolve } = Promise.withResolvers<number>();
	let shown = $state(false);
	let other = $state(0);

	async function run() {
		shown = true;
		resolve(1);
		await Promise.resolve();
		await Promise.resolve();
		other++;
	}
</script>

<button onclick={run}>run</button>
<p>other {other}</p>

{#if shown}
	<Child {promise} />
{/if}
