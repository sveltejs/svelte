<script>
	import child from './child.svelte';

	const components = { child };

	const arr = [child];

	const mixed = [components];
</script>

<components.child />

<arr[0] />

<mixed[0].child />
