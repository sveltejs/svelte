<script>
  import { spring } from "svelte/motion";
  import { framerate } from "svelte/environment";
  import { derived } from "svelte/store";

  const s = spring(50);
  let prev_time = now();
  let prev_value = 50;
  const velocity = derived(
    s,
    (v) =>
      (-prev_value + (prev_value = v)) / (-prev_time + (prev_time = now())),
    0.0
  );
  let l_time;
  $: canvas && Draw($velocity, $s);
  let { mass, stiffness, damping, soft } = s;
  $: s.soft = soft;
  $: s.mass = mass;
  $: s.stiffness = stiffness;
  $: s.damping = damping;
  let solver;

  function solve_spring(target, prev_velocity) {
    const target_ = target;
    const delta = target - $s;
    if (soft || 1 <= damping / (2.0 * Math.sqrt(stiffness * mass))) {
      const angular_frequency = -Math.sqrt(stiffness / mass);
      solver = (t) =>
        target_ -
        (delta + t * (-angular_frequency * delta - prev_velocity)) *
          Math.exp(t * angular_frequency);
    } else {
      const damping_frequency = Math.sqrt(
        4.0 * mass * stiffness - damping ** 2
      );
      const leftover =
        (damping * delta - 2.0 * mass * prev_velocity) / damping_frequency;
      const dfm = (0.5 * damping_frequency) / mass;
      const dm = -(0.5 * damping) / mass;
      let f = 0.0;
      solver = (t) =>
        target_ -
        (Math.cos((f = t * dfm)) * delta + Math.sin(f) * leftover) *
          Math.exp(t * dm);
    }
    reset_time = now();
    s.set((target__ = target));
  }
  let target__ = 50;
  let canvas;
  const start_time = now();
  let reset_time = start_time;
  const canvas_history = [];
  let max_x, min_x, max_y, min_y, canvas_width, canvas_height;
  let step, length;
  let last_index;
  let ctx;
  const XC = (x) => ((x - min_x) / (max_x - min_x)) * canvas_width;
  const YC = (y) =>
    canvas_height - ((y - min_y) / (max_y - min_y)) * canvas_height;
  const get_index = (i = 0) =>
    (i + Math.floor((prev_time - start_time) / framerate)) % length;
  function Draw() {
    if (!step) {
      max_y = canvas_height / 2;
      min_y = -canvas_height / 2;
      max_x = canvas_width / 1000;
      min_x = -max_x;
      step = framerate / 1000; //framerate / canvas_width;
      length = Math.floor(max_x / step);
      canvas_history.length = length;
      canvas_history.fill(0);
      ctx = canvas.getContext("2d");
    }
    ctx.lineWidth = 12;
    let offset = (prev_time - reset_time) / 1000;
    const start_index = get_index(0);
    if (last_index === (last_index = start_index) || !solver) return;
    ctx.clearRect(0, 0, canvas_width, canvas_height);
    ctx.beginPath();
    let x = min_x,
      y = 0,
      i = start_index + 1;
    ctx.moveTo(XC(x), YC(y));
    for (x += step; i <= length; i++)
      ctx.lineTo(XC(x), YC(canvas_history[i])), (x += step);
    for (i = 0; i < start_index; i++)
      ctx.lineTo(XC(x), YC(canvas_history[i])), (x += step);
    ctx.lineTo(
      XC(x),
      YC((canvas_history[start_index] = canvas_height / 2 - prev_value))
    );
    if (Math.abs(prev_value - solver(offset)) > 20) {
      solve_spring(target__, $velocity);
      offset = 0;
    }
    x = 0;
    while (x <= max_x)
      ctx.lineTo(
        XC((x += step)),
        canvas_height / 2 - YC(solver(x + step + offset))
      );
    ctx.stroke();
  }
</script>

<style>
  :global(body) {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }
  svg {
    width: 100vw;
    height: 100vh;
  }
  circle {
    fill: tomato;
  }
  canvas {
    width: 100vw;
    height: 100vh;
    position: absolute;
    left: 0;
    top: 0;
    z-index: -1;
  }
</style>

<svelte:window
  on:mousemove={(e) => solve_spring(e.clientY, $velocity)}
  bind:innerWidth={canvas_width}
  bind:innerHeight={canvas_height} />
<div style="position: absolute; right: 1em;">
  <label>
    <h3>velocity</h3>
    <progress
      value={!Number.isNaN($velocity) && Number.isFinite($velocity) && $velocity + 10}
      min={0}
      max={20} />
  </label>
  <label>
    <h3>speed</h3>
    <progress
      value={!Number.isNaN($velocity) && Number.isFinite($velocity) && Math.abs($velocity)}
      min={0}
      max={20} />
  </label>
  <label>
    <h3>y {$s.toFixed(0)}</h3>
    <progress value={!Number.isNaN($s) && $s} min={0} max={1000} />
  </label>
  <label>
    <h3>target {target__}</h3>
    <progress value={!Number.isNaN(target__) && target__} min={0} max={1000} />
  </label>
  <label>
    <h3>stiffness ({stiffness})</h3>
    <input bind:value={stiffness} type="range" min="10" max="200" step="0.01" />
  </label>

  <label>
    <h3>damping ({damping})</h3>
    <input bind:value={damping} type="range" min="0.1" max="20" step="0.01" />
  </label>
  <label>
    <h3>mass ({mass})</h3>
    <input bind:value={mass} type="range" min="0.1" max="20" step="0.01" />
  </label>
  <label>
    <h3>
      soft
      <input bind:checked={soft} type="checkbox" />
    </h3>
  </label>
</div>
<svg>
  <circle
    cx={-15+canvas_width / 2}
    cy={$s}
    r={30} />
</svg>
<canvas bind:this={canvas} width={canvas_width} height={canvas_height} />
