<script>
	import Child from './child.svelte';

	class X {
		y = $state(1);
	}

	const klass = new X();

	let y = $state(1);
	const getter_setter = {
		get y() {
			return y;
		},
		set y(value) {
			y = value;
		}
	}
</script>

<Child {klass}  {getter_setter} />
