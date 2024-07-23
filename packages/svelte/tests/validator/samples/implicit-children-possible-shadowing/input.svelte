<script>
	import Component from './Component.svelte';
	import Legacy from './Legacy.svelte';
</script>

<Component children="foo">Children</Component>

<Component children="foo" />

<Component children="foo"></Component>

<!-- svelte-ignore implicit_children_possible_shadowing -->
<Legacy children="foo">Legacy</Legacy>
