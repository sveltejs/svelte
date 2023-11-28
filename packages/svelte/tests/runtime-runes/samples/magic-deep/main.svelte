<script>
	import { magic } from 'svelte';

	const object = magic({
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
