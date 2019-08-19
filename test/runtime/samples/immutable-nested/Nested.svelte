<script>
	import { beforeUpdate, onMount } from 'svelte';

	let mounted = false;
	export let count = 0;
	export let foo = { bar: 'baz' };

	onMount(() => {
		mounted = true;
	});

	beforeUpdate(() => {
		if (mounted) count += 1;
	});
</script>

<h3>Called {count} times.</h3>
<p>{foo.bar} {mounted}</p>