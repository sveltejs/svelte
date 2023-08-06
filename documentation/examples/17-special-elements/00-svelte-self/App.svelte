<script>
	import Folder from './Folder.svelte';

	let root = [
		{
			type: 'folder',
			name: 'Trucs importants de boulot',
			files: [{ type: 'file', name: 'quarterly-results.xlsx' }]
		},
		{
			type: 'folder',
			name: "GIF d'animaux",
			files: [
				{
					type: 'folder',
					name: 'Chiens',
					files: [
						{ type: 'file', name: 'treadmill.gif' },
						{ type: 'file', name: 'rope-jumping.gif' }
					]
				},
				{
					type: 'folder',
					name: 'Chèvres',
					files: [
						{ type: 'file', name: 'parkour.gif' },
						{ type: 'file', name: 'rampage.gif' }
					]
				},
				{ type: 'file', name: 'cat-roomba.gif' },
				{ type: 'file', name: 'duck-shuffle.gif' },
				{ type: 'file', name: 'monkey-on-a-pig.gif' }
			]
		},
		{ type: 'file', name: 'À_FAIRE.md' }
	];
</script>

<Folder name="Home" files={root} expanded />
