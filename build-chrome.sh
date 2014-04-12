#!/bin/sh

BUILD_DIR=build
FILENAME=cexchat++-chrome.zip

if [ -e $FILENAME ]; then
    rm $FILENAME
fi

cp -R src $BUILD_DIR
cp README.md $BUILD_DIR

cd $BUILD_DIR
zip $FILENAME *
mv $FILENAME ..
cd ..
rm -rf $BUILD_DIR
