<script>
	const dynamic_value = 'bar';
</script>
<div class="{dynamic_value} baz">bar</div>
<div class="foo {dynamic_value} baz">bar</div>

<style>
	.baz {
		color: red;
	}
</style>
