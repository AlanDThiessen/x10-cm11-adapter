#!/bin/bash -e

# Thanks to the zigbee-addon https://github.com/mozilla-iot/zigbee-adapter
# from Mozilla IoT  for parts of this script!

# Architecture options:
#    darwin-x64
#    linux-arm
#    linux-arm64
#    linux-ia32
#    linux-ia64
#    win32-ia32
#    win32-x64

ADDON_ARCH=$1
HOST_ARCH=`uname -s`

if [ -z $ADDON_ARCH ]; then
   echo Please specify an architecture.
   exit 1
fi

NODE_VERSION="$(node --version)"
TARFILE_SUFFIX="-${ADDON_ARCH}-${NODE_VERSION/\.*/}"

if [ $HOST_ARCH == "Darwin" ]; then
    SHASUM='shasum -a 256'
else
    SHASUM='sha256sum'
fi

rm -rf node_modules

# For openwrt-linux-arm and linux-arm we need to cross compile.
if [[ "${ADDON_ARCH}" =~ "linux-arm" ]]; then
    # We assume that CC and CXX are pointing to the cross compilers
    npm install --ignore-scripts --production
    npm rebuild --arch=armv6l --target_arch=arm
else
    npm install --production
fi

rm -f SHA256SUMS
${SHASUM} manifest.json package.json *.js LICENSE README.md > SHA256SUMS
rm -rf node_modules/.bin
find node_modules -type f -exec ${SHASUM} {} \; >> SHA256SUMS
TARFILE="$(npm pack)"
tar xzf ${TARFILE}
rm ${TARFILE}
TARFILE_ARCH="${TARFILE/.tgz/${TARFILE_SUFFIX}.tgz}"
cp -r node_modules ./package
tar czf ${TARFILE_ARCH} package
rm -rf package
echo "Created ${TARFILE_ARCH}"
