<script>
	import { fade } from 'svelte/transition';

	let items = $state([1, 2, 3]);
</script>

<button onclick={() => (items = [1])}>remove 2 and 3</button>
<button onclick={() => (items = [])}>remove all</button>
<button onclick={() => (items = [1, 2, 3])}>reset</button>
<button onclick={() => (items = [2])}>restore 2</button>
<button onclick={() => (items = [1, 3])}>restore 3</button>

{#each items as item (item)}
	<p out:fade={{ duration: item === 2 ? 0 : 400 }}>{item}</p>
{/each}
