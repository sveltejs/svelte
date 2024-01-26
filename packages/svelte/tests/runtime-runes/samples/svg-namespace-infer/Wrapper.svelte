<text x="0" y=14>outside</text>

{#if true}
  <text x="0" y="26">true</text>
{:else}
  <text x="0" y="26">false</text>
{/if}

{#each  Array(3).fill(0) as item, idx}
  <text x={idx * 10} y={42}>{idx}</text>
{/each}

<!-- comment should not set infer html namespace -->
