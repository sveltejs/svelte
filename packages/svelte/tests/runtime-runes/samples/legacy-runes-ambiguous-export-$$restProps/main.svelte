<script>
	import { get, set } from "./test.svelte.js";

	$$restProps;
</script>

<p>{get()}</p>

<button onclick={()=>set()}></button>