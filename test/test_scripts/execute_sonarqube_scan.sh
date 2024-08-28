#!/bin/bash
GERRIT_REFSPEC=$1
GERRIT_BRANCH=$2

echo "sonar.branch.name=${GERRIT_REFSPEC}
sonar.newCode.referenceBranch=${GERRIT_BRANCH}" >> /web/sonar-project.properties
npm --prefix web run sonar