<script>
	import Child from './Child.svelte';
</script>

<Child>
	<div class="a">a</div>
	<div class="b" slot="wut">b</div>
	<div class="c">c</div>
</Child>

<style>
	.a + .c {
		color: green;
	}
</style>
