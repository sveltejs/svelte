<script>
	import Component from './Component.svelte';

	let disabled = false;
  const undef = String(undefined);
</script>

<button on:click={() => disabled = !disabled}>Disable</button>

<Component>
	<button slot={undef} disabled={disabled}>Button</button>
</Component>

<Component>
	<button disabled={disabled} slot={undef}>Button</button>
</Component>
