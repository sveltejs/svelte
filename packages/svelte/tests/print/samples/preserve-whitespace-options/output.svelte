<svelte:options preserveWhitespace /><script lang="ts">
	let value = $state('value');
</script>



<p>  before <b>bold</b>  {value}  after  </p>
<p><span>no</span><span>gap</span></p>
<p>before
  after&nbsp;  </p>
{#if value}  before
  <span>  inside  </span>  after  {/if}
