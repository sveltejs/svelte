<script>
	export let thing;

	let a = "foo"
	let b = "bar"
</script>

{#switch thing}
	<p>i am default</p>	
{:case a}
	<p>i am foo</p>
{:case b}
	<p>i am bar</p>
{/switch}
