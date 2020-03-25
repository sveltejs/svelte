<script>
  let a = '1'
</script>

{#with a as b }
  <button on:click={e => a = '2'}>{b}</button>
{/with}
