<script>
	import { toStore } from "svelte/store";

	let counter = $state(0);
	const count = toStore(() => counter, value => counter = value);
</script>

<div>Count {counter}!</div>
<div>Count from store {$count}!</div>

<button onclick={() => counter+=1}>Add 1</button>
