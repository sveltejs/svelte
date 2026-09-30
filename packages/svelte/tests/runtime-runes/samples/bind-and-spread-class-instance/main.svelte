<script>
	import Counter from './counter.svelte';

	class AccessorProps {
		#value = $state(0);
		get value() {
			return this.#value;
		}
		set value(v) {
			this.#value = v;
		}
	}

	class FieldProps {
		value = $state(0);
	}

	const accessor = new AccessorProps();
	const field = new FieldProps();
</script>

<Counter {...accessor} />
<Counter {...field} />
<p>accessor: {accessor.value} field: {field.value}</p>
