<script context="module">
	export function preload(input) {
		return output;
	}
</script>

<script>
	import { onDestroy, onMount } from 'svelte';

	onMount(() => {
		console.log('onMount');
	});

	onDestroy(() => {
		console.log('onDestroy');
	});

	function foo() {
		console.log('foo');
	}

	function swipe(node, callback) {
		// TODO implement
	}
</script>