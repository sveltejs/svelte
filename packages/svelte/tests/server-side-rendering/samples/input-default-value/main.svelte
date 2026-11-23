<script>
	const props = { defaultValue: 'spread', defaultChecked: true };
</script>

<input defaultValue="hello" />
<input type="checkbox" defaultChecked />
<input {...props} />
<input {...props} value="" checked={false} />
<input value="" checked={false} {...props} />
<input {...props} {...{ VALUE: '', CHECKED: false }} />
