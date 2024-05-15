<div onclick={(e) => { console.log('clicked div') }}>
	<button onclick={(e) => { console.log('clicked button'); e.stopPropagation() }}>
		Button
	</button>
</div>
