<script>
	let { style } = $props();
</script>

<div {style}></div>
<div {...{style}}></div>

<custom-element {style}></custom-element>
<custom-element {...{style}}></custom-element>
