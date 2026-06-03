<script lang="ts">
	import { getContext } from "svelte";

  let greeting = getContext("greeting");
  let recipient = getContext("recipient");
</script>

<p>{greeting} {recipient}</p>
