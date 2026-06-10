/**
 * macro_numpad.ino main sketch of Numeric or Macro Keypad program using ch552g.
 * Copyright (c)  Takeshi Higasa, okiraku-camera.tokyo
 * * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */

#include "USB_hid_composite.h"
#include "hid_keycode.h"
#include "ch552_watchdog.h"
#include "nvm_keymap.h" 
#include "hardware_config.h"  // for hardware dependent constants.

// ==========================================
// 1. ハードウェアピン配置・定数の定義
// ==========================================
#define ENCODER_PIN_A 14 // P1.4 (ロータリーエンコーダー A相)
#define ENCODER_PIN_B 15 // P1.5 (ロータリーエンコーダー B相)

const uint8_t cols[] = {16, 17, 32, 10};   // 4列
const uint8_t rows[] = {34, 33};            // 2行
const uint8_t row_masks[] = {0x10, 0x08};   // P3.4 と P3.3 のマスク値

// 初期レイアウト配列（8キー分）
const uint16_t text_scan_to_hid[8] = {
  HID_KEYPAD_1, HID_KEYPAD_2, HID_KEYPAD_3, HID_KEYPAD_4,
  HID_KEYPAD_5, HID_KEYPAD_6, HID_KEYPAD_7, HID_KEYPAD_8
};

// ==========================================
// 2. グローバル変数定義
// ==========================================
bool numeric_keypad = true;
int8_t current_layer = 0;       // 0:レイヤー0, 1:レイヤー1
unsigned long last_matrix_scan = 0;

// エンコーダー用変数（グレイコード状態遷移）
uint8_t old_AB = 3; 
int8_t enc_val = 0; 
const int8_t enc_states[] = {
    0, -1,  1,  0,
    1,  0,  0, -1,
   -1,  0,  0,  1,
    0,  1, -1,  0
};

// ==========================================
// 3. ロータリーエンコーダー 制御関数群
// ==========================================
void scan_encoder() {
    uint8_t A = digitalRead(ENCODER_PIN_A);
    uint8_t B = digitalRead(ENCODER_PIN_B);
    uint8_t AB = (A << 1) | B; 

    if (AB != old_AB) { 
        enc_val += enc_states[(old_AB << 2) | AB];
        old_AB = AB;

        // ALPS EC12は1クリックで4ステップ遷移する仕様
        if (enc_val >= 4) {
            // 右回り (下スクロール)
            send_key(FN_MS_WH_DOWN, 1);
            delay(2);
            send_key(FN_MS_WH_DOWN, 0);
            enc_val = 0;
        } else if (enc_val <= -4) {
            // 左回り (上スクロール)
            send_key(FN_MS_WH_UP, 1);
            delay(2);
            send_key(FN_MS_WH_UP, 0);
            enc_val = 0;
        }
    }
}

// ==========================================
// 4. USB・キースキャン・マクロイベント処理
// ==========================================
void write_code_callback(uint8_t sw, uint8_t layer, uint16_t code) {
  (void)layer; 
  if (sw == 0 && code == HID_KEYPAD_NUMLOCK)
    numeric_keypad = true;
  else if (sw == 0 && code != HID_KEYPAD_NUMLOCK)
    numeric_keypad = false;
}

void USBStartSuspend() {
}

uint8_t active_macro = 0; 
uint8_t macro_index = 0;  
int8_t macro_delay_count = 0; 

void key_event(uint8_t switch_num, uint8_t state) {
    if (switch_num < 1 || switch_num > NUM_KEYS )
        return;

    if (active_macro) {
        if (state) {
            macro_index = 0;
            macro_delay_count = 0;
            active_macro = 0;
            kbd_releaseAll();
        }
        return;
    } 

    uint16_t hidcode = read_nvm_code(switch_num - 1, current_layer);
    if (hidcode != 0) {
        uint8_t code = (uint8_t)hidcode & 0xff;
        uint8_t mod = (hidcode >> 8) & 0xff; 
        if ((code == HID_X_FN1) && state) { 
            current_layer ^= 1;
            return;
        }
        if (IS_MACRO_KEYCODE(code)) {
            if (state) {
                active_macro = hidcode - MACRO_KEYCODE_BASE;
                if (macro_ptrs[active_macro] == 0) {  
                    active_macro = 0;
                    return;
                }
                active_macro++;
                macro_index = 0;
                macro_delay_count = 0;
            }
        } else {
            if (mod && state) {
                send_modifiers(mod, 1);
                delay(20);
            }
            send_key(code, state);
            if (mod && !state) {
                delay(20);
                send_modifiers(mod, 0);
            }
        }
    }
}

#define scan_bytes 3
static uint8_t last_stable[scan_bytes];
static uint8_t last_scan[scan_bytes];

