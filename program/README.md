# Macro Keyboard (CH55x)

このディレクトリには、CH55x（CH552/CH554）を使った簡易ショートカットキーボードのファームウェアと設定ツールがあります。

内容:
- `firmware/MacroKeyboard.ino` - Arduino IDE（ch55xduinoコア）用スケッチ
- `configurator/index.html` - ブラウザで編集・ダウンロード・Web Serialでアップロード可能な設定ページ
- `uploader/serial_uploader.py` - シリアル経由で設定を送る簡易Pythonスクリプト

使い方（概要）:
1. Arduino IDEに`ch55xduino`コアをインストールして、`firmware/MacroKeyboard/MacroKeyboard.ino`を開く
2. **ツール > USB Settings** で **「USER CODE w/ 266B USB ram」** を選択（CDC + HID キーボード/マウス用）
3. 指定のピン割り当てを確認してビルド・書き込み
4. 設定を変更するには、`configurator/index.html`を開いてキーを編集後「Download」または「Connect & Upload」を使う
   - Web Serialが使えない場合はダウンロードした`keymap.txt`を`uploader/serial_uploader.py`で送信

設定フォーマット:
- デバイスは起動時に`P3.0`（debug）を押しながら電源投入/リセットすると、115200bpsでシリアルを開いて8個のトークンをカンマ区切りで受け取ります。
- 例: `a,CTRL+B,ENTER,MW_UP,WIN, ,LEFT,SPACE`
- トークンは単一文字、修飾キーとの組み合わせ（`CTRL+A`）、特殊キー名（`ENTER`,`TAB`,`LEFT`など）、およびマウスホイール (`MW_UP`/`MW_DOWN`) をサポートします。

注記:
- 永続化（フラッシュへの保存）や高度なキーコード（ファンクションキー、修飾キー）は簡易化のため未実装です。必要なら次のステップで追加します。
