#!/usr/bin/env bash
set -e

DIR=./tmp/svelte-bench
REPO=https://github.com/sveltejs/svelte-bench.git

if [ ! -d $DIR ]; then
    git clone $REPO $DIR
fi

cd $DIR
git pull origin master

yarn
yarn run build:benchmarks

node ./selenium/run.js "$@"
