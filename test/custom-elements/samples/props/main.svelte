<svelte:options tag="custom-element"/>

<script>
	import './my-widget.svelte';

	export let items = ['a', 'b', 'c'];
	export let flagged = false;
	export let flaggedWithHyphen = false;
</script>

<my-widget class="foo" {items} flag1={flagged} flag2 flag-with-hyphen1={flaggedWithHyphen} flag-with-hyphen2 />
