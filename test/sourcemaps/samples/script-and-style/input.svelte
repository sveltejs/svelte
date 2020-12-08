<script>
  import { onMount } from 'svelte';

  let count = 0;

  onMount(() => {
    const id = setInterval(() => count++, 1000);
    return () => clearInterval(id);
  });
</script>

<style>
  h1 {
    color: orange;
  }
</style>

<h1>Hello world!</h1>
<div>Counter value: {count}</div>
