<script>
	import { getContext } from 'svelte';
	import { ID } from './Nested.svelte';

	const name = getContext('test');
</script>

<div>{name}</div>