/**
 * simple_numPad.ino main sketch of Numeric keypad program using ch552g.
 * Copyright (c) 2023 Takeshi Higasa, okiraku-camera.tokyo
 * 
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 * 
 */
#include "USB_hid_composite.h"
#include "ch552_watchdog.h"
#include "hid_keycode.h"

const uint8_t cols[] = {14, 15, 16, 17};
const uint8_t rows[] = {30, 31, 32, 33, 34};
const uint8_t row_masks[] = {1, 2, 4, 8, 0x10};

// NumLock led connected to P1.1 
#define numlock_led  11
#define NUMLOCK_LED_MASK  2

// scancode to HID Usage ID table.
// these codes are defined in HIDClassCommon.h of ch55xDuino
static const uint8_t scan_to_hid[] = {			// scan hid
	HID_KEYPAD_NUMLOCK,					// 1 		0x53
	HID_KEYPAD_SLASH,				// 2		0x54
	HID_KEYPAD_ASTERISK,			// 3		0x55
	HID_KEYPAD_MINUS,				// 4		0x56
	HID_KEYPAD_7,			// 5		0x5f
	HID_KEYPAD_8,		// 6		0x60
	HID_KEYPAD_9,		// 7		0x61
	HID_KEYPAD_PLUS,				// 8		0x57
	HID_KEYPAD_4,	// 9		0x5c
	HID_KEYPAD_5,					// 10		0x5d
	HID_KEYPAD_6,	// 11		0x5e
	0,											// 12
	HID_KEYPAD_1,			// 13		0x59
	HID_KEYPAD_2,	// 14		0x5a
	HID_KEYPAD_3,		// 15		0x5b
	HID_KEYPAD_ENTER,				// 16		0x58
	HID_KEYPAD_0,		// 17		0x62
	0,											// 18
	HID_KEYPAD_PERIOD,		// 19		0x63
	0											// 20
};

// called from USBhandler
void USBStartSuspend() {
	P1 &= 0xfd;	
}

void key_event(uint8_t switch_num, uint8_t state){
	if (switch_num < 1 || switch_num > sizeof(scan_to_hid) )
		return;
	uint8_t hidcode = scan_to_hid[switch_num - 1];
	send_key(hidcode, state);
}

#define scan_bytes 3
static uint8_t last_stable[scan_bytes];
static uint8_t last_scan[scan_bytes];
void scan() {
	__data uint8_t keys[scan_bytes];
	__data uint8_t key = 0;
	for(uint8_t row = 0; row < sizeof(rows); row++) {
		P3 &= ~row_masks[row];		// select a row.
		if (row & 1)
			keys[key++] |= (~P1 & 0xf0);
		else
			keys[key] = (~P1 >> 4) & 0x0f;
		P3 |= row_masks[row];		// unselect a row.
		delayMicroseconds(30);		// wait for signal to settle.
	}
	
	uint8_t n = 0;
	for(uint8_t i = 0; i < sizeof(keys); i++) {
		// check if current and prev scan results are match.
		if (last_scan[i] != keys[i])
			n++;
		last_scan[i] = keys[i];		// save current result as prev result.
	}
	if (n)
		return;	// no match. may be de-bounced.

	for(key = 0; key < sizeof(keys); key++, n += 8) {
		uint8_t changes = keys[key] ^ last_stable[key];
		last_stable[key] = keys[key];	// save last-stable state.
		if (changes) {
			uint8_t mask = 1;
			for (uint8_t i = 0; i < 8; i++, mask <<=1 )
				if (changes & mask) key_event(n + i + 1, keys[key] & mask ? 1 : 0);
		}
	}
}

// Clarity is important
void setup() {
	usbhid_init();
	pinMode(numlock_led, OUTPUT);
	digitalWrite(numlock_led, 0);
	for(uint8_t i = 0; i < sizeof(cols); i++)
		pinMode(cols[i], INPUT_PULLUP);
	for(uint8_t i = 0; i < sizeof(rows); i++) {
		pinMode(rows[i], OUTPUT);
		digitalWrite(rows[i], 1);
	}
	wdt_enable(WDT_TIMEOUT);
}

void loop() {
	static uint8_t led_counter = 0;
	wdt_update();
	scan();
	delay(10);	// scan interval.
	if (++led_counter > 10){ // check LED state every 100msec.
		led_counter = 0;
		if (get_hid_ledstate() & HID_LED_NUMLOCK)
			P1 |= NUMLOCK_LED_MASK;
		else
			P1 &= ~NUMLOCK_LED_MASK;
	}  
}
