# ch552_keyPad_Library

English version is here: [README_en.md](README_en.md)

CH552 / ch55xduino ベースの小型キーボード・キーパッド向け共通ファームウェアモジュールです。
このフォルダ名は `ch552_keyPad_Library` です。
本ライブラリは、USB HIDコンポジット対応（keyboard, mouse, consumer/system, raw HID）、ウォッチドッグ補助、NVMキーマップを提供します。

## 使い方

Arduino の `libraries` フォルダ内に `ch552_keyPad_Library` というフォルダを作成し、このリポジトリ内容をすべてコピーしてください。

## このライブラリが提供する機能

- USB HIDコンポジットインターフェース（keyboard, mouse, consumer/system, raw HIDチャネル）
- USBエンドポイント/SETUP処理とディスクリプタ定数
- NVM（EEPROM）キーマップの読み書きユーティリティ
- NVM内のマクロ保存とマクロインデックス処理
- ロータリーエンコーダ用キーマップ読み書き補助
- CH552ウォッチドッグタイマ補助

## 主なファイル

ライブラリファイルは `src` ディレクトリに格納しています。


- `USB_hid_composite.c/.h`: HID送信APIとLED状態処理
- `ch_usb_handler.c/.h`: USBエンドポイントとSETUPリクエスト処理
- `ch_usb_constant.c/.h`: USBディスクリプタとレポート定数
- `hid_raw_request.c`: raw HIDコマンドハンドラ（WebHIDなどのホストツール向け）
- `nvm_keymap.c/.h`: キーマップ/マクロの読み書きとNVMレイアウトアクセス
- `hardware_config.h`: ボード/プロファイル依存のメモリマップとキーマトリクス設定
- `ch552_watchdog.c/.h`: ウォッチドッグの有効化/無効化/更新ヘルパー
- `hid_keycode.h`: HIDキーコード定義

`examples/simple_numPad` に、このライブラリを使ったシンプルなテンキーの実装例があります。

## ビルド時設定

現在のライブラリ構成では、以下の2つのビルドフラグによって対象ハードウェアを選択します。

- `CH552_MACRO_NUMPAD`
- `CH552_MEDIAPAD`

また、CH55xDuino コアの標準 USB ハンドラとこのライブラリの USB ハンドラが衝突するため、CH55xDuino のボード USB 設定で `USER_USB_RAM` が定義されているモードを選択してください。通常はボードの USB 設定メニューで `user0` / `user148` などのユーザー USB RAM モードを使います。

`hardware_config.h` はこれらのフラグを使って、マトリクスサイズ、EEPROMマップ、raw HID ID、ロータリーエンコーダ設定を定義します。

このライブラリを使うハードウェアを追加するときには、必要に応じて適切なプリプロセッサマクロを定義し、ライブラリ内のファイルを更新します。そしてハードウェア実装側の arduino.json 内にそのマクロを指定します。

なお、`examples/simple_numPad` のように、NVM上のキーマップを利用しない場合、フラグは不要です。

## 公開API（概要）

- Watchdog: `wdt_enable()`, `wdt_disable()`, `wdt_update()`
- NVM keymap: `init_nvm_keymap()`, `read_nvm_code()`, `write_nvm_code()`
- Bulk keymap/macro access: `read_keys()`, `write_keys()`, `read_macros()`, `write_macros()`
- USB HID: `usbhid_init()`, `send_key()`, `send_modifiers()`, `kbd_releaseAll()`, `get_hid_ledstate()`

## Raw HIDコマンド

`hid_raw_request.c` は次のコマンドIDを実装しています。

- keymapのリセット/読み出し/書き込み
- macroの読み出し/書き込み
- rotary encoder keyの読み出し/書き込み
- バージョン問い合わせ
- ブートローダ起動

このインターフェースを使うことで、ホスト側コンフィギュレータからNVM上のキーマップとマクロを更新できます。

## License

Copyright (c) 2024 Takeshi Higasa, okiraku-camera.tokyo

MIT License.
