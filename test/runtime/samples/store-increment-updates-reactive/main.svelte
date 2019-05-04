<script>
	import { writable } from '../../../../store.js';

	const foo = writable(0);

	export function increment() {
		$foo++;
	}
</script>

{$foo}
