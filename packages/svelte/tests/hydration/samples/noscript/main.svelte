<script>
  import { onMount } from "svelte";
  let count = 0;
  onMount(() => count++);
</script>

<noscript>JavaScript is required for this site.</noscript>

<h1>Hello!</h1><p>Count: {count}</p>
