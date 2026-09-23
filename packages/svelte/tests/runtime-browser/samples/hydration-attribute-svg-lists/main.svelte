<script>
	export let n = 1;
</script>

<svg>
	<text x={n} rotate={n}>a<tspan {...{ dy: n }}>b</tspan></text>
	<filter>
		<feColorMatrix type="saturate" {...{ values: n }} />
		<feComponentTransfer><feFuncR type="discrete" tableValues={n} /></feComponentTransfer>
		<feConvolveMatrix order="1" {...{ kernelMatrix: n }} />
	</filter>
</svg>
