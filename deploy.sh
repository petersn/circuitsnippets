#!/bin/sh
set -e
set -x

npm run build
#scp public/* snpbox:/var/www/peter.website/circuit-boilerplate/
scp public/* snpbox:/var/www/circuitsnippets.com/

