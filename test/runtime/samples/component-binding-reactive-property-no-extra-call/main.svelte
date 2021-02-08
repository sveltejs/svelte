<script>
	import Component from './Component.svelte';

	export let primitive_updates = 0;
	export let object_updates = 0;

	const obj = { foo: '' };
	let foo = 'bar';
	$: if (obj) object_updates++;
	$: if (foo) primitive_updates++;
</script>

<Component bind:value={obj.foo} bind:value2={foo} />
