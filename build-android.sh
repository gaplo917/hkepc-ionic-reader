#!/bin/bash

# build sass, js & minify
while [ ! $# -eq 0 ]
do
    case "$1" in
        --release)
        echo "Building Release..."
        sh build-release.sh
            ;;
        --dev)
        echo "Building Dev..."
        sh build.sh
            ;;
    esac
    shift
done

if [ $# -eq 0 ]; then
    echo "No flag is entered, defalut to use --release"
	sh build-release.sh
fi

rm -rf ./platforms/android/build/outputs/apk/;

ionic build --release android;

jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore hkepc-ir.keystore ./platforms/android/build/outputs/apk/android-x86-release-unsigned.apk hkepc-ir;

jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore hkepc-ir.keystore ./platforms/android/build/outputs/apk/android-armv7-release-unsigned.apk hkepc-ir;

~/Android/sdk/build-tools/21.1.1/zipalign -v 4 ./platforms/android/build/outputs/apk/android-x86-release-unsigned.apk ./platforms/android/build/outputs/apk/android-x86-release.apk;

~/Android/sdk/build-tools/21.1.1/zipalign -v 4 ./platforms/android/build/outputs/apk/android-armv7-release-unsigned.apk ./platforms/android/build/outputs/apk/android-armv7-release.apk;

open ./platforms/android/build/outputs/apk/