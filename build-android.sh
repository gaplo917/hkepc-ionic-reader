rm -rf ./platforms/android/build/outputs/apk/;

ionic build --release android;

jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore hkepc-ir.keystore ./platforms/android/build/outputs/apk/android-x86-release-unsigned.apk hkepc-ir;

jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore hkepc-ir.keystore ./platforms/android/build/outputs/apk/android-armv7-release-unsigned.apk hkepc-ir;

~/Android/sdk/build-tools/21.1.1/zipalign -v 4 ./platforms/android/build/outputs/apk/android-x86-release-unsigned.apk ./platforms/android/build/outputs/apk/android-x86-release.apk;

~/Android/sdk/build-tools/21.1.1/zipalign -v 4 ./platforms/android/build/outputs/apk/android-armv7-release-unsigned.apk ./platforms/android/build/outputs/apk/android-armv7-release.apk;

open ./platforms/android/build/outputs/apk/