#!/bin/bash
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

echo "Building iOS..."
ionic build ios