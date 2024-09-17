<script>
	export let count;
</script>

<button on:click={() => count.update((n) => n + 1)}>count {$count}</button>
