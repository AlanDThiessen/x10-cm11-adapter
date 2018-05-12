#/bin/bash

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

if [ $HOST_ARCH == "Darwin" ]; then
    SHASUM='shasum -a 256'
else
    SHASUM='shasum'
fi

if [ -n $ADDON_ARCH ]; then
    rm -f SHA256SUMS
    ${SHASUM} package.json *.js LICENSE > SHA256SUMS
    find node_modules -type f -exec ${SHASUM} {} \; >> SHA256SUMS
    TARFILE="$(npm pack)"
    tar -xvf $TARFILE
    TARFILE_ARCH="${TARFILE/.tgz/-${ADDON_ARCH}.tgz}"
    cp -r node_modules ./package
    tar -czf ${TARFILE_ARCH} package
    rm -rf package
    rm -f $TARFILE
    echo "Created ${TARFILE_ARCH}"
fi

