<script>
	export let bar = 1;
	export let baz = 2;

	export function double() {
		bar = bar * 2;
		baz = baz * 2;
	}
</script>

<p>bar in Foo: {bar}</p>
<p>baz in Foo: {baz}</p>