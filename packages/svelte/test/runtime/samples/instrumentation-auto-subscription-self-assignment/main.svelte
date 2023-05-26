<script>
	import { writable } from 'svelte/store';
	const foo = writable([]);
	$: bar = $foo;
	export function go() {
		$foo.push(42);
		$foo = $foo;
	}
</script>

{JSON.stringify(bar)}
