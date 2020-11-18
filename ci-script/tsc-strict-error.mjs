const dirToCheck = [
    'compiler',
    'runtime',
]
const tsErrorsThreshold = [
    883,  /* 'compiler' */
    358,  /* 'runtime' */
];

import { promisify } from 'util';
import { exec as execCallback } from 'child_process';
const exec = promisify(execCallback);

const identity = i => i;

async function main() {
    const errors = await Promise.all(dirToCheck.map(dir => getTsErrors(dir)));
    const errorsCount = errors.map(countTsErrors);
    const noop = () => void 0;

    let conditionallyPrintError = [noop, noop];
    let conditionallyExplainError = noop;
    let printErrorCount = [noop, noop];
    let conditionallyAskForFix = noop;
    let conditionallyExitWithNonZeroCode = noop;

    for (let i = 0; i < tsErrorsThreshold.length; i++) {
        if(errorsCount[i] > tsErrorsThreshold[i]) {
            conditionallyPrintError[i] = () => console.log(errors[i]);
            conditionallyExplainError = () => console.log(`This project is in the processing of enforcing TypeScript's "strict": true`);
            printErrorCount[i] = () => printErrorFromCompileCount(dirToCheck[i], errorsCount[i], tsErrorsThreshold[i], 'higher than')
            conditionallyAskForFix = () => console.log(`Please fix the some of the above mentioned errors to bring the number of errors below the allowed threshold`);
            conditionallyExitWithNonZeroCode = () => process.exit(42);
        } else {
            printErrorCount[i] = () => printErrorFromCompileCount(dirToCheck[i], errorsCount[i], tsErrorsThreshold[i], 'less than or equal to')
        }
    }
    conditionallyPrintError.forEach(f => f());
    conditionallyExplainError();
    printErrorCount.forEach(f => f());
    conditionallyAskForFix()
    conditionallyExitWithNonZeroCode();
}

main();

async function getTsErrors(dir) {
    const { stdout } = await exec(`npx tsc -p src/${dir} --noEmit`).then(identity, identity);
    return stdout

}

function countTsErrors(stdout) {
    return (stdout.match(/error TS/g) || []).length
}

function printErrorFromCompileCount (dir, count, allowed, operator ) {
    console.log(`in src/${dir}: The number of errors resulting from TypeScript's "strict": true is, ${count}, ${operator} allowed ${allowed}`);
}
