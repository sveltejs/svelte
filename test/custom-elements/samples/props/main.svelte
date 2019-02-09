<svelte:options tag="custom-element"/>

<script>
	import './my-widget.svelte';

	export let items = ['a', 'b', 'c'];
</script>

<my-widget class="foo" {items}/>
