sh build-release.sh;

gsutil -m rsync -R ./www/ gs://hkepc.ionic-reader.xyz;

gsutil -m acl ch -u AllUsers:R gs://hkepc.ionic-reader.xyz/**/*;
