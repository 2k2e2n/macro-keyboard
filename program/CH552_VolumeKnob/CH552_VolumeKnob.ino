/**
 * CH552T USB HID：エンコーダでマウスホイール相当（Mouse_scroll）
 *
 * 公式サンプル「HidKeyboardMouse」と同じ USB スタックを使うため列挙が安定します。
 * ツール → USB Settings: USER CODE w/ 148B USB ram（user148）
 *
 * 同じ PID(0xC55D)で別HIDを試したことがある場合は、デバイスマネージャーから
 * 古いドライバを削除してから再接続してください（公式サンプル注記と同じ）。
 *
 * ch55xduino ピン番号 = ポート×10 + ビット（P1.4 → 14）
 */

#ifndef USER_USB_RAM
#error "CH55xduino のメニューで USB Settings を USER CODE w/ 148B USB ram にしてください"
#endif

#include "src/userUsbHidKeyboardMouse/USBHIDKeyboardMouse.h"

// ─── エンコーダ配線 ───────────────────────────────────────
#define PIN_ENC_A   14   // P1.4
#define PIN_ENC_B   15   // P1.5

#define ENC_ACTIVE_LOW  1
#define WHEEL_INVERT    0

#define STEPS_PER_SCROLL   2
#define WHEEL_DELTA        1

static const int8_t ENC_TABLE[4][4] = {
  {  0,  -1,  +1,   0 },
  { +1,   0,   0,  -1 },
  { -1,   0,   0,  +1 },
  {  0,  +1,  -1,   0 },
};

static uint8_t enc_prev_state = 0;
static int16_t enc_accumulator = 0;

static uint8_t enc_read_bit(uint8_t pin) {
#if ENC_ACTIVE_LOW
  return (digitalRead(pin) == LOW) ? 1u : 0u;
#else
  return (digitalRead(pin) == HIGH) ? 1u : 0u;
#endif
}

/** ホイール 1 ノッチ（OS によっては 0 レポートも送った方がよい） */
static void wheel_nudge(int8_t delta) {
  Mouse_scroll(delta);
  Mouse_scroll(0);
}

void setup() {
  USBInit();

  pinMode(PIN_ENC_A, INPUT_PULLUP);
  pinMode(PIN_ENC_B, INPUT_PULLUP);

  uint8_t a = enc_read_bit(PIN_ENC_A);
  uint8_t b = enc_read_bit(PIN_ENC_B);
  enc_prev_state = (uint8_t)((a << 1) | b);
}

void loop() {
  uint8_t a = enc_read_bit(PIN_ENC_A);
  uint8_t b = enc_read_bit(PIN_ENC_B);
  uint8_t curr_state = (uint8_t)((a << 1) | b);

  if (curr_state != enc_prev_state) {
    int8_t dir = ENC_TABLE[enc_prev_state][curr_state];
    enc_accumulator += dir;
    enc_prev_state = curr_state;

    if (enc_accumulator >= STEPS_PER_SCROLL) {
      enc_accumulator -= STEPS_PER_SCROLL;
#if WHEEL_INVERT
      wheel_nudge(-(int8_t)WHEEL_DELTA);
#else
      wheel_nudge((int8_t)WHEEL_DELTA);
#endif
    } else if (enc_accumulator <= -STEPS_PER_SCROLL) {
      enc_accumulator += STEPS_PER_SCROLL;
#if WHEEL_INVERT
      wheel_nudge((int8_t)WHEEL_DELTA);
#else
      wheel_nudge(-(int8_t)WHEEL_DELTA);
#endif
    }
  }
}
