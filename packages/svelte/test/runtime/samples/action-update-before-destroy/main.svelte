<script>
	import { writable } from 'svelte/store';
  import Component from "./Component.svelte";

	let items = writable({ 1: { id: 1 } });
</script>

{#each Object.values($items) as item (item.id)}
  <Component id="{item.id}" {items} />
{/each}
