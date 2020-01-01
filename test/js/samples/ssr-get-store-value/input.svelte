<script>
	import { readable } from "svelte/store";
	let style = readable("foo");
</script>

{$style}