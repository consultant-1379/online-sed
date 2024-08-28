#!/bin/bash

npm --prefix web run dev:test &
npm --prefix web run test:api-server-ci