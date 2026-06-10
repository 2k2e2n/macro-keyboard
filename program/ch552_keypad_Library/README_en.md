# ch552_keyPad_Library

Common firmware modules for small keyboards and keypads based on CH552 / ch55xduino.
The folder name for this library is `ch552_keyPad_Library`.
This library includes USB HID composite support (keyboard, mouse, consumer/system, raw HID), watchdog helpers, and NVM keymap handling for programmable devices.

## Usage

Create a folder named `ch552_keyPad_Library` inside Arduino's `libraries` folder, then copy all contents of this repository into it.

## What this library provides

- USB HID composite interface (keyboard, mouse, consumer/system, raw HID channel)
- USB endpoint/setup handling and descriptor constants
- NVM (EEPROM) keymap read/write utilities
- Macro storage and macro index handling in NVM
- Rotary encoder keymap read/write helpers
- CH552 watchdog timer helpers

## Main files

Library files are stored in the `src` directory.

- `USB_hid_composite.c/.h`: HID send API and LED state handling
- `ch_usb_handler.c/.h`: USB endpoint and setup request handling
- `ch_usb_constant.c/.h`: USB descriptors and report constants
- `hid_raw_request.c`: raw HID command handler (for host tools such as WebHID)
- `nvm_keymap.c/.h`: keymap/macro read/write and NVM layout access
- `hardware_config.h`: board/profile dependent memory map and key matrix settings
- `ch552_watchdog.c/.h`: watchdog enable/disable/update helpers
- `hid_keycode.h`: HID keycode definitions

`examples/simple_numPad` contains a simple numpad implementation using this library.

## Build-time configuration

Select one hardware profile in your build flags before including this library:

- `CH552_MACRO_NUMPAD`
- `CH552_MEDIAPAD`

`hardware_config.h` uses these flags to define matrix size, EEPROM map, raw HID ID, and rotary encoder settings.

This library provides a custom CH55x USB handler and therefore requires the CH55xDuino board USB setting that defines `USER_USB_RAM`. If `USER_USB_RAM` is not set, the CH55xDuino core USB handler will conflict with this library and cause duplicate symbol errors.

When adding new hardware support that uses this library, define an appropriate preprocessor macro as needed and update files in this library accordingly. Then specify that macro in `arduino.json` on the hardware implementation side.

Note: if you are not using an NVM-based keymap, as in `examples/simple_numPad`, no build flags are needed.

## Public APIs (high level)

- Watchdog: `wdt_enable()`, `wdt_disable()`, `wdt_update()`
- NVM keymap: `init_nvm_keymap()`, `read_nvm_code()`, `write_nvm_code()`
- Bulk keymap/macro access: `read_keys()`, `write_keys()`, `read_macros()`, `write_macros()`
- USB HID: `usbhid_init()`, `send_key()`, `send_modifiers()`, `kbd_releaseAll()`, `get_hid_ledstate()`

## Raw HID command notes

`hid_raw_request.c` implements command IDs for:

- keymap reset/read/write
- macro read/write
- rotary encoder key read/write
- version query
- bootloader entry

Use this interface from a host configurator to update keymaps and macros stored in NVM.

## License

Copyright (c) 2024 Takeshi Higasa, okiraku-camera.tokyo

MIT License.
