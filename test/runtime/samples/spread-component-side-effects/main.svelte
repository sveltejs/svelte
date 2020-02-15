<script>
	import Widget from './Widget.svelte';

	export let foo = 'foo';

	let i = 0

	const getProps = (foo) => {
		i += 1;
		return { foo,  i };
	}
</script>

<div>
	<Widget {...getProps(foo)} qux="named"/>
</div>
