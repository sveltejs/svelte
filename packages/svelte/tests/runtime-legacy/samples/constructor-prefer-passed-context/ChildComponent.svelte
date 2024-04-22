<script>
	import { getContext } from 'svelte';
	const value = getContext('foo');
</script>

<div>Value in child component: {value}</div>
