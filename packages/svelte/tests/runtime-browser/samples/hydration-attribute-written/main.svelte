<script>
	import Replace from './Replace.svelte';

	let {
		on = { disabled: true },
		to_true,
		to_false,
		kept,
		parent = 'no',
		translate,
		draggable,
		href,
		n = 1,
		size = 30,
		observed,
		native,
		named,
		late,
		same
	} = $props();

	const disabled = { disabled: true };
	const hidden = { hidden: true };
</script>

<svg {...hidden}></svg>
<button {...disabled}>own</button>

<section id="spread">
	<button {...on}>x</button>
	<fieldset {...on}></fieldset>
	<input {...on} />
	<select {...on}><optgroup {...on} label="g"><option {...on}>o</option></optgroup></select>
	<textarea {...on}></textarea>
	<div {...on}></div>
	<p {...to_true}>a</p>
	<p {...to_false}>b</p>
	<p {...kept}>c</p>
</section>

<section id="accessors">
	<button {...disabled}>early</button>
	<div {...hidden}>early</div>
	<Replace />
	<button {...disabled}>late</button>
	<div {...hidden}>late</div>
	<button {...disabled}>own-while-hydrating</button>
</section>

<section translate={parent}><div {translate}>translate</div></section>
<a {href} {draggable}>link</a>

<canvas width={size} height={size}></canvas>
<canvas {...{ width: size, height: size }}></canvas>

<svg>
	<text x={n} rotate={n}>a<tspan {...{ dy: n }}>b</tspan></text>
	<filter>
		<feColorMatrix type="saturate" {...{ values: n }} />
		<feComponentTransfer><feFuncR type="discrete" tableValues={n} /></feComponentTransfer>
		<feConvolveMatrix order="1" {...{ kernelMatrix: n }} />
	</filter>
	<image href={n} />
	<image href={true} />
	<image {...{ href: n }} />
	<image {...{ href: true }} />
	<image {...{ 'xlink:href': n }} />
	<image {...{ 'xlink:href': true }} />
</svg>

<button {...observed.retained}>retained</button>
<button {...observed.removed}>removed</button>
<button {...observed.unset}>unset</button>
<button {...{ is: 'inherited-namespace-button', 'data-n': 1 }}>inherited</button>
<button {...{ is: 'own-namespace-button', 'data-n': 1 }}>own-namespace</button>
<button {...native.retained}>native-retained</button>
<button {...native.removed}>native-removed</button>
<button {...same}>same</button>
<form data-case="form-retained" {...named.retained}><input name="namespaceURI" /></form>
<form data-case="form-removed" {...named.removed}><input name="namespaceURI" /></form>
<form data-case="form-local-name" {...named.removed}><input name="localName" /></form>
<button {...late.retained}>late-retained</button>
<button {...late.removed}>late-removed</button>
