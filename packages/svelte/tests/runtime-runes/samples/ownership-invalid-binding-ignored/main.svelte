<script>
	import Parent from './Parent.svelte';
	let test = $state({ test: '' });
</script>

<Parent {test} />
