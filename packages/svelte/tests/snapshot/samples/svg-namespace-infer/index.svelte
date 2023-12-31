<script>
  import Wrapper from "./Wrapper.svelte";

  let a = true;
  let arr = ["x", "y", "z"];
</script>

<svg>
  <Wrapper {a} {arr} />
</svg>

<svg>
 {#if a}
  {@const tag = "test"}
  <text x="0" y="26">A {tag}</text>
{:else}
  {@html "<text x=0 y=25>temp</text>"}
  <text x="0" y="26">not A</text>
{/if}

</svg>

{#each arr as item, idx}
  <text x={idx * 10} y={42}>{item}</text>
{/each}
