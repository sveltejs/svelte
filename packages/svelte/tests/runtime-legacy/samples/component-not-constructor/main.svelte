<script>
	import Sub from './Sub.svelte';
	export let selected;
	let banana = {};
	let component = banana;
	$: selected ? component = Sub : component = banana;
</script>

<svelte:component this={component} />
