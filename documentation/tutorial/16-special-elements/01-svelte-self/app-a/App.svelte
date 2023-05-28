<script>
	import Folder from './Folder.svelte';

	let root = [
		{
			name: 'Important work stuff',
			files: [{ name: 'quarterly-results.xlsx' }]
		},
		{
			name: 'Animal GIFs',
			files: [
				{
					name: 'Dogs',
					files: [{ name: 'treadmill.gif' }, { name: 'rope-jumping.gif' }]
				},
				{
					name: 'Goats',
					files: [{ name: 'parkour.gif' }, { name: 'rampage.gif' }]
				},
				{ name: 'cat-roomba.gif' },
				{ name: 'duck-shuffle.gif' },
				{ name: 'monkey-on-a-pig.gif' }
			]
		},
		{ name: 'TODO.md' }
	];
</script>

<Folder name="Home" files={root} expanded />
