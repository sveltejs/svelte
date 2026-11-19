<script>
	let value = 'dynamic';
</script>

<textarea defaultValue="hello"></textarea>
<textarea defaultValue={value}></textarea>
<textarea value="value" defaultValue="hello"></textarea>
<textarea defaultValue="hello" value="value"></textarea>
<textarea defaultValue="hello">child</textarea>
