#!/bin/bash

#Grab Latest Commit Hash for Version Number
LATEST_COMMIT=`git log -1 --format="%h"`

#Removed and re-populate Node Modules
sudo rm -Rf ./node_modules
sudo npm install

#Removed Old Prepros.app if exists
rm -Rf ~/Desktop/Prepros.app

#Create Build Directories
mkdir ~/.prepros_build
mkdir ~/.prepros_build/osx
mkdir ~/.prepros_build/osx/app.nw
cp -R ./ ~/.prepros_build/osx/app.nw
cd ~/.prepros_build

#Download Node-Webkit for OSX
wget https://s3.amazonaws.com/node-webkit/v0.5.1/node-webkit-v0.5.1-osx-ia32.zip
unzip node-webkit-v0.5.1-osx-ia32.zip
cd node-webkit.app/Contents/Resources

#Remove Node-Webkit Icon & Replace with Prepros
rm ./nw.icns
cp ~/.prepros_build/osx/app.nw/app/assets/img/icons/icns.icns ./app.icns
cp -R ~/.prepros_build/osx/app.nw ./
cd ../

#Create Launch File (Info.plist)
cat > Info.plist <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CFBundleDevelopmentRegion</key>
	<string>en</string>
	<key>CFBundleDisplayName</key>
	<string>Prepros</string>
	<key>CFBundleDocumentTypes</key>
	<array>
		<dict>
			<key>CFBundleTypeIconFile</key>
			<string>app.icns</string>
			<key>CFBundleTypeName</key>
			<string>Prepros App</string>
			<key>CFBundleTypeRole</key>
			<string>Viewer</string>
			<key>LSHandlerRank</key>
			<string>Owner</string>
			<key>LSItemContentTypes</key>
			<array>
				<string>com.alphapixels.prepros.app</string>
			</array>
		</dict>
		<dict>
			<key>CFBundleTypeName</key>
			<string>Folder</string>
			<key>CFBundleTypeOSTypes</key>
			<array>
				<string>fold</string>
			</array>
			<key>CFBundleTypeRole</key>
			<string>Viewer</string>
			<key>LSHandlerRank</key>
			<string>None</string>
		</dict>
	</array>
	<key>CFBundleExecutable</key>
	<string>launch-prepros</string>
	<key>CFBundleIconFile</key>
	<string>app.icns</string>
	<key>CFBundleIdentifier</key>
	<string>com.alphapixels.prepros.app</string>
	<key>CFBundleInfoDictionaryVersion</key>
	<string>6.0</string>
	<key>CFBundleName</key>
	<string>Prepros</string>
	<key>CFBundlePackageType</key>
	<string>APPL</string>
	<key>CFBundleShortVersionString</key>
	<string>1.3.0</string>
	<key>CFBundleVersion</key>
	<string>{commit}</string>
	<key>LSFileQuarantineEnabled</key>
	<true/>
	<key>LSMinimumSystemVersion</key>
	<string>10.6.0</string>
	<key>NSPrincipalClass</key>
	<string>NSApplication</string>
	<key>NSSupportsAutomaticGraphicsSwitching</key>
	<true/>
	<key>SCMRevision</key>
	<string>{commit}</string>
	<key>UTExportedTypeDeclarations</key>
	<array>
		<dict>
			<key>UTTypeConformsTo</key>
			<array>
				<string>com.pkware.zip-archive</string>
			</array>
			<key>UTTypeDescription</key>
			<string>Prepros App</string>
			<key>UTTypeIconFile</key>
			<string>app.icns</string>
			<key>UTTypeIdentifier</key>
			<string>com.alphapixels.prepros.app</string>
			<key>UTTypeReferenceURL</key>
			<string>https://github.com/rogerwang/node-webkit/wiki/How-to-package-and-distribute-your-apps</string>
			<key>UTTypeTagSpecification</key>
			<dict>
				<key>com.apple.ostype</key>
				<string>node-webkit</string>
				<key>public.filename-extension</key>
				<array>
					<string>nw</string>
				</array>
				<key>public.mime-type</key>
				<string>application/x-node-webkit-app</string>
			</dict>
		</dict>
	</array>
</dict>
</plist>
EOF

#Replace Latest Commit Hash inside Info.plist file
sed -i.bak s/{commit}/$LATEST_COMMIT/g Info.plist
rm Info.plist.bak
cd MacOS
mv node-webkit Prepros

#Create Temporary Script to launch with --disable-gpu argument (OSX Bug - https://github.com/rogerwang/node-webkit/issues/476)
cat > launch-prepros <<EOF
#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
$DIR/Prepros --disable-gpu
EOF
chmod +x launch-prepros
cd ../../../
mv node-webkit.app Prepros.app

#Move to Desktop and Delete Build DIR
cp -R Prepros.app ~/Desktop
zip ~/Desktop/Prepros.app
rm -Rf ~/.prepros_build