<script lang="ts">
	let obj: Record<string, number> = $state({ a: 1 });

	function log(k: string, v: number) {
		console.log(`${k}: ${v}`);
		return v;
	}
</script>

<button onclick={() => (obj.b = 2)}>add</button>

<output>
	{#each Object.entries(obj) as [k, v] (k)}
		<p>{log(k, v)}</p>
	{/each}
</output>
