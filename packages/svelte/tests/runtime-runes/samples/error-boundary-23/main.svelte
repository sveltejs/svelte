<script lang="ts"> 
  import Test from './test.svelte';
</script>

<svelte:boundary onerror={(e) => {console.log('error caught root')}}>
  <Test />
</svelte:boundary>
