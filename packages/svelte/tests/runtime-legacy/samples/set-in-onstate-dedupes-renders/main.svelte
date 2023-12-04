<script>
	import Widget from './Widget.svelte';

	export let foo = { x: 1 };
	export let bar = { x: 1 };

	$: {
		bar = foo;
	}
</script>

<Widget foo='{foo}' bar='{bar}'/>
