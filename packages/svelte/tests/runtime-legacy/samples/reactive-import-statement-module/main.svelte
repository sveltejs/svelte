<script module>
	import state from './state.js';

	function update() {
		state.count += 1;
	}
</script>

<button on:click={update}>{state.count}</button>
