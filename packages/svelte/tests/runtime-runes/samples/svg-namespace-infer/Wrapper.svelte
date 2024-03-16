<text x="0" y=14>outside</text>

{#if true}
  <text x="0" y="26">true</text>
{/if}

{#each Array(2).fill(0) as item, idx}
  <text x={idx * 10} y={42}>{idx}</text>
{/each}

{@html '<text x="0" y="40">html</text>'}

{@render test("snippet")}

{#snippet test(text)}
<text x={20} y={42}>{text}</text>
{/snippet}

<!-- comment should not infer html namespace -->
