#!/usr/bin/env bash
# Builds and signs the debug APK without Gradle. Usage: ./build.sh <test-url>
set -euo pipefail
cd "$(dirname "$0")"
URL="${1:?test URL required}"
SDK="${ANDROID_SDK:-C:/Users/khsbo/scoop/apps/android-clt/current}"
BT="$SDK/build-tools/36.1.0"; AJ="$SDK/platforms/android-36/android.jar"
rm -rf build && mkdir -p build/gen build/classes build/dex build/res
sed "s#@@URL@@#$URL#" src/com/khsbory/arialabelledbytest/MainActivity.java > build/gen/MainActivity.java
"$BT/aapt2.exe" compile --dir res -o build/res/res.zip
"$BT/aapt2.exe" link -I "$AJ" --manifest AndroidManifest.xml build/res/res.zip --min-sdk-version 26 --target-sdk-version 36 --version-code 1 --version-name 1.0 -o build/unsigned.apk
javac -J-Dfile.encoding=UTF-8 -encoding UTF-8 -source 8 -target 8 -bootclasspath "$AJ" -d build/classes build/gen/MainActivity.java 2>&1 | grep -v "warning" || true
(cd build/classes && jar cf ../classes.jar .)
java -cp "$BT/lib/d8.jar" com.android.tools.r8.D8 --lib "$AJ" --min-api 26 --output build/dex build/classes.jar
(cd build/dex && jar uf ../unsigned.apk classes.dex)
"$BT/zipalign.exe" -f 4 build/unsigned.apk build/aligned.apk
KS=debug.keystore
[ -f "$KS" ] || keytool -genkeypair -keystore "$KS" -storepass android -keypass android -alias debug -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=aria-labelledby-test debug" -noprompt
java -jar "$BT/lib/apksigner.jar" sign --ks "$KS" --ks-pass pass:android --key-pass pass:android --ks-key-alias debug --out build/aria-labelledby-test.apk build/aligned.apk
echo "APK: $(pwd)/build/aria-labelledby-test.apk"
