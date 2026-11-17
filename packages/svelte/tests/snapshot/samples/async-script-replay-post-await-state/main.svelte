<script lang="ts">
	let { input, register }: { input: number; register: (callback: () => void) => void } = $props();
	await Promise.resolve();
	const constant = $state(7);
	let count = $state(input);
	const snapshot = count;
	register(() => count++);
	let raw = $state.raw({ count: 1 });
	count++;
	await Promise.resolve();
	const later = count;
</script>

<button onclick={() => count++}>increment</button>
<button onclick={() => raw = { count: raw.count + 1 }}>replace raw</button>
<input type="number" bind:value={count}>
<output>{constant} {count} {snapshot} {raw.count} {later}</output>
