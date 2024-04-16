<script>
	import Intermediate from './Intermediate.svelte';

	let object = $state({ count: 0 });
</script>

<Intermediate object={object} />
