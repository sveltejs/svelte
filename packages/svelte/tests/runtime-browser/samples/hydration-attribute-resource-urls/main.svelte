<script>
	export let number = 1;
	export let boolean = true;
</script>

<svg>
	<image href={number} />
	<image href={boolean} />
	<image {...{ href: number }} />
	<image {...{ href: boolean }} />
	<image {...{ 'xlink:href': number }} />
	<image {...{ 'xlink:href': boolean }} />
</svg>
