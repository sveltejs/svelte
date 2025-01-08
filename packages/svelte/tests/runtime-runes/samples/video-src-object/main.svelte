<script>
	let srcObject = $state();

	$effect(() => {
		srcObject = {};
	})
</script>

<video {srcObject}></video>

