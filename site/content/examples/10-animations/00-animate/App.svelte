<script>
  import { quintOut } from "svelte/easing";
  import { crossfade } from "svelte/transition";
  import { flip } from "svelte/animate";

  const [send, receive] = crossfade({
    fallback(node, params) {
      const style = getComputedStyle(node);
      const transform = style.transform === "none" ? "" : style.transform;
      return {
        duration: 600,
        easing: quintOut,
        css: (t) => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`,
      };
    },
  });

  let todos = [
    { key: 1, done: false, description: "write some docs" },
    { key: 2, done: false, description: "start writing JSConf talk" },
    { key: 3, done: true, description: "buy some milk" },
    { key: 4, done: false, description: "mow the lawn" },
    { key: 5, done: false, description: "feed the turtle" },
    { key: 6, done: false, description: "fix some bugs" },
  ];

  let ukey = todos.length + 1;

  function add(input) {
    todos = [{ key: ukey++, done: false, description: input.value }, ...todos];
    input.value = "";
  }

  function remove(key1) {
    todos = todos.filter(({ key }) => key !== key1);
  }
  $: list = todos.reduce((prev, td) => (prev[+td.done].push(td), prev), [
    [],
    [],
  ]);
  const animating = new Map();
  let lastShuffle = Date.now();
  let t = 0;
</script>

<style>
  .new-todo {
    font-size: 1.4em;
    width: 100%;
    margin: 2em 0 1em 0;
  }
  .board {
    max-width: 36em;
    margin: 0 auto;
  }
  .left,
  .right {
    float: left;
    width: 50%;
    padding: 0 1em 0 0;
    box-sizing: border-box;
  }
  h2 {
    font-size: 2em;
    font-weight: 200;
    user-select: none;
  }
  label {
    top: 0;
    left: 0;
    display: block;
    font-size: 1em;
    line-height: 1;
    padding: 0.5em;
    margin: 0 auto 0.5em auto;
    border-radius: 2px;
    background-color: #eee;
    user-select: none;
  }
  input {
    margin: 0;
  }
  .right label {
    background-color: rgb(180, 240, 100);
  }
  button {
    float: right;
    height: 1em;
    box-sizing: border-box;
    padding: 0 0.5em;
    line-height: 1;
    background-color: transparent;
    border: none;
    color: rgb(170, 30, 30);
    opacity: 0;
    transition: opacity 0.2s;
  }
  label:hover button {
    opacity: 1;
  }
</style>

<svelte:window
  on:keydown={(e) => {
    let [{ length: a }, { length: b }] = list;
    if (e.keyCode == 32) {
      if (lastShuffle > Date.now() - 100) {
        return;
      }
      lastShuffle = Date.now();
      e = 0;
      if (!a) e += 1;
      if (!b) e -= 2;
      if (!e) e += t = 0.5 + (b - a) / (a + b);
      s: if (~e) {
        a += b;
        let w = 1;
        while (animating.get((e = (e = list[(e = +(Math.random() + e > 0.5))])[Math.floor(Math.random() * e.length)]).key)) if (w++ > a) break s;
        e.done = !e.done;
        list = list;
      }
    }
  }} />
<div class="board">
  <input
    class="new-todo"
    placeholder="what needs to be done?"
    on:keydown={(event) => void (event.key === 'Enter' && add(event.target))} />
  {#each list as todo, i (i)}
    <div class={!i ? 'left' : 'right'}>
      <h2>{!i ? 'todo' : 'done'}</h2>
      {#each todo as { key, description, done: checked } (key)}
        <label
          in:receive={{ key }}
          out:send={{ key }}
          animate:flip
          on:outrostart={() => {
            animating.set(key, true);
          }}
          on:outroend={() => {
            animating.set(key, false);
          }}
          on:introstart={() => {
            animating.set(key, true);
          }}
          on:introend={() => {
            animating.set(key, false);
          }}>
          <input type="checkbox" bind:checked />
          {description}
          <button on:click={remove.bind(null, key)}>x</button>
        </label>
      {/each}
    </div>
  {/each}
</div>
