<script>
	import { getContext } from 'svelte';

	const list = getContext('list');
</script>

<button onclick={() => list.push('foo')}>[{list.join(',')}]</button>
