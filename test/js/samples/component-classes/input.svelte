<script>
	const Nested = window.Nested;

	let otherCls = 'asd';
</script>

<Nested class="custom custom2 {otherCls}" />

<style>
	.custom {
		color: 'blue';
	}

	.custom2 {
		background: 'fuchsia';
	}
</style>
