<script>
  let { a, arr } = $props();
</script>

<text x="0" y=14>outside blocks</text>

{#if a}
  {@const tag = "test"}
  <text x="0" y="26">A {tag}</text>
{:else}
  {@html "<text x=0 y=25>temp</text>"}
  <text x="0" y="26">not A</text>
{/if}

{#each arr as item, idx}
  <text x={idx * 10} y={42}>{item}</text>
{/each}

<!-- test comment -->
