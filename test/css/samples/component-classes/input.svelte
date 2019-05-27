<script>
	const Nested = window.Nested;

	export let clazz = 'foo';
</script>

<Nested class="custom { clazz } custom2" />

<style>
	.custom {
		color: red;
	}

	.custom2 {
		background: yellow;
	}
</style>
