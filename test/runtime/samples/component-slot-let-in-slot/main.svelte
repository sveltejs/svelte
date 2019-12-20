<script>
	import Outer from './Outer.svelte'
	import Inner from './Inner.svelte'

	export let prop
</script>

<Outer {prop} let:value>
	<Inner>{value}</Inner>
</Outer>
