<script lang="ts">
	import { getContext } from "svelte";

  let greeting = getContext("greeting");
</script>

<p>{greeting}</p>