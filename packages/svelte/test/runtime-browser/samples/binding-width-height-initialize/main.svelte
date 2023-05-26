<script>
  export let offsetHeight;
  export let offsetWidth;
  export let toggle = false;
  $: if (offsetWidth) {
    toggle = true;
  }
</script>

<div class:toggle>
  <div bind:offsetHeight bind:offsetWidth>{offsetHeight}</div>
</div>

<style>
  .toggle > div {
    height: 800px;
  }
</style>
