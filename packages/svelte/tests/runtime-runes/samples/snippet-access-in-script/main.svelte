<script>
	import { fn } from "./fn.js";
	let variable = $state("var");

	fn(test);
</script>

{#snippet test()}
	{variable}
{/snippet}