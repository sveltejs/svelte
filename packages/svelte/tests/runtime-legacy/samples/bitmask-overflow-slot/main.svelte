<script>
	import Echo from './Echo.svelte';
	import { untrack } from "svelte";

	export let reads = {};

	export let _0 = '0';
	export let _1 = '1';
	export let _2 = '2';
	export let _3 = '3';
	export let _4 = '4';
	export let _5 = '5';
	export let _6 = '6';
	export let _7 = '7';
	export let _8 = '8';
	export let _9 = '9';
	export let _10 = '10';
	export let _11 = '11';
	export let _12 = '12';
	export let _13 = '13';
	export let _14 = '14';
	export let _15 = '15';
	export let _16 = '16';
	export let _17 = '17';
	export let _18 = '18';
	export let _19 = '19';
	export let _20 = '20';
	export let _21 = '21';
	export let _22 = '22';
	export let _23 = '23';
	export let _24 = '24';
	export let _25 = '25';
	export let _26 = '26';
	export let _27 = '27';
	export let _28 = '28';
	export let _29 = '29';
	export let _30 = '30';
	export let _31 = '31';
	export let _32 = '32';
	export let _33 = '33';
	export let _34 = '34';
	export let _35 = '35';
	export let _36 = '36';
	export let _37 = '37';
	export let _38 = '38';
	export let _39 = '39';
	export let _40 = '40';

	const read = (value, label) => {
		untrack(() => {
			if (!reads[label]) reads[label] = 0;
			reads[label] += 1;
		});

		return value;
	};

	$: foo = read(_6, '_6') + ':' + read(_37, '_37');
	$: bar = read(_38, '_38');
</script>

<Echo dummy={_0} let:dummy>
	<p>{read(_0, '_0')}</p>
	<p>{read(_1, '_1')}</p>
	<p>{read(_2, '_2')}</p>
	<p>{read(_3, '_3')}</p>
	<p>{read(_4, '_4')}</p>
	<p>{read(_5, '_5')}</p>
	<p>{read(_6, '_6')}</p>
	<p>{read(_7, '_7')}</p>
	<p>{read(_8, '_8')}</p>
	<p>{read(_9, '_9')}</p>
	<p>{read(_10, '_10')}</p>
	<p>{read(_11, '_11')}</p>
	<p>{read(_12, '_12')}</p>
	<p>{read(_13, '_13')}</p>
	<p>{read(_14, '_14')}</p>
	<p>{read(_15, '_15')}</p>
	<p>{read(_16, '_16')}</p>
	<p>{read(_17, '_17')}</p>
	<p>{read(_18, '_18')}</p>
	<p>{read(_19, '_19')}</p>
	<p>{read(_20, '_20')}</p>
	<p>{read(_21, '_21')}</p>
	<p>{read(_22, '_22')}</p>
	<p>{read(_23, '_23')}</p>
	<p>{read(_24, '_24')}</p>
	<p>{read(_25, '_25')}</p>
	<p>{read(_26, '_26')}</p>
	<p>{read(_27, '_27')}</p>
	<p>{read(_28, '_28')}</p>
	<p>{read(_29, '_29')}</p>
	<p>{read(_30, '_30')}</p>
	<p>{read(_31, '_31')}</p>
	<p>{read(_32, '_32')}</p>
	<p>{read(_33, '_33')}</p>
	<p>{read(_34, '_34')}</p>
	<p>{read(_35, '_35')}</p>
	<p>{read(_36, '_36')}</p>
	<p>{read(_37, '_37')}</p>
	<p>{read(_38, '_38')}</p>
	<p>{read(_39, '_39')}</p>
	<p>{read(_40, '_40')}</p>

	<p>{read(_5, '_5') + ':' + read(_36, '_36')}</p>
	<p>{foo}</p>
	<p>{bar}</p>

	<p>{dummy}</p>
</Echo>