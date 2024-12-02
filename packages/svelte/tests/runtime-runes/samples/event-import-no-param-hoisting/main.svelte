<script>
	import { num, increment } from './state.svelte.js';
	import Component from './Component.svelte';

	function foo() {
		increment();
		console.log(num);
	}
</script>

<Component {foo} />
