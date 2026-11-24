<script lang="ts">
	let attrs = { title: 'x' };
</script>

<div {...attrs} style:color|important="red" style:background-color="blue"></div>
<svelte:element this="p" {...attrs} style:color|important="red"></svelte:element>
<select>
	<option style:color|important="red">a</option>
</select>
