<script lang="ts">
	let input = $state(1);
	const load = (value: number) => Promise.resolve(value + 1);
	let a = $derived(await load(input));
	let b = $derived(await load(a));
</script>

<button onclick={() => input++}>update</button>
<output>
	{#if b}<p>{a} {b}</p>{/if}
</output>
