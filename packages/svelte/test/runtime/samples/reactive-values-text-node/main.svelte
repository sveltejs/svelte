<script>
	export let deferred;
	let text = 'same';
	setTimeout(() => {
		text = 'same text';
		deferred.resolve();
	}, 5);
</script>

<div>{text} text</div>
