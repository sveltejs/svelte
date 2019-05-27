<script>
	import { writable } from '../../../../store';

	const foo = writable(0);

	export function increment() {
		$foo++;
	}
</script>

{$foo}
