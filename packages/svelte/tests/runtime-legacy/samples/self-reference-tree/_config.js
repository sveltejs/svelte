import { test } from '../../test';

export default test({
	get props() {
		return {
			file: {
				name: '/',
				type: 'folder',
				children: [
					{ name: 'foo.jpg', type: 'image' },
					{ name: 'bar.jpg', type: 'image' },
					{
						name: 'baz',
						type: 'folder',
						children: [
							{ name: '.DS_Store', type: 'junk' },
							{ name: 'README.md', type: 'markdown' }
						]
					}
				]
			}
		};
	},

	html: `
		<article class='file folder'>
			<span class='name'>/</span>

			<ul>
				<li>
					<article class='file image'>
						<span class='name'>foo.jpg</span>
					</article>
				</li><li>
					<article class='file image'>
						<span class='name'>bar.jpg</span>
					</article>
				</li><li>
					<article class='file folder'>
						<span class='name'>baz</span>
						<ul>
							<li>
								<article class='file junk'>
									<span class='name'>.DS_Store</span>
								</article>
							</li><li>
								<article class='file markdown'>
									<span class='name'>README.md</span>
								</article>
							</li>
						</ul>
					</article>
				</li>
			</ul>
		</article>
	`
});
