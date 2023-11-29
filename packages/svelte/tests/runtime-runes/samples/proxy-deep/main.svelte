<script>
	const object = $state({
		foo: {
			bar: {
				baz: 1
			}
		}
	});
</script>

<button onclick={() => object.foo.bar.baz += 1}>
	{object.foo.bar.baz}
</button>

<button onclick={() => object.foo.bar = { baz: object.foo.bar.baz * 2 }}>
	double
</button>
