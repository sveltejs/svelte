<script>
	let text = { defaultValue: "a" };
	let checkbox = { defaultChecked: true }
</script>

<input {...text} />
<input type="checkbox" {...checkbox} />
<input value="b" {...text} />