<script lang="ts"> 
  import Test from './test.svelte';
</script>

<svelte:boundary onerror={(e) => {console.log(e.stack)}}>
  <Test />
</svelte:boundary>
