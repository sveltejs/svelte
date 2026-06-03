<script>
	import { expect2, createAppState } from "./util.svelte.js"

  const result = createAppState({ source: () => "wrong" });
  result.onChange("right");
  const expect1 = result.value === "right";
</script>

{expect1} {expect2}
