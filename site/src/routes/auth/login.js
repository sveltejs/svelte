import send from '@polka/send';
import { stringify } from 'querystring';
import { oauth, baseurl, client_id } from './_config.js';

export const get = client_id
	? (req, res) => {
		const Location = `${oauth}/authorize?` + stringify({
			scope: 'read:user',
			client_id,
			redirect_uri: `${baseurl}/auth/callback`,
		});

		send(res, 302, Location, { Location });
	}
	: (req, res) => {
		send(res, 500, `
			<body style="font-family: sans-serif; background: rgb(255,215,215); border: 2px solid red; margin: 0; padding: 1em;">
				<h1>Missing .env file</h1>
				<p>In order to use GitHub authentication, you will need to <a target="_blank" href="https://github.com/settings/developers">register an OAuth application</a> and create a local .env file:</p>
				<pre>GITHUB_CLIENT_ID=[YOUR_APP_ID]\nGITHUB_CLIENT_SECRET=[YOUR_APP_SECRET]\nBASEURL=http://localhost:3000</pre>
				<p>The <code>BASEURL</code> variable should match the callback URL specified for your app.</p>
				<p>See also <a target="_blank" href="https://github.com/sveltejs/svelte/tree/master/site#repl-github-integration">here</a></p>
			</body>
		`, {
			'Content-Type': 'text/html; charset=utf-8'
		});
	};