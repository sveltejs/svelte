<script>
	import { flip } from "svelte/animate";

	let numbers = $state([0,1]);
</script>

<button onclick={() => numbers.reverse()}>reverse</button>

{#each numbers as num (num)}
	<div
		onintrostart={() => console.log("intro start")}
		onoutrostart={() => console.log("outro start")}
		onintroend={() => console.log("intro end")}
		onoutroend={() => console.log("outro end")}
		animate:flip={{ duration: 100 }}
	>
		{num}
	</div>
{/each}
