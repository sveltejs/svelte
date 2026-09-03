<script>
	let active = $state(false);
	let color = $state('red');
	let size = $state(2);

	let derived_object = $derived({ color, padding: size + 'px' });
	let derived_array = $derived(['margin: 2px', { color, 'border-width': size + 'px' }]);
	let derived_string = $derived(`color: ${color}; opacity: ${active ? 0.5 : 1};`);
	let derived_conditional = $derived(active && { 'background-color': 'yellow' });
	let derived_spread = $derived({ style: { color, padding: size + 'px' } });
	let derived_with_falsy = $derived({
		color,
		'background-color': active ? 'yellow' : false,
		'border-color': active ? null : 'black'
	});
</script>

<!-- inline object literal -->
<div id="inline-object" style={{ color: 'red', 'background-color': 'blue' }}></div>

<!-- inline array of strings -->
<div id="inline-array-strings" style={['color: red', 'background-color: blue']}></div>

<!-- inline array mixing strings and objects, with trailing semicolons in the strings -->
<div id="inline-array-mixed" style={['color: red;', { padding: '4px', margin: '2px' }]}></div>

<!-- numeric values are kept as-is (including zero) -->
<div id="numeric" style={{ 'z-index': 0, opacity: 1, 'line-height': 1.5 }}></div>

<!-- nested arrays are flattened -->
<div id="nested" style={[['color: red'], [{ padding: '4px' }, ['margin: 2px']]]}></div>

<!-- every entry is falsy → no style attribute -->
<div id="all-falsy" style={[false, null, undefined, '']}></div>

<!-- empty object → no style attribute -->
<div id="empty-object" style={{}}></div>

<!-- conditional inline object: when the condition is false the whole object is dropped -->
<div id="conditional" style={[{ padding: '4px' }, active && { color: 'green' }]}></div>

<!-- object value that is `false` is filtered out at the property level -->
<div id="falsy-property" style={{ color: 'red', 'background-color': false, padding: null, margin: undefined }}></div>

<!-- inline reactive: rebuilt each render via direct $state reads -->
<div id="reactive-object" style={{ color, 'background-color': active && 'yellow' }}></div>
<div id="reactive-array" style={['padding: 2px', { color, 'border-color': active && 'green' }]}></div>

<!-- CSS custom properties are emitted verbatim -->
<div id="custom-prop" style={{ '--my-color': color, '--scale': 1 }}></div>

<!-- style: directive wins on overlapping property -->
<div id="directive-precedence" style={{ color: 'red', padding: '4px' }} style:color="blue"></div>

<!-- spread carrying an object -->
<div id="spread" {...{ style: { color, padding: '1px' } }}></div>

<!-- $derived returning an object -->
<div id="derived-object" style={derived_object}></div>

<!-- $derived returning a mixed array -->
<div id="derived-array" style={derived_array}></div>

<!-- $derived returning a string (existing behaviour, exercised through the same path) -->
<div id="derived-string" style={derived_string}></div>

<!-- $derived nested inside an inline array, alongside a literal -->
<div id="derived-in-array" style={['outline: 1px solid red', derived_object]}></div>

<!-- $derived gated by a condition: when falsy, no attribute should be emitted -->
<div id="derived-conditional" style={derived_conditional}></div>

<!-- $derived combined with style: directive, directive must win -->
<div id="derived-directive" style={derived_object} style:color="blue"></div>

<!-- $derived inside spread -->
<div id="derived-spread" {...derived_spread}></div>

<!-- $derived object with conditional falsy values -->
<div id="derived-falsy" style={derived_with_falsy}></div>

<button onclick={() => { active = !active; color = active ? 'green' : 'red'; size = active ? 8 : 2; }}>toggle</button>
