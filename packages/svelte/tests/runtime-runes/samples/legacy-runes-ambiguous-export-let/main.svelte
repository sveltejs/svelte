<script>
	import { get, set } from "./test.svelte.js";

	let x = 42;

	export { x };
</script>

{x}
<p>{get()}</p>

<button onclick={()=>set()}></button>