const sander = require('sander');

process.chdir(__dirname);

sander.readdirSync('samples').forEach(dir => {
	if (dir[0] === '.') return;

	sander.rimrafSync(`samples/${dir}/expected`);
	sander.copydirSync(`samples/${dir}/actual`).to(`samples/${dir}/expected`);
});