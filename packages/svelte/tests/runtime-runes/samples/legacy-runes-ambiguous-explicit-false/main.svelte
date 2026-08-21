<svelte:options runes={false} />
<script>
	import { get, set } from "./test.svelte.js";
</script>

<p>{get()}</p>

<button onclick={()=>set()}></button>