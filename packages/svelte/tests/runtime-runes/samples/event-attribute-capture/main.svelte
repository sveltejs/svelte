<script>
	let captured = $state(false);

	/** @param {MouseEvent} event */
	const onclickcapture = (event) => {
		captured = event.eventPhase === event.CAPTURING_PHASE;
	};
</script>

<div {onclickcapture}>
	<button>click me</button>
	<p>captured: {captured}</p>
</div>
