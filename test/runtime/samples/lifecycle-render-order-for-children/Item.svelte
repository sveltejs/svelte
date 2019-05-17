<script>
	import { onMount, beforeUpdate, afterUpdate } from 'svelte';

	import order from './order.js';

	export let index;
	export let id;
	export let name;

	function logRender () {
		order.push(`${index}: render`);
		return index;
	}

	beforeUpdate(() => {
		order.push(`${index}: beforeUpdate`);
	});

	afterUpdate(() => {
		order.push(`${index}: afterUpdate`);
	});

	onMount(() => {
		order.push(`${index}: onMount`);
	});
</script>

<li>
	{logRender()}
</li>
