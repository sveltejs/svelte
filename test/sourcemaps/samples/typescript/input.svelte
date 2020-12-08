<script lang="ts">
  import { onMount } from 'svelte';

  let count: number = 0;

  onMount(() => {
    const id = setInterval(() => count++, 1000);
    return () => clearInterval(id);
  });
</script>

<h1>Hello world!</h1>
<div>Counter value: {count}</div>
