<script>
  import Component from "./Component.svelte";
  function foo(node, params) {
    return {
      duration: 100,
      tick: t => {
        node.foo = t;
      }
    };
  }
  let isFirst = true;
  let animationActive = false;

  const toggle = () => {
    if (animationActive) {
      return;
    }

    animationActive = true;
    Promise.resolve().then(() => {
      isFirst = !isFirst;
      animationActive = false;
    });
  };
</script>

<button on:click={toggle}>TOGGLE</button>
{#if !animationActive}
  <div out:foo>
    {#if isFirst}
      <Component {isFirst} />
    {:else}
      <Component {isFirst} />
    {/if}
  </div>
{/if}
