<script>
	import Bla from './Bla.svelte';
</script>

<Bla>
	<button slot="foo" class:bar on:click={clickFn} let:bar let:clickFn>{bar}</button>
</Bla>
