<script>
	import Component2 from './Component2.svelte';
</script>

<Component2>
  <svelte:fragment slot="first">
	  <slot name="first" />
	  <slot name="second" />
  </svelte:fragment>
  <svelte:fragment slot="second">
	  <slot name="third" />
	  <slot name="fourth" />
	  <slot name="fifth" />
  </svelte:fragment>
</Component2>
