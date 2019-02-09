<script>
	import Outer from './Outer.svelte';
	import Inner from './Inner.svelte';

	export let foo = true;
</script>

<Outer {foo}>
	One
	<Inner/>
</Outer>