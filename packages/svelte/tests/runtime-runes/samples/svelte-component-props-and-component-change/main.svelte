<script>
	import Comp1 from './Comp1.svelte'
	import Comp2 from './Comp2.svelte'

	let Component = $state(Comp1)
	let props = $state({
		prop1: "prop1"
	})
	
	function toggleComp() {
		if (Component == Comp1) {
			Component = Comp2
			props = {prop2: "prop2"}
		}
		else {
			Component = Comp1
			props = {prop1: "prop1"}
		}
	}
</script>

<svelte:component this={Component} {...props} />

<button onclick={toggleComp}>Swap Components</button>
