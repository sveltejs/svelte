<script>
	export let blah = 'hello';
</script>

<div class:bar={true} {...{ class: 'foo' }}>{blah}</div>

<style>
	.foo {
		color: red;
	}
	.bar {
		background: blue;
	}
</style>
