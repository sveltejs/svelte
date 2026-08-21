<script>
	import { get, set } from "./test.svelte.js";

	$: console.log("");
</script>

<p>{get()}</p>

<button onclick={()=>set()}></button>