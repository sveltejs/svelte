<script>
	const Nested = window.Nested;

	export let clazz = '';
</script>

<div class="foo">
	<Nested class={ clazz } />
</div>

<style>
	.foo {
		color: red;
	}
</style>
