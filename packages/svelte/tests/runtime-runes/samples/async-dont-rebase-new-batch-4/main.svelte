<script>
	import { untrack } from "svelte";

	let count = $state(0);
	let double = $derived(count * 2);
	let count_mirror = $state(0);
	let unrelated = $state(0);
	let count_mirror_d = $derived(count_mirror * 2);

	const queued = [];
	function delay(v) {
		if (!v) return v;
		return new Promise(resolve => {
			queued.push(() => resolve(v));
		});
	}
</script>

<button onclick={() => count++}>count {await delay(count)} | count_mirror {await delay(count_mirror)} | count_mirror_d {count_mirror_d} | unrelated {unrelated}</button>
<button onclick={() => unrelated++}>unrelated++</button>
<button onclick={() => queued.shift()?.()}>resolve</button>

{#if count}
	<!-- inside if block so effects are newly created and therefore added to batch.#new_effects -->
	<!-- first $effect creates new batch ... -->
	{(() => {
		$effect(() => {
			count_mirror = count;
			untrack(() => count_mirror_d); // execute derived; should associate value with the right batch
		})
	})()}
	<!-- ... which second $effect shouldn't write to because the derived execution belongs to the previous batch -->
	{(() => {
		$effect(() => {
			console.log(double);
		})
	})()}
{/if}