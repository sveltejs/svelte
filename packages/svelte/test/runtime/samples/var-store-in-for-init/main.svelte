<script>
	import { writable } from "svelte/store";
	const array = [];
	for (var i = writable(0); $i < 5; ) {
		array.push($i);
		i.update((n) => n + 1);
	}
</script>

{#each array as a}
	<p>{a}</p>
{/each}
