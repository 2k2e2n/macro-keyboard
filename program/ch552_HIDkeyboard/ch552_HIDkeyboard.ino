/**
 * CH552 USB HID キーボード（ch55xduino）
 *
 * ツール → USB Settings: USER CODE w/ 148B USB ram（user148）
 *
 * 入力（内部プルアップ、スイッチで GND に落とす）:
 *   P3.2 → 'a' の押下／離し
 *   P1.4 → 「Hello」を送信
 *   P1.5 → Caps Lock を短押し
 *
 * ch55xduino のピン番号は Pm.n → 番号 mn（例: P3.2 = 32）
 */

#ifndef USER_USB_RAM
#error "ツール → USB Settings で USER CODE w/ 148B USB RAM を選んでビルドしてください。"
#endif

#include "src/userUsbHidKeyboard/USBHIDKeyboard.h"

#define BUTTON_PIN_A      32   // P3.2
#define BUTTON_PIN_HELLO  14   // P1.4
#define BUTTON_PIN_CAPS     15   // P1.5

#define LED_PIN_CAPS      33   // P3.3（Caps Lock 状態表示。未使用なら setup/loop から削除可）

static bool prevA = false;
static bool prevHello = false;
static bool prevCaps = false;

void setup() {
  USBInit();

  pinMode(BUTTON_PIN_A, INPUT_PULLUP);
  pinMode(BUTTON_PIN_HELLO, INPUT_PULLUP);
  pinMode(BUTTON_PIN_CAPS, INPUT_PULLUP);
  pinMode(LED_PIN_CAPS, OUTPUT);
}

void loop() {
  bool downA = !digitalRead(BUTTON_PIN_A);
  if (prevA != downA) {
    prevA = downA;
    if (downA) {
      Keyboard_press('a');
    } else {
      Keyboard_release('a');
    }
  }

  bool downHello = !digitalRead(BUTTON_PIN_HELLO);
  if (prevHello != downHello) {
    prevHello = downHello;
    if (downHello) {
      Keyboard_write('H');
      Keyboard_write('e');
      Keyboard_write('l');
      Keyboard_write('l');
      Keyboard_write('o');
    }
  }

  bool downCaps = !digitalRead(BUTTON_PIN_CAPS);
  if (prevCaps != downCaps) {
    prevCaps = downCaps;
    if (downCaps) {
      Keyboard_press(KEY_CAPS_LOCK);
      delay(100);
      Keyboard_release(KEY_CAPS_LOCK);
    }
  }

  if (Keyboard_getLEDStatus() & 2) {
    digitalWrite(LED_PIN_CAPS, HIGH);
  } else {
    digitalWrite(LED_PIN_CAPS, LOW);
  }

  delay(50);
}
