<script lang="ts">
	let input = $state(1);
	const load = (value: number) => Promise.resolve(value + 1);
	let a = $derived(await load(input));
	let doubled = $derived(a * 2);
	const snapshot = a;
	let b = $derived(await load(doubled + snapshot));
</script>

<button onclick={() => input++}>update</button>
<output>{a} {doubled} {snapshot} {b}</output>
{#if b}<p>{b}</p>{/if}
