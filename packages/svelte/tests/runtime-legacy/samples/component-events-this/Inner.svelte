<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export const exists = true;
</script>

<button on:click={() => dispatch('bar')} />