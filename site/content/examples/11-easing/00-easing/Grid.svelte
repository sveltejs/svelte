<script>
  export let is_custom;
  export let x, y;
  let rect;
  let rect2;
  export let x1 = 200,
    y1 = 1400,
    x2 = 1200,
    y2 = 400;
  let selected1 = false,
    selected2 = false;
  export let bezier = [0, 0, 0, 0];
  const radius = 30;
  $: {
    if (rect2) {
      const { x, y, width, height } = rect2.getBoundingClientRect();
      bezier = [
        Math.max(0, Math.min(1, (x1 - 200) / 1000)),
        -(y1 - 1400) / 1000,
        Math.max(0, Math.min(1, 1 + (x2 - 1200) / 1000)),
        1 - (y2 - 400) / 1000,
      ].map((v) => Math.round(v * 100) / 100);
    }
  }
</script>

<style>
  .grid-line {
    stroke: #ccc;
    opacity: 0.5;
    stroke-width: 2;
  }
  circle {
    z-index: 10;
    position: absolute;
  }
</style>

<svelte:options namespace="svg" />

<rect
  bind:this={rect}
  x="0"
  y="0"
  width="1400"
  height="1800"
  stroke="#ccc"
  style="opacity: 0.5"
  fill="none"
  stroke-width="2" />

{#each { length: 8 } as _, i}
  {#if i < 6}
    <path d="M{(i + 1) * 200} 0 L{(i + 1) * 200} 1802" class="grid-line" />
  {/if}
  <path d="M0 {(i + 1) * 200} L1400 {(i + 1) * 200} " class="grid-line" />
{/each}
<rect
  bind:this={rect2}
  x="200"
  y="400"
  width="1000"
  height="1000"
  stroke="#999"
  fill="none"
  stroke-width="4" />
<svelte:window
  on:mousemove={(e) => {
    const { x, y, width, height } = rect.getBoundingClientRect();
    const _x1 = Math.min(1200, Math.max(200, (e.clientX - x) * (1400 / width)));
    const _y1 = Math.min(1800, Math.max(0, (e.clientY - y) * (1800 / height)));
    if (selected1) (x1 = _x1), (y1 = _y1);
    else if (selected2) (x2 = _x1), (y2 = _y1);
  }}
  on:mouseup={() => {
    selected1 = selected2 = false;
  }} />
<slot />
{#if is_custom}
  <path d="M200 1400 L{x1} {y1} " stroke="#333333d9" stroke-width="10" />
  <path d="M1200 400 L{x2} {y2} " stroke="#333333d9" stroke-width="10" />
  <circle
    cx={x1}
    cy={y1}
    r={radius}
    fill="#333"
    stroke="transparent"
    stroke-width="100"
    on:mousedown={() => (selected1 = true)} />
  <circle
    cx={x2}
    cy={y2}
    r={radius}
    fill="#333"
    stroke="transparent"
    stroke-width="100"
    on:mousedown={() => (selected2 = true)} />
{/if}
