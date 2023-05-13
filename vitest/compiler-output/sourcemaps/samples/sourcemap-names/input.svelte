<script>
	export let old_name_1 = { baritone: 5 };
	let old_name_2 = 'value_2';
</script>
<style>
	div {
		background-color: var(--bazitone);
	}
</style>
<h1>use-names</h1>
<div>{old_name_1.baritone}</div>
<pre style="color: var(--bazitone)">{old_name_2}</pre>
