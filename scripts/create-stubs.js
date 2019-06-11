const fs = require('fs');

fs.readdirSync('src/runtime')
	.filter(dir => fs.statSync(`src/runtime/${dir}`).isDirectory())
	.forEach(dir => {
		fs.writeFileSync(`${dir}/package.json`, JSON.stringify({
			main: './index',
			module: './index.mjs'
		}, null, '  '));

		fs.writeFileSync(`${dir}/index.d.ts`, `export * from '../types/runtime/${dir}/index';`);
	});
