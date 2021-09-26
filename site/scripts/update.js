import sh from 'shelljs';

sh.env['FORCE_UPDATE'] = process.argv.includes('--force=true');

Promise.all([
	sh.exec('node ./scripts/get_contributors.js'),
	sh.exec('node ./scripts/update_template.js')
]);
