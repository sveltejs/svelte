<script>
  import { untrack } from 'svelte';
  let count = $state(0);
  let multiplier = $state(1);
  let result = $derived(count * untrack(() => multiplier));
</script>

<button on:click={() => multiplier++}>multiplier: {multiplier}</button>
<button on:click={() => count++}>result: {result}</button>
