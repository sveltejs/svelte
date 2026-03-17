<script>
	let show = $state(false);
	let count = $state(0);
</script>

<button onclick={() => show = !show}>toggle</button>
<button onclick={() => count += 1}>count: {count}</button>

<p>show: {show}</p>

{#if show}
	<NonExistent />
{/if}
