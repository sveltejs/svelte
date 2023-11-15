<script>
	import Child from './Child.svelte'
	import {afterUpdate, beforeUpdate} from 'svelte';

	const {log = []} = $props();

	let count = $state(0);

	const increment = () => {
		count++;
	}

	beforeUpdate(() => {
		log.push('beforeUpdate');
	});

	afterUpdate(() => {
		log.push('afterUpdate');
	});
</script>

<Child count={count} increment={increment} />
