<script lang="ts">
	import { writable } from "svelte/store";

	let x = writable(0);
	const a = $x++;
	const b = ++$x;
	const c = $x--;
	const d = --$x;
</script>

{$x} {a} {b} {c} {d}
