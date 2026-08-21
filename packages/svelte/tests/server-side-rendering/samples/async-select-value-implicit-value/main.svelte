<select value={await Promise.resolve('dog')}>
	<option>--Please choose an option--</option>
	<option>{await Promise.resolve('dog')}</option>
	<option>cat</option>
</select>