<script>
	import { setContext } from 'svelte';
	import Sub from './sub.svelte';

	let list = $state([]);
	setContext('list', list);
</script>

<Sub />
