<script>
	import Outer from './Outer.svelte';
	import Inner from './Inner.svelte';

	let object = $state({ count: 0 });
</script>

<Outer>
	<Inner bind:object />
</Outer>
