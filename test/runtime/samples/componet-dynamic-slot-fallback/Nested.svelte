<script>
  const slot_names = ['foo', 'bar', 'baz', 'spam', 'eggs'];
</script>
<div>
	<slot><p class='default'>default fallback content</p></slot>
  {#each slot_names as slot}
	  <slot name={slot}><p class='default'>{slot} fallback content</p></slot>
  {/each}
</div>
