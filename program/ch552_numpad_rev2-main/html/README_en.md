# macro_numpad WebUI Guide

## Overview

This document explains how to configure keymaps and macros on the device using `macro_numpad.html`.
`macro_numpad.js` handles WebHID communication and UI behavior, and `style.css` controls the styling.

## Requirements

- WebHID-capable browser (Chrome / Edge recommended)
- macro_numpad device connected via USB
- All files in this `html` directory

## Startup

1. Open `macro_numpad.html` in your browser.
2. Click "Connect to Keyboard".
3. Select your device in the device picker dialog.
4. After connection, keymap and macros are loaded automatically.

## Screen Layout

- Connect button: starts WebHID connection.
- Keymap operation buttons:
  - Read Keymap
  - Write Keymap
  - Read Macros
  - Write Macros
- Macro editor button: opens the macro editor dialog.
- Keypad area: shows current assignments and pending status.
- Utility buttons:
  - Reset to Default
  - Start Bootloader
  - Read NVM
  - macro ptrs
- Log area: shows operation results, communication errors, and debug output.

## Keymap Workflow

1. Click the target key in the keypad area.
2. Select a key in the key selection dialog.
3. Enable modifier toggles (Shift/Ctrl/Alt/Win) if needed.
4. A pending mark (⏳) appears after local changes.
5. Click "Write Keymap" to apply changes to the device.

### Switch 0 Configuration

- Switch 0 is reserved for mode control.
- Use the special dialog to choose:
  - Num: Numeric keypad mode
  - Fn: Macro pad mode (layer toggle)

## Macro Workflow

1. Click "Edit Macros" to open the macro editor.
2. Select a macro slot (m0-m5).
3. Add key codes in sequence.
4. Add delay codes (100ms/500ms/1sec) if needed.
5. Use "Delete Last" or "Clear" to fix mistakes.
6. Click "Write Macros" to save macros to the device.

### Macro Assignment

1. Open key assignment dialog for the target key.
2. Select macro trigger key (m0-m5).
3. Click "Write Keymap" to save assignment.

### Runtime Abort

If any key is pressed while a macro is being sent, macro transmission is stopped immediately.

## NVM Operations

- Read Keymap: loads key assignments from device NVM.
- Read Macros: loads macro data from device NVM.
- Read NVM: dumps raw NVM data in hex (for debugging).
- macro ptrs: shows macro pointer table (for debugging).
- Reset to Default: restores default keymap and clears macros.

## Important Notes

- If the device is unplugged or reset during operation, actions become invalid. Reconnect the device.
- Keymap writes and macro writes are separate operations. Save both when necessary.
- Starting bootloader may disconnect the device temporarily.

## Troubleshooting

### Device does not appear

- Verify your USB cable supports data transfer.
- Verify your browser supports WebHID.
- Check if another application is currently using the device.

### Write operation fails

- Confirm that connection is established first.
- Check log messages (Timeout, Version mismatch, etc.).
- Try "Read Keymap" once, then edit and write again.

### Macro behavior is unexpected

- Verify macro slot content and key assignment.
- Check whether too many delays make execution feel slow.
- Confirm macro data does not exceed the 45-byte macro area.
