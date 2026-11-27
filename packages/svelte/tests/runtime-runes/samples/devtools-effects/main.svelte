<script lang="ts">
	let count = $state(0);
	let show = $state(true);

	$effect(() => {
		count;
	});
</script>

<button onclick={() => count++}>increment</button>
<button onclick={() => (show = !show)}>toggle</button>

{#if show}
	<p>{count}</p>
{/if}
