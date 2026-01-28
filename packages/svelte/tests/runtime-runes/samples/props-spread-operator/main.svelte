<script>
	import { SvelteSet } from 'svelte/reactivity';
	import Child from './Child.svelte';

	const numbers = new SvelteSet([0, 1, 2]);
</script>

<button onclick={() => numbers.add(numbers.size)}>+1</button>

<Child numbers={[...numbers]} />
