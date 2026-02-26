<script>
	const userdata = {
		id: 'profile-123',
		class: 'card',
		onclick: 'alert(1)',
		onerror: 'alert(1)',
		onfocus: 'alert(1)',
		onmouseover: 'alert(1)'
	};
</script>

<div {...userdata}>content</div>
<img src="x" alt="photo" {...{ onerror: 'alert(1)', onload: 'alert(1)' }} />
