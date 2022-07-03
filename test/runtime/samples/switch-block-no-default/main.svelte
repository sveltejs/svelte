<script>
	export let thing;

	let a = "foo"
	let b = "bar"
</script>

{#switch thing case a}
	<p>i am foo</p>
{:case b}
	<p>i am bar</p>
{/switch}
