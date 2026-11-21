<script lang="ts">
	let a = $state(false);
	let b = $state(false);
	let version = $state(0);
	const deferreds: Array<PromiseWithResolvers<number>> = [];

	function push(value: number) {
		const d = Promise.withResolvers<number>();
		deferreds[value] = d;
		return d.promise;
	}
</script>

<button onclick={() => (a = true)}>show</button>
<button onclick={() => { b = true; version++; }}>update</button>
<button onclick={() => { a = b = false; }}>hide</button>
<button onclick={() => deferreds[0].resolve(0)}>resolve first</button>
<button onclick={() => deferreds[1].resolve(1)}>resolve second</button>

<output>pending: {$effect.pending()}</output>

{#if b || a}
	{@const value = await push(version)}
	<p>{value}</p>
{/if}
