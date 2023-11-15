<script>
	import { afterUpdate, beforeUpdate, onMount } from 'svelte';
	import order from './order.js';

	export let index;
	export let n;

	function logRender () {
		order.push(`${index}: render ${n}`);
		return index;
	}

	beforeUpdate(() => {
		order.push(`${index}: beforeUpdate ${n}`);
	});

	afterUpdate(() => {
		order.push(`${index}: afterUpdate ${n}`);
	});

	onMount(() => {
		order.push(`${index}: onMount ${n}`);
	});
</script>

<li>
	{logRender()}
</li>
