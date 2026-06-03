<script>
	import { get, set } from "./test.svelte.js";

	export let x = 42;
</script>

{x}
<p>{get()}</p>

<button onclick={()=>set()}></button>