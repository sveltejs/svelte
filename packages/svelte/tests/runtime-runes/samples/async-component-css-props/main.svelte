<script lang="ts">
	import Child from './Child.svelte';

	await Promise.resolve();
	const width = '10rem';
</script>

<Child --width={width} />
