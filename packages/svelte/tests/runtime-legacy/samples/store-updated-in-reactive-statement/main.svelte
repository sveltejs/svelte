<script>
	import { store } from './state.js';
	import Child from './Child.svelte';
</script>

<Child value={$store.value} />

<button on:click={() => store.set({ value: 1 })}>1</button>
