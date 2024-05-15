<script>
	const action = () => {}
</script>
<div use:action onclick={() => console.log('clicked container')} onkeydown={() => {}}>
	<div use:action onclick={(e) => { console.log('clicked div 1') }}>
		<div onclick={(e) => { console.log('clicked div 2') }}>
			<button onclick={(e) => { console.log('clicked button'); e.stopPropagation() }}>
				Button
			</button>
		</div>
	</div>
</div>
