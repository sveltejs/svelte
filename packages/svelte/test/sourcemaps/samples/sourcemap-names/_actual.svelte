<script>
	export let new_name_1 = { bar: 5 };
	let new_name_2 = 'value_2';
</script>
<style>
	div {
		background-color: var(--baz);
	}
</style>
<h1>use-names</h1>
<div>{new_name_1.bar}</div>
<pre style="color: var(--baz)">{new_name_2}</pre>
