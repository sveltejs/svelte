<script>
  export let active;
</script>

<div class="thing {active ? 'active' : ''}">
  some stuff
</div>

<style>
  .thing {color: blue;}
  .active {color: blue;}
  .thing.active {color: blue;}

  .unused {color: blue;}
</style>