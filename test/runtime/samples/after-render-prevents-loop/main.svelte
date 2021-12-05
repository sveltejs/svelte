<script>
	import { afterUpdate } from 'svelte';

	export let value;
	let mirror;

	afterUpdate(() => {
		mirror = value;
	});
</script>

<p>{value}</p>
<p>{mirror}</p>