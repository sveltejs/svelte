export default {
	get props() {
		return {
			firstString: 'cats',
			secondString: 'dogs',
			objectsArray: [
				{
					dogs: 'woof',
					cats: 'meow',
					stac: 'stack',
					DOGS: 'WOOF'
				},
				{
					dogs: 'A German sheppard',
					cats: 'A tailless cat',
					stac: 'A jenga tower',
					DOGS: 'A GERMAN SHEPPARD'
				},
				{
					dogs: 'dogs',
					cats: 'cats',
					stac: 'stac',
					DOGS: 'DOGS'
				}
			]
		};
	},

	html: `
		<p>cats: meow</p>
		<p>dogs: woof</p>
		<p>stac: stack</p>
		<p>DOGS: WOOF</p> 
		<p>cats: A tailless cat</p>
		<p>dogs: A German sheppard</p>
		<p>stac: A jenga tower</p>
		<p>DOGS: A GERMAN SHEPPARD</p> 
		<p>cats: cats</p>
		<p>dogs: dogs</p>
		<p>stac: stac</p>
		<p>DOGS: DOGS</p> 
	`
};
