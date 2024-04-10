<script>
	import Outer from './Outer.svelte'
	import Inner from './Inner.svelte'

	export let prop
	export let log;
</script>

<Outer {prop} let:value>
	<Inner><button on:click={() => { log(value); }}></button></Inner>
</Outer>
