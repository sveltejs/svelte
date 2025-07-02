<script>
	import B from './B.svelte';

	let { boolean, closed } = $props();

	$effect(() => {
		console.log(boolean);
	});
</script>

<B {closed} />
