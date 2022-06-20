<script>
	import Nested from './Nested.svelte';
	import { count } from './store.js';

	export function increment() {
		$count++;
	}
</script>

<Nested />