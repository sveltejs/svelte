<script>
	import { onMount, beforeUpdate, afterUpdate } from 'svelte';

	import order from './order.js';

	function identity(x) {
		order.push('render');
		return x;
	}

	beforeUpdate(() => {
		order.push('beforeUpdate');
	});

	afterUpdate(() => {
		order.push('afterUpdate');
	});

	onMount(() => {
		order.push('onMount');
	});
</script>

{identity(42)}