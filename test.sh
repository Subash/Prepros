#!/bin/sh
./node_modules/jshint/bin/hint ./application/app/scripts*
hint=$?
if [ $hint != 0 ]; then
	echo "< script runner stopped jshint failed >";
	exit $hint
else
	echo "< jshint passed >";
fi