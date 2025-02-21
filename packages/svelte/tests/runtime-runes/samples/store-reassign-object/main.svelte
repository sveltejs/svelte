<script>
	import { writable } from "svelte/store";

	const obj = writable({ name: 'foo' });

	$obj = { name: 'bar' };

	const clone = structuredClone($obj);
</script>

<p>{clone.name}</p>
