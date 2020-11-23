<script>
	import { writable } from 'svelte/store';
	let store = writable(42);
	let variable = 42;
	let value;
	let value2;
	$: value = $store;
	$: value2 = variable;

	export function updateStore(value) {
		store.set(value);
	}
	export function updateVar(value) {
		variable = value;
	}
</script>

<p>{ value }</p>
<p>{ value2 }</p>