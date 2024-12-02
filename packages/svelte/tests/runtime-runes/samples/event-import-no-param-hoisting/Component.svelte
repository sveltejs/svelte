<script>
	import { num } from './state.svelte.js';
	let { foo } = $props();

	function onclick() {
		foo();
		console.log(num);
	}
</script>

<button {onclick}>click</button>
