<script>
	import { get, set } from "./test.svelte.js";

	export const x = 42;
</script>

<p>{get()}</p>

<button onclick={()=>set()}></button>