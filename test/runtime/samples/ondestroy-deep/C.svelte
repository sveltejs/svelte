<script>
	import { onDestroy } from 'svelte';
	import { destroyed } from './destroyed.js';

	let yes = 1;

	onDestroy(() => destroyed.push('C'));
</script>