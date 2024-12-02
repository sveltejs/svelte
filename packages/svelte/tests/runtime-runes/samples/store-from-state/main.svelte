<script>
  import { writable, fromStore } from 'svelte/store';
	const store = writable(0)
	const state_from_store= fromStore(store)

	const derived_value= $derived.by(() => {
		if (state_from_store.current > 10) {
			return state_from_store.current
		}
		else{
			return 10
		}
	})

	function increment() {
		$store += 1;
	}
</script>

{state_from_store.current}
<button onclick={increment}>Increment</button><br>

{#if derived_value > 10 }Exceeded 10!{/if}
