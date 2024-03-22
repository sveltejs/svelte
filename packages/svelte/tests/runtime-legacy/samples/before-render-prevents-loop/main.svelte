<script>
	import { beforeUpdate } from 'svelte';

	export let value;
	let mirror;

	beforeUpdate(() => {
		mirror = value;
	});
</script>

<p>{value}</p>
<p>{mirror}</p>
