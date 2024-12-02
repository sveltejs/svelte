<script>
	import { writable } from 'svelte/store';
	import Child from './Child.svelte';

	let a = writable({ value: 0 });
	let b = writable({ nested: { value: 0 } });
</script>

<Child bind:value={$a.value} />
<Child bind:value={$b.nested.value} />
<p>{$a.value}</p>
<p>{$b.nested.value}</p>
