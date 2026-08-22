<script>
	import { mount, onMount } from 'svelte';
	import Component from './component.svelte';

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

	let div1, div2;
	const accessor = new AccessorProps();
	const field = new FieldProps();

	onMount(() => {
		mount(Component, { target: div1, props: accessor });
		mount(Component, { target: div2, props: field });
	});
</script>

<div bind:this={div1}></div>
<div bind:this={div2}></div>
<p>accessor: {accessor.value} field: {field.value}</p>
