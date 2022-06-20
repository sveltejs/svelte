<style>
	div { color: red; }
	.bar { font-weight: bold; }
</style>

<div {...{ class: 'bar' }} class='foo'>red</div>

<div class='foo' {...{ class: 'qux' }}>red</div>

<div {...{ class: 'bar' }}>red and bold</div>
