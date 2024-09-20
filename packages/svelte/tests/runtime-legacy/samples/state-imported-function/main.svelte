<script>
	import { obj } from "./Data.svelte.js";

	function replaceProp() {
		Object.assign(obj, {a:9, b:10, c:11});
	}
</script>

<button onclick={replaceProp}>Replace</button>

{Object.values(obj)}
