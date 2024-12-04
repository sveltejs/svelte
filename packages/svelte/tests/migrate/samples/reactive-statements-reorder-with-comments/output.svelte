<script>
	import { run } from 'svelte/legacy';

	let count = $state(0);



	// triple
	//  update triple
	let triple = $derived(count * 3)
	//  trailing comment
	//  in triple;

	function increment() {
		count += 1;
	}
	// this comment should remain attached to this declaration after migration
	let double = $derived(count * 2); // this too
	run(() => {
		console.log({ count, double });
	});
	
</script>

<button onclick={increment}>
	clicks: {count}
</button>