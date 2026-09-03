<script>
	import Comp1 from './comp1.svelte';
	import Comp2 from './comp2.svelte';

	let Component = $state(Comp1);
	let props = $state({
		prop1: 'prop1'
	});

	function toggleComp() {
		if (Component == Comp1) {
			Component = Comp2;
			props = { prop2: 'prop2' };
		} else {
			Component = Comp1;
			props = { prop1: 'prop1' };
		}
	}
</script>

<Component {...props} />

<button onclick={toggleComp}>Swap Components</button>
