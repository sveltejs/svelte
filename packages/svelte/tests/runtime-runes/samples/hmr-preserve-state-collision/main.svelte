<script>
	import Counter from './Counter.svelte';

	let count = $state(1);
</script>

<button class="parent" onclick={() => count++}>parent: {count}</button>

{#each Array(count) as _}
	<Counter />
{/each}
