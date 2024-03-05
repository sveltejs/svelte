<script>
	import { writable } from "svelte/store";

	let store = writable([{ value: 1 }]);
	let storeDeeper = writable({ items: [{ value: 1 }] });

	function increment() {
		$store[0].value++;
		$storeDeeper.items[0].value++;
	}
</script>

{#each $store as item (item)}
	{item.value}
{/each}
{#each $storeDeeper.items as item (item)}
	{item.value}
{/each}
{#each $store as item}
	{item.value}
{/each}
{#each $storeDeeper.items as item}
	{item.value}
{/each}

<button onclick={increment}>+</button>
