<svelte:options accessors={false} />

<script>
	export let x;

	$: console.log('x', x);
</script>
