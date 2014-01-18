#!/bin/sh

FILENAME=cexchat++.zip

if [ -e $FILENAME ]; then
    rm $FILENAME
fi

zip --junk-paths $FILENAME \
    src/bootstrap.min.css \
    src/contentscript.js \
    src/icon128.png \
    src/icon16.png \
    src/icon48.png \
    src/jquery-1.10.2.min.js \
    src/manifest.json \
    src/popup.css \
    src/popup.html \
    src/popup.js \
    src/styles.css \
    src/underscore-1.5.2.min.js \
    README.md
