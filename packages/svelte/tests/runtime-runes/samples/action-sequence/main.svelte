<script>
	const action = (element) => {
		console.log(element.id);
	};
</script>

<div use:action id="5">
	<div use:action id="3">
		<div use:action id="1">
		</div>
		<div use:action id="2">
		</div>
	</div>
	<div use:action id="4">
	</div>
</div>
<div use:action id="6">
</div>
