<script>
	const disabled = { dIsAbLeD: false };
	const readonly = { readonly: false  }
	const readOnly = { readOnly: false }
</script>

<!-- lowercase, then compare -->
<button {...disabled}>click me</button>
<input {...readonly}>
<input {...readOnly}>

<!-- keep casing -->
<custom-element {...readonly}></custom-element>
<custom-element {...readOnly}></custom-element>

<!-- keep casing -->
<svg {...readonly}></svg>
<svg {...readOnly}></svg>
