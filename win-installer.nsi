!define PRODUCT_NAME "Prepros"
!define PRODUCT_VERSION "3.0.0"
!define PRODUCT_PUBLISHER "Subash Pathak"
!define PRODUCT_WEB_SITE "http://alphapixels.com/prepros"
!define PRODUCT_UNINST_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"
!define PRODUCT_UNINST_ROOT_KEY "HKLM"

SetCompressor lzma

; Modern UI
!include "MUI.nsh"

; MUI Settings
!define MUI_ABORTWARNING
!define MUI_ICON "app\assets\img\icons\ico.ico"
!define MUI_UNICON "app\assets\img\icons\ico.ico"

; Welcome page
!insertmacro MUI_PAGE_WELCOME
; Directory page
!insertmacro MUI_PAGE_DIRECTORY
; Instfiles page
!insertmacro MUI_PAGE_INSTFILES
; Finish page
!insertmacro MUI_PAGE_FINISH
; Language files
!insertmacro MUI_LANGUAGE "English"

; Uninstaller pages
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

Name "${PRODUCT_NAME} ${PRODUCT_VERSION}"
OutFile "${PRODUCT_NAME}-${PRODUCT_VERSION}.exe"
InstallDir "$PROGRAMFILES\${PRODUCT_NAME}"
ShowInstDetails hide
ShowUnInstDetails hide

Section "MainSection" SEC01

  ; Remove Old Install Files
  RMDir /R $INSTDIR
  RMDir /R "$LOCALAPPDATA\Prepros\App"
  delete "$DESKTOP\${PRODUCT_NAME}.lnk"
  delete "$SMPROGRAMS\${PRODUCT_NAME}.lnk"
  DeleteRegKey ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}"

  SetOutPath "$INSTDIR"
  SetOverwrite on
  File /r "app"
  File /r "bin"
  File /r "gems"
  File /r "node_modules"
  File /r "ruby"
  
  File "ffmpegsumo.dll"
  File "icudt.dll"
  File "libEGL.dll"
  File "libGLESv2.dll"
  File "nw.pak"
  File "package.json"
  File "Prepros.exe"
  
SectionEnd

Section -Post

  ; Uninstaller
  WriteUninstaller "$INSTDIR\uninstall.exe"
  
  ; Start menu and desktop shortcuts
  createShortCut "$SMPROGRAMS\${PRODUCT_NAME}.lnk" "$INSTDIR\Prepros.exe"
  createShortCut "$DESKTOP\${PRODUCT_NAME}.lnk" "$INSTDIR\Prepros.exe"
  
  ;Registery entries
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "DisplayName" "$(^Name)"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "UninstallString" "$INSTDIR\uninstall.exe"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "DisplayIcon" "$INSTDIR\Prepros.exe"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "DisplayVersion" "${PRODUCT_VERSION}"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "URLInfoAbout" "${PRODUCT_WEB_SITE}"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "Publisher" "${PRODUCT_PUBLISHER}"
  
SectionEnd


Section Uninstall

  RMDir /R $INSTDIR
  delete "$DESKTOP\${PRODUCT_NAME}.lnk"
  delete "$SMPROGRAMS\${PRODUCT_NAME}.lnk"
  RMDir /R "$LOCALAPPDATA\Prepros"
  RMDir /R "$APPDATA\Prepros"
  DeleteRegKey ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}"
  SetAutoClose true
  
SectionEnd