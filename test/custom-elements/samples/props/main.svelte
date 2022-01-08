<svelte:options tag="custom-element"/>

<script>
	import './my-widget.svelte';

	export let items = ['a', 'b', 'c'];
	export let flagged = false;
</script>

<my-widget class="foo" {items} flag1={flagged} flag2 />