void scan() {
    __data uint8_t keys[scan_bytes] = {0}; 
    __data uint8_t key = 0;
    for(uint8_t row = 0; row < sizeof(rows); row++) {
        P3 &= ~row_masks[row];    
        delayMicroseconds(5);       

        uint8_t p1_val = ~P1;
        uint8_t p3_val = ~P3; 

        uint8_t col_bits = (((p1_val >> 6) & 1) << 0) |  
                           (((p1_val >> 7) & 1) << 1) |  
                           (((p3_val >> 2) & 1) << 2) |  // col3: P3.2
                           (((p1_val >> 0) & 1) << 3);   

        if (row & 1)
            keys[key++] |= (col_bits << 4); 
        else
            keys[key] = col_bits & 0x0f;    

        P3 |= row_masks[row];   
        delayMicroseconds(30);
    }
  
    uint8_t n = 0;
    for(uint8_t i = 0; i < sizeof(keys); i++) {
        if (last_scan[i] != keys[i])
            n++;
        last_scan[i] = keys[i];   
    }
    if (n)
        return; 

    for(key = 0; key < sizeof(keys); key++, n += 8) {
        uint8_t changes = keys[key] ^ last_stable[key];
        last_stable[key] = keys[key]; 
        if (changes) {
            uint8_t mask = 1;
            for (uint8_t i = 0; i < 8; i++, mask <<=1 )
                if (changes & mask) key_event(n + i + 1, keys[key] & mask ? 1 : 0);
        }
    }
}

void enter_bootloader_mode() {
#if defined(BOOT_LOAD_ADDR)
    USB_CTRL = 0;
    EA = 0;
    TMOD = 0;
    delay(10);
    __asm__("lcall #0x3800");
    for(;;) {}
#endif
}

void build_initial_layout() {
    for(int8_t i = 0; i < NUM_KEYS ; i++) { 
        uint16_t code = text_scan_to_hid[i];
        nvm_write_word(KEYMAP_START + (i << 1), code);        
        nvm_write_word(KEYMAP_START + NUM_KEYS * 2 + (i << 1), 0);  
    }
}

void type_macro_strings() {
    static uint8_t mod = 0;
    static uint8_t seg_start_index = 0xff; 

    if (macro_delay_count > 0) {
        macro_delay_count--;
        return ;
    }

    if (macro_index == 0)
        seg_start_index = 0xff;

    uint16_t macro_base = macro_ptrs[active_macro - 1];
    if (macro_base == 0) {  
        active_macro = 0;
        macro_delay_count = 0;
        seg_start_index = 0xff;
        return ;
    }
    uint8_t code = eeprom_read_byte(macro_base + macro_index);
    if (code == 0) {  
        active_macro = 0;
        macro_index = 0;
        macro_delay_count = 0;
        mod = 0;
        seg_start_index = 0xff;
        kbd_releaseAll();
        return ;
    }

    if (code == HID_M_SEGSTART) {
        if (seg_start_index == 0xff) {
            seg_start_index = macro_index;
        }
        macro_index++;
        return ;
    }

    if (code == HID_M_GOTO_SEG) {
        macro_index = (seg_start_index == 0xff) ? 0 : seg_start_index;
        return ;
    }

    if (IS_MACRO_DELAY_CODE(code)) {
        switch (code) {
        case HID_M_DELAY100:
            macro_delay_count = 10; 
            break;
        case HID_M_DELAY500:
            macro_delay_count = 50; 
            break;
        case HID_M_DELAY1000:
            macro_delay_count = 100;  
            break;
        default:
            macro_delay_count = 0;
        }
        macro_index++;
        return ;
    }

    if (IS_MODIFIER_KEYCODE(code)) { 
        mod |= (1 << ((code - HID_MODIFIERS) & 0x7)); 
        if ((mod & modifiers) & mod) {    
            send_modifiers(mod, false);
        } else {
            send_modifiers(mod, true);
        }
        delay(20);
    } else {
        send_key(code, 1);
        delay(10);
        send_key(code, 0);
    }
    macro_index++;
    return ;
}

// ==========================================
// 5. メイン設定（Setup）と メインループ（Loop）
// ==========================================
void setup() {
    // USB初期化
    usbhid_init();

    // ロータリーエンコーダーピン初期化と初期状態取得
    pinMode(ENCODER_PIN_A, INPUT_PULLUP);
    pinMode(ENCODER_PIN_B, INPUT_PULLUP);
    old_AB = (digitalRead(ENCODER_PIN_A) << 1) | digitalRead(ENCODER_PIN_B);

    // キースマトリクスピンの初期化
    for(uint8_t i = 0; i < sizeof(cols); i++)   
        pinMode(cols[i], INPUT_PULLUP);

    for(uint8_t i = 0; i < sizeof(rows); i++) {
        pinMode(rows[i], OUTPUT);
        digitalWrite(rows[i], 1);
    }

    // 内蔵EEPROM（キーマップ）初期化
    init_nvm_keymap();
    
    // 【追加部分】強制的に初期レイアウトをEEPROMに書き込んでリセットする
    // build_initial_layout();

    if (read_nvm_code(0, 0) != HID_KEYPAD_NUMLOCK)  
        numeric_keypad = false;

    // ウォッチドッグタイマー有効化
    wdt_enable(WDT_TIMEOUT);
}

void loop() {
    wdt_update();
  
    // マクロ文字列の自動送信処理
    if (active_macro)
        type_macro_strings();

    // 【最速】エンコーダー監視
    scan_encoder();

    // 【10ms周期】キースキャンマトリクス実行
    if (millis() - last_matrix_scan >= 10) {
        scan();
        last_matrix_scan = millis();
    }
}