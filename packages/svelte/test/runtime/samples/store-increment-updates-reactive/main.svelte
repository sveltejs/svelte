<script>
	import { writable } from 'svelte/store';

	const foo = writable(0);

	export function increment() {
		$foo++;
	}
</script>

{$foo}
