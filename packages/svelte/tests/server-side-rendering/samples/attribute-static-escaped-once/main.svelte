<script>
	let on = true;
	let color = 'red';
	let rest = {};
</script>

<span class="a&b<c&quot;d'e" class:on>class</span>
<b class="a&b<c&quot;d'e" class:on>scoped class</b>
<span style="--w: a&b; --x: 'a&b<c&quot;d'" style:color>style</span>
<span style:--y="a&b<c&quot;d'e">style directive</span>
<span {...rest} class="a&b<c&quot;d'e" title="a&b<c&quot;d'e" style:--z="a&b<c&quot;d'e">spread</span>
<svelte:element this="span" class="a&b<c&quot;d'e" class:on>svelte:element</svelte:element>
<input {...rest} value="a&b<c&quot;d'e" />
<textarea value="a&b<c&quot;d'e"></textarea>

<select value="a&b<c">
	<option title="a&b<c&quot;d'e">x</option>
	<option>a&amp;b&lt;c</option>
</select>

<style>
	b {
		color: red;
	}
</style>
