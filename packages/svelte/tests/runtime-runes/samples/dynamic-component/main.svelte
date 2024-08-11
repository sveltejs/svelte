<script>
	import Component1 from './Component1.svelte';
	import Component2 from './Component2.svelte';

	let Component = $state(Component1);
	let Object = {
		get component() {
			return Component;
		}
	};
</script>

<button onclick={() => (Component = Component2)}>switch</button>

<Component />
<Object.component />
