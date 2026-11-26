<script lang="ts">
	import { flushSync } from 'svelte';

	let count = $state(0);
	let other = $state(0);
	let double = $derived(count * 2);

	$effect(() => {
		console.log(`effect ${count} ${double}`);

		if (count % 2 === 1) {
			count += 1;
			flushSync();
			console.log(`flushed ${count} ${double}`);
		}

		return () => console.log(`teardown ${count} ${double}`);
	});

	$effect(() => {
		console.log(`other ${other} ${count}`);
	});
</script>

<button onclick={() => count++}>count</button>
<button
	onclick={() => {
		count++;
		other++;
	}}
>
	both
</button>

<output>
	<p>{count} {double} {other}</p>

	{#if count % 4 === 0}
		<span>multiple of four</span>
	{:else}
		<span>not {count}</span>
	{/if}
</output>
