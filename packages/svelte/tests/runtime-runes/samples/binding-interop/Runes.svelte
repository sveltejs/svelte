<script>
	import Component1 from './Component1.svelte';
	import Component2 from './Component2.svelte';

	let object1 = $state({ value: 'foo' });
	let object2 = $state({ value: 'foo' });

	class Frozen {
		constructor(value) {
			this.value = value;
		}
	}
	let object3 = $state(new Frozen('foo'));
	let object4 = $state(new Frozen('foo'));

	let primitive1 = $state('foo');
	let primitive2 = $state('foo');
</script>

{object1.value}
<Component1 bind:object={object1} />

{object2.value}
<Component2 bind:object={object2} />

<!-- force them into a different render effect so they don't coincidently update with the others -->
{#if true}
	{object3.value}
	<Component1 bind:object={object3} />

	{object4.value}
	<Component2 bind:object={object4} />
{/if}

{primitive1}
<Component1 bind:primitive={primitive1} />

{primitive2}
<Component2 bind:primitive={primitive2} />
