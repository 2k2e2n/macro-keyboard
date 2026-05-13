/**
 * CH552T USB HID：エンコーダ入力を USB で送る
 *
 * 【よくある誤解】この Composite デバイスは「キーボード＋マウス」だが、
 * 既定の OUT_MOUSE_WHEEL ではマウスホイールだけを送る。
 * メモ帳に文字が出ないのは正常。ブラウザや長い文書を開き、枠内をクリックして
 * フォーカスしたうえでエンコーダを回すと縦スクロールする。
 *
 * OS の「音量スライダー」を動かすには Consumer Control（別レポート記述）が必要で、
 * マウスホイールとは別物。まず動作確認だけなら OUT_ARROW_KEYS に切り替えよ。
 *
 * ツール → USB Settings: USER CODE w/ 148B USB ram（user148）
 * 同じ PID(0xC55D)で別HIDを試したことがある場合はドライバの残骸に注意。
 *
 * ch55xduino ピン番号 = ポート×10 + ビット（P1.4 → 14）
 */

#ifndef USER_USB_RAM
#error "CH55xduino のメニューで USB Settings を USER CODE w/ 148B USB ram にしてください"
#endif

#include "src/userUsbHidKeyboardMouse/USBHIDKeyboardMouse.h"

/** 出力の選び方 */
#define OUT_MOUSE_WHEEL   0 /* 縦スクロール（ウィンドウにフォーカスが必要） */
#define OUT_ARROW_KEYS    1 /* 上下矢印（メモ帳でカーソルが動けば USB＋エンコーダは生きている） */
#define OUT_PAGE_KEYS     2 /* Page Up / Page Down */

#ifndef OUTPUT_MODE
#define OUTPUT_MODE OUT_ARROW_KEYS
#endif

// ─── エンコーダ配線 ───────────────────────────────────────
#define PIN_ENC_A   14   // P1.4
#define PIN_ENC_B   15   // P1.5

#define ENC_ACTIVE_LOW  1
#define WHEEL_INVERT    0

/* 反応が弱いときは 1 に。逆に誤発火なら 2〜4 */
#define STEPS_PER_SCROLL   1
#define WHEEL_DELTA        1

/* チャタリング対策（μs）。まだガタつくなら 2000 など */
#define ENC_DEBOUNCE_US   800

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

static void emit_from_delta(int8_t delta) {
  if (delta == 0) {
    return;
  }
#if OUTPUT_MODE == OUT_MOUSE_WHEEL
  Mouse_scroll(delta);
  Mouse_scroll(0);
#elif OUTPUT_MODE == OUT_ARROW_KEYS
  if (delta > 0) {
    Keyboard_press(KEY_UP_ARROW);
    Keyboard_release(KEY_UP_ARROW);
  } else {
    Keyboard_press(KEY_DOWN_ARROW);
    Keyboard_release(KEY_DOWN_ARROW);
  }
#elif OUTPUT_MODE == OUT_PAGE_KEYS
  if (delta > 0) {
    Keyboard_press(KEY_PAGE_UP);
    Keyboard_release(KEY_PAGE_UP);
  } else {
    Keyboard_press(KEY_PAGE_DOWN);
    Keyboard_release(KEY_PAGE_DOWN);
  }
#else
#error "OUTPUT_MODE は OUT_MOUSE_WHEEL / OUT_ARROW_KEYS / OUT_PAGE_KEYS のいずれかにしてください"
#endif
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
      emit_from_delta(-(int8_t)WHEEL_DELTA);
#else
      emit_from_delta((int8_t)WHEEL_DELTA);
#endif
      delayMicroseconds(ENC_DEBOUNCE_US);
    } else if (enc_accumulator <= -STEPS_PER_SCROLL) {
      enc_accumulator += STEPS_PER_SCROLL;
#if WHEEL_INVERT
      emit_from_delta((int8_t)WHEEL_DELTA);
#else
      emit_from_delta(-(int8_t)WHEEL_DELTA);
#endif
      delayMicroseconds(ENC_DEBOUNCE_US);
    }
  }
}
