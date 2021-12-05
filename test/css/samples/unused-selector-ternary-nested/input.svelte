<script>
  export let active;
  export let hover;
</script>

<div class="thing {active ? 'active' : hover ? 'hover' : ''}">
  some stuff
</div>

<style>
  .thing {color: blue;}
  .active {color: blue;}
  .thing.active {color: blue;}
  .hover { color: blue; }
  .hover.unused { color: blue; }

  .unused {color: blue;}
</style>