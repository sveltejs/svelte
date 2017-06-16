#!/usr/bin/env bash
set -e

DIR=./tmp/svelte-bench
REPO=https://github.com/PaulBGD/svelte-bench.git

if [ ! -d $DIR ]; then
    git clone $REPO $DIR
fi

cd $DIR
git pull origin selenium
git checkout selenium

yarn
yarn run build:benchmarks
node ./selenium/run.js "$@"
