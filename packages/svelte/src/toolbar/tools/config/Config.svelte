<div>
	<label for="position"
		>Position

		<select id="position">
			<option value="top-left">top left</option>
			<option value="top-left">top right</option>
			<option value="top-left">bottom right</option>
			<option value="top-left">bottom left</option>
		</select>
	</label>
</div>

<style>
	select option {
		color: black;
	}

	select:not(:checked) {
		color: var(--toolbar-color);
	}
</style>
