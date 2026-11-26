<script>
	let fruit = $state('apple');
	let vegetable = $state('carrot');
</script>

<select>
	<optgroup label="Fruits">
		<span class="fruits-header">{fruit}</span>
		<option value="a"><span>{fruit}</span> {fruit}</option>
		<option value="b">banana</option>
	</optgroup>
	<optgroup label="Vegetables">
		<em class="veggies-header">{vegetable}</em>
		<option value="c"><em>{vegetable}</em> {vegetable}</option>
		<option value="d">Plain celery</option>
	</optgroup>
</select>

<button onclick={() => { fruit = 'orange'; vegetable = 'broccoli'; }}>Change</button>
