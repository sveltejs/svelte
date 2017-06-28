const path = require('path');
const fs = require('fs');
const childProcess = require('child_process');
const fetch = require('node-fetch');

const username = process.env.SAUCE_USERNAME;
const accessKey = process.env.SAUCE_ACCESS_KEY;
const build = process.env.TRAVIS_BUILD_NUMBER;
const pullRequest = process.env.TRAVIS_PULL_REQUEST;
const tags = [ process.env.TRAVIS_NODE_VERSION, 'CI' ];
const idleTimeout = 30;

if (pullRequest === 'false') {
    console.log('Benchmark skipped.');
    process.exit(0);
}

const outputFile = path.join(process.cwd(), 'tmp', 'output.txt');

const args = [
    `--capabilities=${JSON.stringify([
/*            {
                browserName: 'safari',
                version: '10.0',
                platform: 'macOS 10.12',
                username,
                accessKey,
                idleTimeout,
                build,
                tags,
            },
            {
                browserName: 'internet explorer',
                version: '11.103',
                platform: 'Windows 10',
                username,
                accessKey,
                idleTimeout,
                build,
                tags,
            },
*/
            {
                browserName: 'firefox',
                version: 'latest',
                platform: 'Windows 10',
                username,
                accessKey,
                idleTimeout,
                build,
                tags,
            },
            {
                browserName: 'chrome',
                version: 'latest',
                platform: 'Windows 10',
                username,
                accessKey,
                idleTimeout,
                build,
                tags,
            },
    ])}`,
    `--server=http://${username}:${accessKey}@ondemand.saucelabs.com/wd/hub`,
    `--custom=${process.cwd()}`,
    `--output=${outputFile}`,
    `--iterations=15`,
];

try {
    childProcess.execFileSync(path.join(__dirname, 'benchmark.sh'), args, {
        cwd: process.cwd(),
        stdio: 'inherit'
    });
} catch (err) {
    console.error('An error occurred running the benchmark!');
}

const githubUsername = 'Svelte-Bot';
const id = 29757693;
const githubToken = process.env.GITHUB_ACCESS_TOKEN;
const headers = {
    Authorization: `token ${githubToken}`
};

fetch(`https://api.github.com/repos/sveltejs/svelte/issues/${pullRequest}/comments`, { headers })
    .then(res => res.json())
    .then(res => {
        let addComment = false;
        let editId = null;
        console.log('[DEBUG]', res);
        if (res.length === 0) {
            addComment = true;
        } else if (res[res.length - 1].user.id === id) {
            addComment = true;
            editId = res[res.length - 1].id;
        }

        if (addComment) {
            const contents = '<details><summary>Benchmark Results</summary>' + fs.readFileSync(outputFile) + '</details>';
            if (editId === null) {
                return fetch(`https://api.github.com/repos/sveltejs/svelte/issues/${pullRequest}/comments`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        body: contents
                    })
                });
            } else {
                return fetch(`https://api.github.com/repos/sveltejs/svelte/issues/comments/${editId}`, {
                    method: 'PATCH',
                    headers,
                    body: JSON.stringify({
                        body: contents
                    })
                });
            }
        }
    });
