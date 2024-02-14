<script>
	import { writable } from 'svelte/store'

	let test_store = writable({id:0});
	let counter = $state(3);

	$effect(() => {
		$test_store.id = counter
	});
</script>


<p>test_store: {$test_store.id}</p>
<p>counter: {counter}</p>

<button onclick={() => counter++}>+1</button>
