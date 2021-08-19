#!/bin/sh

set -e

update_sh=$(cat update.sh)

if [[ ! -d .git ]]
then
    echo not in root directory
    exit 1
fi

if [[ -n $(git status --porcelain) ]]
then
    echo workspace not clean
    exit 1
fi

curr_commit=$(git log --oneline --max-count 1 | awk '{ print $1 }')

git reset --hard master
git checkout $curr_commit -- update.sh
git add update.sh
git commit -m 'add update.sh'

rm -fr dist/*
yarn build
git add -f dist
git commit -m 'build'
git push -f
