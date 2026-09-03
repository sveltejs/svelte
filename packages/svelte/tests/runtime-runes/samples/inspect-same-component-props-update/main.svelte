<script>
	import Comp1 from './comp1.svelte';

	let Component = $state(Comp1);
	let props = $state({ prop1: 'prop1' });

	function update() {
		// same component, only props change
		props = { prop1: 'prop2' };
	}
</script>

<Component {...props} />

<button onclick={update}>Update Props</button>
