<script>
	import { get, set } from "./test.svelte.js";

	$$props;
</script>

<p>{get()}</p>

<button onclick={()=>set()}></button>