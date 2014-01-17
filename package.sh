#!/bin/sh

FILENAME=cexchat++.zip

if [ -e $FILENAME ]; then
    rm $FILENAME
fi

zip $FILENAME\
    bootstrap.min.css\
    contentscript.js\
    icon128.png\
    icon16.png\
    icon48.png\
    jquery-1.10.2.min.js\
    manifest.json\
    popup.css\
    popup.html\
    popup.js\
    README.md\
    styles.css\
    underscore-1.5.2.min.js
