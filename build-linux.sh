#!/bin/bash
LINUX=0
MAC=0
PKGMGR=0

haveProg() {
    [ -x "$(which $1)" ]
}

if haveProg apt-get; then
  echo "You are using apt-get. I'll assume you have Linux with that."
  LINUX=1
  PKGMGR=1
elif haveProg yum; then
  echo "You are using yum. I'll assume you have Linux with that."
  LINUX=1
  PKGMGR=2
elif haveProg up2date; then
  echo "You are using up2date. I'll assume you have Linux with that."
  LINUX=1
  PKGMGR=3
elif haveProg zypper; then
  echo "You are using zypper. I'll assume you have Linux with that."
  LINUX=1
  PKGMGR=4
else
  MAC=1
  PKGMGR=5
fi

echo ""

if [ "$MAC" -eq 1 ]; then
  echo "Installing on OS X."

  # check pre-installed ruby
  RUBYCHECK=$(ruby -e 'print RUBY_VERSION')

elif [ "$LINUX" -eq 1 ]; then
  echo "Installing on Linux."
else
  echo "Unable to determine install target OS! We currently support OS X and Linux."
  exit 1
fi

# brew installation
BREWFILE=$(which brew)

if [ "$MAC" -eq 1 ] && [ -z "$BREWFILE" ]; then
  echo "Installing Homebrew"
  echo -ne '\n' | curl -fsSkL raw.github.com/mxcl/homebrew/go | ruby
  echo ""
elif [ "$MAC" -eq 1 ] && [ "$BREWFILE" ]; then
  echo "You've got brew, nice work chap!"
fi


DPKGFILE=$(which dpkg)
if [ "$MAC" -eq 1 ] && [ -z "$DPKGFILE" ]; then
  echo "Installing DPKG using Homebrew"
  echo -ne '\n' | brew install dpkg
  echo ""
elif [ "$MAC" -eq 1 ] && [ "$DPKGFILE" ]; then
  echo "You've got DPKG, nice work chap!"
fi

#Removed and re-populate Node Modules
sudo rm -Rf ./node_modules
sudo npm install

rm ~/Desktop/Prepros_Linux_x86
rm ~/Desktop/Prepros_Linux_x86_64

#Create Build Directories
mkdir ~/.prepros_build
mkdir ~/.prepros_build/linux
mkdir ~/.prepros_build/linux/app
cp -R ./ ~/.prepros_build/linux/app
cd ~/.prepros_build/linux/app
zip -r ../${PWD##*/}.nw *
cd ../../

# Build Linux Distribution (both 32 and 64-Bit versions)
wget https://s3.amazonaws.com/node-webkit/v0.5.1/node-webkit-v0.5.1-linux-ia32.tar.gz
tar xvzf node-webkit-v0.5.1-linux-ia32.tar.gz
cd node-webkit-v0.5.1-linux-ia32
cat ./nw ../linux/app.nw >  Prepros_Linux_x86
chmod +x Prepros_Linux_x86
zip Prepros_Linux_x86.zip Prepros_Linux_x86 nw.pak libffmpegsumo.so
cp Prepros_Linux_x86.zip ~/Desktop/

mkdir deb
mkdir deb/DEBIAN
mkdir deb/usr
mkdir deb/usr/local
mkdir deb/usr/local/bin
cp Prepros_Linux_x86 deb/usr/local/bin/prepros
cp nw.pak deb/usr/local/bin/
cp libffmpegsumo.so deb/usr/local/bin/
cat > deb/DEBIAN/control <<EOF
Package: prepros
Priority: optional
Section: devel
Version: 1.3.0
Architecture: i386
Maintainer: Matt Clements <matt@mattclements.co.uk>
Depends: build-essential, ruby
Description: Prepros for Linux. Web Development Compiler
EOF
dpkg -b deb prepros_x86.deb
cp prepros_x86.deb ~/Desktop/

cd ../

wget https://s3.amazonaws.com/node-webkit/v0.5.1/node-webkit-v0.5.1-linux-x64.tar.gz
tar xvzf node-webkit-v0.5.1-linux-x64.tar.gz
cd node-webkit-v0.5.1-linux-x64
cat ./nw ../linux/app.nw >  Prepros_Linux_x86_64
chmod +x Prepros_Linux_x86_64
zip Prepros_Linux_x86_64.zip Prepros_Linux_x86_64 nw.pak libffmpegsumo.so
cp Prepros_Linux_x86_64.zip ~/Desktop/

mkdir deb
mkdir deb/DEBIAN
mkdir deb/usr
mkdir deb/usr/local
mkdir deb/usr/local/bin
cp Prepros_Linux_x86_64 deb/usr/local/bin/prepros
cp nw.pak deb/usr/local/bin/
cp libffmpegsumo.so deb/usr/local/bin/
cat > deb/DEBIAN/control <<EOF
Package: prepros
Priority: optional
Section: devel
Version: 1.3.0
Architecture: amd64
Maintainer: Matt Clements <matt@mattclements.co.uk>
Depends: build-essential, ruby
Description: Prepros for Linux. Web Development Compiler
EOF
dpkg -b deb prepros_x86_64.deb
cp prepros_x86_64.deb ~/Desktop/

cd ../

#Remove Temp Build Directory
rm -Rf ~/.prepros_build