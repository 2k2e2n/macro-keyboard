// macro_numpad.ino main sketch of Numeric or Macro Keypad program using ch552g.
// Copyright (c)  Takeshi Higasa, okiraku-camera.tokyo
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php   

// Hardware dependent constants are defined in this file, such as the number of rows and columns, the eeprom memory map, etc. 
// These constants are used in multiple files, so they are defined in a separate header file.    

#ifndef HARDWARE_CONFIG_H
#define HARDWARE_CONFIG_H

// ★この1行を追加して、以下の設定を強制的に有効化します！
#define CH552_MACRO_NUMPAD 1

// EEPROM memory map

#define EEPROM_START    0   // start address of EEPROM
#define EEPROM_END      127  // end address of EEPROM. Do not write beyond this.

#ifdef BOARD_NAME_DEFINED
#undef BOARD_NAME_DEFINED
#endif


#ifdef CH552_MACRO_NUMPAD
#define BOARD_NAME_DEFINED 1
#define HID_RAW_ID 0x81

#define COLS 4     // ★ 5 から 4 に変更
#define ROWS 2     // ★ 4 から 2 に変更
#define NUM_KEYS (COLS * ROWS)
#define NUM_LAYERS 2

#define KEYMAP_START    2   // programable keymap starts at EEPROM_START. After EEPROM_KEYMAP_VALID1 and 2.
#define KEYMAP_SIZE     32  // (NUM_KEYS * NUM_LAYERS * 2) // size of keymap. 2bytes a key.    
#define MACRO_START	    82  // (KEYMAP_START + KEYMAP_SIZE) // macros start after keymap.
#define MACRO_SIZE	    45  // (MACRO_END - MACRO_START)  	  // size of macro storage in bytes.
#define MACRO_END       127 // (EEPROM_END)					  // end of macro storage. Do not write beyond this.
#define RE_COUNT 0	// No RE
#define RE_KEYMAP_START 128        // Start address of RE data. 
// RE data is stored in the order of CW(2bytes), CCW(2bytes) for each RE. 1 RE takes 4 bytes.
// RE that can be pressed is treated as a regular   key switch.  
#else
#ifdef CH552_MEDIAPAD
#define BOARD_NAME_DEFINED 1
#define HID_RAW_ID 0x82
#define COLS 2
#define ROWS 4
#define NUM_KEYS (COLS * ROWS)
#define NUM_LAYERS 2
#define RE_COUNT 1

#define KEYMAP_START	2   // programable keymap starts at EEPROM_START. After EEPROM_KEYMAP_VALID1 and 2.
#define KEYMAP_SIZE     32  // (NUM_KEYS * NUM_LAYERS * 2) // size of keymap. 2bytes a key.    
#define RE_KEYMAP_START 		34        // Start address of RE data. 
// RE that can be pressed is treated as a regular   key switch.  

#define RE_KEYMAP_END            (RE_KEYMAP_START + RE_COUNT * NUM_LAYERS * 4)	// end of RE data.

#define MACRO_START	    42  //  macros start after RE keymap.
#define MACRO_SIZE	    85  // (MACRO_END - MACRO_START)  	  // size of macro storage in bytes.
#define MACRO_END       127 // (EEPROM_END)					  // end of macro storage. Do not write beyond this.
#endif
#endif
#ifndef BOARD_NAME_DEFINED
#define HID_RAW_ID 0
#define COLS 4
#define ROWS 2
#define NUM_KEYS (COLS * ROWS)
#define NUM_LAYERS 1
#define RE_COUNT 0

#define KEYMAP_START	127   // programable keymap starts at EEPROM_START. After EEPROM_KEYMAP_VALID1 and 2.
#define KEYMAP_SIZE     0  // (NUM_KEYS * NUM_LAYERS * 2) // size of keymap. 2bytes a key.    
#define RE_KEYMAP_START 127       // Start address of RE data. 
// RE that can be pressed is treated as a regular   key switch.  

#define RE_KEYMAP_END            (RE_KEYMAP_START + RE_COUNT * NUM_LAYERS * 4)	// end of RE data.

#define MACRO_START	    42  //  macros start after RE keymap.
#define MACRO_SIZE	    85  // (MACRO_END - MACRO_START)  	  // size of macro storage in bytes.
#define MACRO_END       127 // (EEPROM_END)					  // end of macro storage. Do not write beyond this.
#endif

#endif  // HARDWARE_CONFIG_H