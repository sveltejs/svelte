const path = require('path');
const childProcess = require('child_process');

const username = process.env.SAUCE_USERNAME;
const accessKey = process.env.SAUCE_ACCESS_KEY;
const tunnelIdentifier = process.env.TRAVIS_JOB_NUMBER;
const build = process.env.TRAVIS_BUILD_NUMBER;
const tags = [ process.env.TRAVIS_NODE_VERSION, 'CI' ];
const idleTimeout = 30;

const args = [
    `--capabilities=${JSON.stringify([
/*            {
                browserName: 'safari',
                version: '10.0',
                platform: 'macOS 10.12',
                username,
                accessKey,
                idleTimeout,
                tunnelIdentifier,
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
                tunnelIdentifier,
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
                tunnelIdentifier,
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
                tunnelIdentifier,
                build,
                tags,
            },
    ])}`,
    `--server=https://${username}:${accessKey}@localhost:4445/wd/hub`
];

    childProcess.execFileSync(path.join(__dirname, 'benchmark.sh'), args, {
        cwd: process.cwd(),
        stdio: 'inherit'
    });
