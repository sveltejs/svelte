<script>
	import Component3 from './Component3.svelte';
</script>

<Component3>
  <svelte:fragment slot="first">
    <slot name="first" />
  </svelte:fragment>
  <svelte:fragment slot="second">
    <slot name="first" />
    <slot name="second" />
  </svelte:fragment>
  <svelte:fragment slot="third">
    <slot name="second" />
  </svelte:fragment>
</Component3>
