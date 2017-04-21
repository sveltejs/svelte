#!/usr/bin/env bash
set -e

git clone https://github.com/PaulBGD/svelte-bench.git ./tmp/svelte-bench
cd ./tmp/svelte-bench
git checkout selenium
yarn
yarn run build:benchmarks
node ./selenium/run.js "$@"
