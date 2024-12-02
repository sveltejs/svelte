<svelte:options runes={false} />

<script>
	import Component1 from './Component1.svelte';
	import Component2 from './Component2.svelte';

	let object1 = { value: 'foo' };
	let object2 = { value: 'foo' };

	let primitive1 = 'foo';
	let primitive2 = 'foo';
</script>

{object1.value}
<Component1 bind:object={object1} />

{object2.value}
<Component2 bind:object={object2} />

{primitive1}
<Component1 bind:primitive={primitive1} />

{primitive2}
<Component2 bind:primitive={primitive2} />
