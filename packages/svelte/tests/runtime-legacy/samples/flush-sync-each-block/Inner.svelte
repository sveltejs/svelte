<svelte:options customElement={{
	tag: "my-inner",
	props: { value: { reflect: true }}
}} />
<script>
	export let value;
</script>
{value}
