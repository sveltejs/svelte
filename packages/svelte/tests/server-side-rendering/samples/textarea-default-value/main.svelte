<script>
	let dynamic = 'world';
</script>

<textarea defaultValue="hello"></textarea>
<textarea defaultValue={dynamic}></textarea>
<textarea defaultValue="hello">content wins</textarea>
<textarea defaultValue="hello" value="value wins"></textarea>
