<script>
	import { fork } from 'svelte';

	let show_count_1 = $state(true);
	let count_1 = $state(0);
	let count_2 = $state(0);

	const count = $derived(show_count_1 ? count_1 : count_2);
</script>

<!-- This if block causes the derived to execute during the fork, switching its dependency
     away from count_1 and over to count_2. After discard, count_1 should still be tracked. -->
{#if count}
{/if}

<button onclick={() => {
	const f = fork(() => {
		show_count_1 = !show_count_1;
	});
	f.discard();
}}>fork toggle</button>

<button onclick={() => show_count_1 = !show_count_1}>toggle</button>
<button onclick={() => count_1++}>increment count 1</button>
<button onclick={() => count_2++}>increment count 2</button>

<p>{count}</p>
