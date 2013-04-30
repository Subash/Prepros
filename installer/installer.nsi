!include MUI2.nsh

# App name and Version
!define VERSION "1.1.1"
Name "Prepros ${VERSION}"
outFile "Prepros ${VERSION}.exe"
ShowInstDetails "nevershow"
ShowUninstDetails "nevershow"

!define MUI_ABORTWARNING
!define MUI_ICON "ico.ico"
!define MUI_WELCOMEPAGE_TITLE "Welcome to Prepros Setup Wizard $\r$\nVersion ${VERSION}"
!define MUI_WELCOMEPAGE_TEXT "Please click install to begin installing"
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_INSTFILES

InstallDir $LOCALAPPDATA\Prepros
 
# default section start
section
	
	#Remove Old files
	RMDir /R $INSTDIR\App

	# define output path
	setOutPath $INSTDIR
		File /r "App"

	createShortCut "$SMPROGRAMS\Prepros.lnk" "$INSTDIR\App\Prepros.exe"
	createShortCut "$DESKTOP\Prepros.lnk" "$INSTDIR\App\Prepros.exe"
 
	# define uninstaller
	writeUninstaller $INSTDIR\uninstaller.exe

	# Add app to program and features
	WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Prepros" \
					"DisplayIcon" "$\"$INSTDIR\App\app\assets\img\icons\ico.ico$\""
	WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Prepros" \
					"DisplayName" "Prepros"
	WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Prepros" \
                 		"UninstallString" "$\"$INSTDIR\uninstaller.exe$\""

# default section end
sectionEnd
 

#Uninstaller
section "Uninstall"
 
	# Always delete uninstaller first
	delete $INSTDIR\uninstaller.exe
 
	# now delete installed file
	RMDir /R $INSTDIR\App

	delete $DESKTOP\Prepros.lnk
	delete $SMPROGRAMS\Prepros.lnk

	DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Prepros"
 
sectionEnd