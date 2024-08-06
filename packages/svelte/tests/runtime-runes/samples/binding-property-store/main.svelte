<script>
	import { writable } from 'svelte/store';
	import Child from './Child.svelte';

	let stuff = writable({ count: 0 });
</script>

<Child bind:count={$stuff.count} />
<p>{$stuff.count}</p>
