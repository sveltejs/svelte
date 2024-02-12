<script>
	import Component2 from './Component2.svelte';
	const {state} = $props();

	function render(state) {
    return state
  }
</script>

<Component2 state={render(state)} />

