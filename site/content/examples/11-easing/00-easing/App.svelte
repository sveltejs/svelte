<script>
  import { strings } from "svelte/interpolate";
  import { tweened } from "svelte/motion";
  import { cubicBezier, easeOut } from "svelte/easing";
  import { onDestroy } from "svelte";

  import Grid from "./Grid.svelte";
  import Controls from "./Controls.svelte";

  import { eases, types, generate } from "./eases.js";

  let current_type = "In";
  let current_ease = "sine";
  let duration = 2000;
  let current = eases.get(current_ease)[current_type];
  let playing = false;
  let width;

  const ease_path = tweened(current.shape, {
    interpolate: strings,
    easing: easeOut,
  });
  const time = tweened(0);
  const value = tweened(1000);

  async function runAnimations() {
    playing = true;
    value.setImmediate(1000);
    time.setImmediate(0);
    ease_path.set(is_custom ? generate(current_bezier) : current.shape);
    time.set(1000, { duration });
    value.set(0, { duration, easing: is_custom ? current_bezier : current.fn });
  }

  onDestroy(time.onRest(() => (playing = false)));
  $: is_custom = current_ease.includes("Bezier");
  $: current = !is_custom && eases.get(current_ease)[current_type];
  $: current_bezier, current, runAnimations();
  let eq;
  let x1, x2, y1, y2;
  $: current_bezier = bezier && cubicBezier(...bezier);
  let bezier;
  let div;
</script>

<style>
  .easing-vis {
    display: flex;
    max-height: 95%;
    max-width: 800px;
    margin: auto;
    padding: 10px;
    border: 1px solid #333;
    border-radius: 2px;
    padding: 20px;
  }

  .svg1 {
    width: 100%;
    margin: 0 20px 0 0;
  }

  .graph {
    transform: translate(200px, 400px);
  }

  @media (max-width: 600px) {
    .easing-vis {
      flex-direction: column;
      max-height: calc(100% - 3rem);
    }
  }
  circle {
    z-index: 10;
    position: absolute;
  }
</style>

<div bind:offsetWidth={width} bind:this={div} class="easing-vis">
  {#if is_custom}
    <div
      style="position:absolute;z-index:10;left:120px;top:150px;font-size:24px;">
      cubicBezier({bezier})
    </div>
  {/if}
  <svg class="svg1" viewBox="0 0 1400 1802">
    <g class="canvas">
      <Grid {is_custom} bind:bezier x={$time} y={$value}>
        <g class="graph">
          <path d={$ease_path} stroke="tomato" stroke-width="10" fill="none" />
          <circle cx={$time} cy={$value} r="15" fill="#333" />
        </g>
      </Grid>
    </g>
  </svg>
  <Controls
    {is_custom}
    {eases}
    {types}
    {playing}
    {width}
    {bezier}
    bind:duration
    bind:current_ease
    bind:current_type
    on:play={runAnimations} />
</div>
