<script>
	import { setContext } from 'svelte';
	const a = {};
	const b = setContext('foo', a);
</script>

<div>{a === b}</div>
