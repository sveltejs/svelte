<script>
  import { fade } from "svelte/transition";

  let state = $state("hello");
</script>

<button onclick={() => state = ''}>hide</button>

{#switch !!state case true}
  <div in:fade={{ duration: 2000 }} out:fade={{ duration: 2000 }}>
    {#if true}
      {state}
    {/if}
  </div>
{/switch}

