#!/usr/bin/env bash
gsutil -m rsync -r -c -d ./www/ gs://hkepc.ionic-reader.xyz
gsutil -m acl ch -u AllUsers:R gs://hkepc.ionic-reader.xyz/**/*
gsutil cors set cors-json-file.json gs://hkepc.ionic-reader.xyz