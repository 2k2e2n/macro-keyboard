/**
 * macro_numpad.js
 * CH552 Numpad Configurator — Logic & UI
 */

/** =============================================
 *  1. 定数・データ定義
 * ============================================= */
const HID_CONFIG = {
  VENDOR_ID: 0x1209,
  USAGE_PAGE: 0xff81,
  USAGE_ID: 0x51,
  REPORT_ID: 5,
  RAW_DATA_SIZE: 32,
  VERSION_NUM: 0x3412,
  KEYMAP_SIZE: 8,
  MACRO_SIZE: 45,
  MACRO_COUNT: 6,
  NVM_SIZE: 128,
  COMMAND_TIMEOUT: 5000
};

const HID_COMMANDS = {
  GET_VERSION:    0x01,
  READ_NVM:       0x0a,
  READ_MACRO_PTRS:0x0b,
  START_BOOT_LOADER: 0x0c,
  RESET_KEYMAP:   0x10,
  READ_KEY:       0x11,
  WRITE_KEY:      0x12,
  READ_KEYMAP:    0x15,
  WRITE_KEYMAP:   0x16,
  READ_MACROS:    0x18,
  WRITE_MACROS:   0x19,
  WRITE_RE_KEY:   0x1c,
  READ_RE_KEY:    0x1d
};

const charKeyDefs = [
  { label: "a", usage: 0x04 }, { label: "b", usage: 0x05 }, { label: "c", usage: 0x06 }, { label: "d", usage: 0x07 }, { label: "e", usage: 0x08 },
  { label: "f", usage: 0x09 }, { label: "g", usage: 0x0A }, { label: "h", usage: 0x0B }, { label: "i", usage: 0x0C }, { label: "j", usage: 0x0D },
  { label: "k", usage: 0x0E }, { label: "l", usage: 0x0F }, { label: "m", usage: 0x10 }, { label: "n", usage: 0x11 }, { label: "o", usage: 0x12 },
  { label: "p", usage: 0x13 }, { label: "q", usage: 0x14 }, { label: "r", usage: 0x15 }, { label: "s", usage: 0x16 }, { label: "t", usage: 0x17 },
  { label: "u", usage: 0x18 }, { label: "v", usage: 0x19 }, { label: "w", usage: 0x1A }, { label: "x", usage: 0x1B }, { label: "y", usage: 0x1C }, { label: "z", usage: 0x1D },
  { label: "1", usage: 0x1E }, { label: "2", usage: 0x1F }, { label: "3", usage: 0x20 }, { label: "4", usage: 0x21 }, { label: "5", usage: 0x22 },
  { label: "6", usage: 0x23 }, { label: "7", usage: 0x24 }, { label: "8", usage: 0x25 }, { label: "9", usage: 0x26 }, { label: "0", usage: 0x27 },
  { label: "space", usage: 0x2C },
  { label: "-",  usage: 0x2D }, { label: "^",  usage: 0x2E }, { label: "@",  usage: 0x2F }, { label: "[",  usage: 0x30 },
  { label: "]",  usage: 0x31 }, { label: ";",  usage: 0x33 }, { label: ":",  usage: 0x34 },
  { label: "`",  usage: 0x35 }, { label: ",",  usage: 0x36 }, { label: ".",  usage: 0x37 }, { label: "/",  usage: 0x38 },
  { label: "\\", usage: 0x64 }
];

const editKeyDefs = [
  { label: "BackSp",  usage: 0x2A }, { label: "Tab",     usage: 0x2B }, { label: "Enter",   usage: 0x28 }, { label: "Esc",     usage: 0x29 },
  { label: "Del",     usage: 0x4C }, { label: "Ins",     usage: 0x49 }, { label: "Home",    usage: 0x4A }, { label: "End",     usage: 0x4D },
  { label: "PgUp",    usage: 0x4B }, { label: "PgDn",    usage: 0x4E }, { label: "PrtScr",  usage: 0x46 },
  { label: "ScrLock", usage: 0x47 }, { label: "Pause",   usage: 0x48 }, { label: "Caps",    usage: 0x39 },
  { label: "↑",       usage: 0x52 }, { label: "↓",       usage: 0x51 }, { label: "←",       usage: 0x50 }, { label: "→",       usage: 0x4F }
];

const japaneseExtKeyDefs = [
  { label: "ひらがな",    usage: 0x88 },
  { label: "無変換",      usage: 0x8B },
  { label: "変換",        usage: 0x8A },
  { label: " _ ",         usage: 0x87 },
  { label: "LANG1(かな)", usage: 0x90 },
  { label: "LANG2(英数)", usage: 0x91 }
];

const specialKeyDefs = [
  { label: "<<",      usage: 0xA5 },
  { label: "Play",    usage: 0xA0 },
  { label: ">>",      usage: 0xA4 },
  { label: "VolUp",   usage: 0xA7 },
  { label: "VolDown", usage: 0xA8 },
  { label: "Mute",    usage: 0xA9 }
];

const mouseSimKeyDefs = [
  { label: "左ボタン", usage: 0xC4 },
  { label: "右ボタン", usage: 0xC5 },
  { label: "M ←",     usage: 0xC7 },
  { label: "M →",     usage: 0xC8 },
  { label: "M ↑",     usage: 0xC9 },
  { label: "M ↓",     usage: 0xCA },
  { label: "M ⇧",     usage: 0xCB },
  { label: "M ⇩",     usage: 0xCC }
];

const functionKeyDefs = [
  ...Array.from({ length: 12 }, (_, i) => ({ label: `F${i + 1}`,  usage: 0x3A + i })),
  ...Array.from({ length: 12 }, (_, i) => ({ label: `F${i + 13}`, usage: 0x68 + i }))
];

const modifierKeyDefs = [
  { key: "shift", label: "Shift", bit: 0x0200 },
  { key: "ctrl",  label: "Ctrl",  bit: 0x0100 },
  { key: "alt",   label: "Alt",   bit: 0x0400 },
  { key: "win",   label: "Win",   bit: 0x0800 }
];

const shiftedCharLabelMap = {
  0x1E: "!", 0x1F: "\"", 0x20: "#", 0x21: "$", 0x22: "%", 0x23: "&", 0x24: "'", 0x25: "(", 0x26: ")",
  0x2D: "=", 0x2E: "~",  0x2F: "`", 0x30: "{", 0x31: "}", 0x33: "+", 0x34: "*", 0x35: "~", 0x36: "<",
  0x37: ">", 0x38: "?",  0x64: "_"
};

const keypadKeyDefs = [
  { label: "NumLock",  usage: 0x53 },
  { label: "KP /",     usage: 0x54 }, { label: "KP *",     usage: 0x55 }, { label: "KP -",    usage: 0x56 },
  { label: "KP 7",     usage: 0x5F }, { label: "KP 8",     usage: 0x60 }, { label: "KP 9",    usage: 0x61 }, { label: "KP +", usage: 0x57 },
  { label: "KP 4",     usage: 0x5C }, { label: "KP 5",     usage: 0x5D }, { label: "KP 6",    usage: 0x5E },
  { label: "KP 1",     usage: 0x59 }, { label: "KP 2",     usage: 0x5A }, { label: "KP 3",    usage: 0x5B },
  { label: "KP 0",     usage: 0x62 }, { label: "KP .",     usage: 0x63 }, { label: "KP Enter",usage: 0x58 }
];

const MACRO_USAGE_START = 0xD0;
const MACRO_USAGE_END   = MACRO_USAGE_START + HID_CONFIG.MACRO_COUNT - 1;
const macroKeyDefs = Array.from({ length: HID_CONFIG.MACRO_COUNT }, (_, i) => ({ label: `m${i}`, usage: MACRO_USAGE_START + i }));

const PHYSICAL_LAYOUT = [
  { id: 0, row: 0, col: 0 }, { id: 1, row: 0, col: 1 }, { id: 2, row: 0, col: 2 }, { id: 3, row: 0, col: 3 },
  { id: 4, row: 1, col: 0 }, { id: 5, row: 1, col: 1 }, { id: 6, row: 1, col: 2 }, { id: 7, row: 1, col: 3 }
];

const MASTER_USAGE_MAP = { 0xBC: "Fn", 0x9C: "Clear" };
[...charKeyDefs, ...editKeyDefs, ...japaneseExtKeyDefs, ...specialKeyDefs, ...mouseSimKeyDefs, ...functionKeyDefs, ...macroKeyDefs, ...keypadKeyDefs]
  .forEach(d => MASTER_USAGE_MAP[d.usage] = d.label);

const toHex2 = (value) => `0x${value.toString(16).toUpperCase().padStart(2, "0")}`;

const MACRO_USAGE_LABELS = (() => {
  const map = Object.assign({}, MASTER_USAGE_MAP);
  Object.assign(map, {
    0x2A: "BackSP", 0x2C: "Space", 0x2E: "=",    0x2F: "[",   0x30: "]",    0x31: "\\",  0x32: "0x32",
    0x34: "'",      0x46: "PrtSc", 0x64: "NonUS\\", 0x67: "KP =", 0x85: "KP ,", 0x65: "App", 0x9A: "SysReq",
    0xD6: "𝄆",     0xD7: "𝄇",     0xDA: "100ms", 0xDB: "500ms", 0xDC: "1sec",
    0xE0: "Ctrl",   0xE1: "Shift", 0xE2: "Alt",   0xE3: "GUI",  0xE4: "R-Ctrl", 0xE5: "R-Shift", 0xE6: "R-Alt", 0xE7: "R-GUI",
    0x90: "LANG1",  0x91: "LANG2"
  });
  for (let usage = 0x87; usage <= 0x8F; usage++) { if (!(usage in map)) map[usage] = `Intl${usage - 0x86}`; }
  for (let usage = 0x90; usage <= 0x98; usage++) { if (!(usage in map)) map[usage] = `Lang${usage - 0x8F}`; }
  for (let usage = 0xE8; usage <= 0xEF; usage++) { map[usage] = `Reserved ${toHex2(usage)}`; }
  return map;
})();

const getMacroUsageLabel = (usage) => MACRO_USAGE_LABELS[usage] || `Usage ${toHex2(usage)}`;

const isMacroBasicUsageAllowed = (usage) => {
  if (usage < 0x04 || usage > 0x9F) return false;
  if (usage === 0x64 || usage === 0x65) return false;
  if (usage >= 0x74 && usage <= 0x9F) return false;
  return true;
};

const JP_MACRO_USAGES       = new Set([0x88, 0x8A, 0x8B, 0x90, 0x91]);
const DELAY_MACRO_USAGES    = new Set([0xDA, 0xDB, 0xDC]);
const REPEAT_MACRO_USAGES   = new Set([0xD6, 0xD7]);
const MACRO_MODIFIER_USAGES = new Set([0xE0, 0xE1, 0xE2, 0xE3]);

const isMacroEditableUsage = (usage) =>
  isMacroBasicUsageAllowed(usage) ||
  (usage >= 0xE0 && usage <= 0xE3) ||
  JP_MACRO_USAGES.has(usage) || DELAY_MACRO_USAGES.has(usage) || REPEAT_MACRO_USAGES.has(usage);

const macroBasicUsageDefs = Array.from({ length: 0x9F - 0x04 + 1 }, (_, i) => {
  const usage = 0x04 + i;
  return { usage, label: getMacroUsageLabel(usage) };
}).filter(d => isMacroBasicUsageAllowed(d.usage));

const macroModifierUsageDefs = Array.from({ length: 0xE3 - 0xE0 + 1 }, (_, i) => {
  const usage = 0xE0 + i;
  return { usage, label: getMacroUsageLabel(usage) };
});

const macroJpKeyDefs   = [0x88, 0x8A, 0x8B, 0x90, 0x91].map(usage => ({ usage, label: getMacroUsageLabel(usage) }));
const macroDelayKeyDefs = [
  { usage: 0xDA, label: getMacroUsageLabel(0xDA) },
  { usage: 0xDB, label: getMacroUsageLabel(0xDB) },
  { usage: 0xDC, label: getMacroUsageLabel(0xDC) },
  { usage: 0xD6, label: getMacroUsageLabel(0xD6), className: "macro-repeat-gap" },
  { usage: 0xD7, label: getMacroUsageLabel(0xD7) }
];

/** =============================================
 *  2. 状態管理
 * ============================================= */
let viewMode          = 1;
let selectedSwitchId  = null;
let selectedMacroIndex = 0;
let device            = null;
let commandResolver   = null;
let hasUnsavedMacroEdits = false;
let selectedModifiers = { shift: false, ctrl: false, alt: false, win: false };

let keymaps = [
  new Array(8).fill(null).map(() => ({ usage: 0, label: "None" })),
  new Array(8).fill(null).map(() => ({ usage: 0, label: "None" }))
];

let pendingChanges = new Set();
let macros = new Array(HID_CONFIG.MACRO_COUNT).fill(null).map(() => []);

const CONNECTED_COMMAND_BUTTON_IDS = [
  "readKeymapBtn", "writeKeymapBtn", "readMacrosBtn", "writeMacrosBtn", "openMacroEditorBtn",
  "resetKeymapBtn", "startBootloaderBtn", "readNvmBtn", "readMacroPtrsBtn", "setNumLock", "setFn",
  "macroDeleteLastBtn", "macroClearBtn"
];

function setConnectedUiState(connected) {
  CONNECTED_COMMAND_BUTTON_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.disabled = !connected;
  });

  const badge = document.getElementById("statusBadge");
  const connectBtn = document.getElementById("connectBtn");
  if (connected) {
    badge?.classList.add("connected");
    badge.querySelector(".status-text").textContent = "接続済み";
    connectBtn?.classList.add("connected");
    connectBtn.textContent = "切断する";
  } else {
    badge?.classList.remove("connected");
    badge.querySelector(".status-text").textContent = "未接続";
    connectBtn?.classList.remove("connected");
    connectBtn.textContent = "キーボードに接続";
  }
}

function clearConnectionState(reason = "Device disconnected.", options = {}) {
  const { log: doLog = true } = options;
  if (commandResolver) {
    const { reject, timer } = commandResolver;
    clearTimeout(timer);
    commandResolver = null;
    reject(new Error(reason));
  }
  if (device) {
    try { device.oninputreport = null; } catch (_e) {}
  }
  device = null;
  setConnectedUiState(false);
  document.getElementById("keyDialog")?.classList.add("hidden");
  document.getElementById("specialKeyDialog")?.classList.add("hidden");
  document.getElementById("macroEditorDialog")?.classList.add("hidden");
  if (doLog) updateLog(reason);
}

function isLikelyDisconnectError(error) {
  if (!error) return false;
  const name = String(error.name || "").toLowerCase();
  const msg  = String(error.message || "").toLowerCase();
  return name.includes("network") || name.includes("invalidstate") ||
         msg.includes("not connected") || msg.includes("disconnected") || msg.includes("closed");
}

function handleHidDisconnect(event) {
  if (!device || event.device !== device) return;
  clearConnectionState("Device disconnected or powered off.");
}

function cloneMacros(source = macros) {
  return source.map(entry => Array.isArray(entry) ? entry.slice() : []);
}

function normalizeMacroOrder(source = macros) {
  const packed = [];
  for (let i = 0; i < HID_CONFIG.MACRO_COUNT; i++) {
    const entry = Array.isArray(source[i]) ? source[i].slice() : [];
    if (entry.length > 0) packed.push(entry);
  }
  while (packed.length < HID_CONFIG.MACRO_COUNT) packed.push([]);
  return packed;
}

function getFirstEmptyMacroIndex(source = macros) {
  for (let i = 0; i < HID_CONFIG.MACRO_COUNT; i++) {
    if (!source[i] || source[i].length === 0) return i;
  }
  return HID_CONFIG.MACRO_COUNT;
}

function getMacroSelectableLimit(source = macros) {
  return Math.min(getFirstEmptyMacroIndex(source), HID_CONFIG.MACRO_COUNT - 1);
}

function getMacroStorageUsedBytes(source = macros) {
  let used = 0;
  for (let i = 0; i < HID_CONFIG.MACRO_COUNT; i++) {
    const macro = source[i] || [];
    if (macro.length === 0) break;
    used += macro.length + 1;
  }
  return used;
}

function getMacroRemainingBytes(source = macros) {
  return Math.max(0, HID_CONFIG.MACRO_SIZE - getMacroStorageUsedBytes(source));
}

function setMacrosIfFits(nextMacros, options = {}) {
  const normalized = normalizeMacroOrder(nextMacros);
  const usedBytes  = getMacroStorageUsedBytes(normalized);
  if (usedBytes > HID_CONFIG.MACRO_SIZE) {
    if (!options.silent) updateLog(`Macro area is full. Remaining bytes: ${getMacroRemainingBytes(macros)}`);
    return false;
  }
  macros = normalized;
  globalThis.macros = macros;
  const limit = getMacroSelectableLimit(macros);
  if (selectedMacroIndex > limit) selectedMacroIndex = limit;
  return true;
}

function appendMacroUsageToSelected(usage) {
  if (!isMacroEditableUsage(usage)) {
    updateLog(`Unsupported macro usage: ${toHex2(usage)}`);
    return;
  }
  const next = cloneMacros();
  next[selectedMacroIndex].push(usage);
  if (setMacrosIfFits(next)) {
    hasUnsavedMacroEdits = true;
    renderMacroEditor();
  }
}

function getActiveMacroModifierUsages(macroIndex = selectedMacroIndex) {
  const activeUsages = new Set();
  const currentMacro = macros[macroIndex] || [];
  currentMacro.forEach(usage => {
    if (!MACRO_MODIFIER_USAGES.has(usage)) return;
    if (activeUsages.has(usage)) activeUsages.delete(usage);
    else activeUsages.add(usage);
  });
  return activeUsages;
}

function removeMacroCodeAt(macroIndex, codeIndex) {
  const next = cloneMacros();
  if (!next[macroIndex] || codeIndex < 0 || codeIndex >= next[macroIndex].length) return;
  next[macroIndex].splice(codeIndex, 1);
  if (setMacrosIfFits(next, { silent: true })) {
    hasUnsavedMacroEdits = true;
    renderMacroEditor();
  }
}

function removeLastMacroCode() {
  const current = macros[selectedMacroIndex] || [];
  if (current.length === 0) return;
  removeMacroCodeAt(selectedMacroIndex, current.length - 1);
}

function clearSelectedMacro() {
  const next = cloneMacros();
  next[selectedMacroIndex] = [];
  if (setMacrosIfFits(next, { silent: true })) {
    hasUnsavedMacroEdits = true;
    renderMacroEditor();
  }
}

/** =============================================
 *  3. WebHID 通信
 * ============================================= */
async function sendCommand(cmdId, payload = null) {
  if (!device?.opened) throw new Error("Device not connected");
  const data = new Uint8Array(HID_CONFIG.RAW_DATA_SIZE);
  data[0] = cmdId;
  if (payload) data.set(payload, 1);

  try {
    await device.sendReport(HID_CONFIG.REPORT_ID, data);
  } catch (e) {
    if (isLikelyDisconnectError(e)) clearConnectionState("Device disconnected or powered off.", { log: true });
    throw new Error(`Send failed: ${e.message}`);
  }

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      commandResolver = null;
      reject(new Error(`Timeout (0x${cmdId.toString(16)})`));
    }, HID_CONFIG.COMMAND_TIMEOUT);
    commandResolver = { resolve, reject, timer };
  });
}

async function readMacros(force = false) {
  if (!device) return;
  if (hasUnsavedMacroEdits && !force) {
    updateLog("Skip READ_MACROS: unsaved local macro edits exist.");
    return;
  }
  try {
    updateLog("Reading macros...");
    const macroData = new Uint8Array(HID_CONFIG.MACRO_SIZE).fill(0);
    const payload   = new Uint8Array(HID_CONFIG.RAW_DATA_SIZE - 1);
    const dataSize  = payload.length - 2;

    for (let start = 0; start < HID_CONFIG.MACRO_SIZE; start += dataSize) {
      const chunkSize = Math.min(dataSize, HID_CONFIG.MACRO_SIZE - start);
      payload.fill(0);
      payload[0] = start;
      payload[1] = chunkSize;
      const { body } = await sendCommand(HID_COMMANDS.READ_MACROS, payload);
      const readBytes = Math.min(body[0], chunkSize);
      macroData.set(body.slice(2, 2 + readBytes), start);
    }

    const parsed = new Array(HID_CONFIG.MACRO_COUNT).fill(null).map(() => []);
    let offset = 0;
    for (let i = 0; i < HID_CONFIG.MACRO_COUNT && offset < HID_CONFIG.MACRO_SIZE; i++) {
      while (offset < HID_CONFIG.MACRO_SIZE && macroData[offset] !== 0) {
        parsed[i].push(macroData[offset++]);
      }
      if (parsed[i].length === 0) break;
      offset++;
    }

    setMacrosIfFits(parsed, { silent: true });
    hasUnsavedMacroEdits = false;
    renderMacroEditor();
    updateLog("Macros read.");
  } catch (e) {
    updateLog(`Macro read error: ${e.message}`);
  }
}

async function writeMacros() {
  if (!device) return;
  try {
    setMacrosIfFits(cloneMacros(), { silent: true });
    updateLog("Writing macros...");
    const macrodata = new Uint8Array(HID_CONFIG.MACRO_SIZE).fill(0);
    let offset = 0;

    for (let i = 0; i < HID_CONFIG.MACRO_COUNT; i++) {
      if (macros[i].length === 0) break;
      for (const u of macros[i]) {
        if (offset >= HID_CONFIG.MACRO_SIZE - 1) {
          console.warn(`Macro data overflow at macro ${i}, offset ${offset}`);
          updateLog(`Warning: Macro data too large, truncated at macro ${i}`);
          offset = HID_CONFIG.MACRO_SIZE;
          i = HID_CONFIG.MACRO_COUNT;
          break;
        }
        macrodata[offset++] = u;
      }
      if (offset >= HID_CONFIG.MACRO_SIZE) { console.warn("No space for terminator"); break; }
      macrodata[offset++] = 0;
    }

    const payload  = new Uint8Array(HID_CONFIG.RAW_DATA_SIZE - 1);
    const datasize = payload.length - 2;
    for (let start = 0; start < HID_CONFIG.MACRO_SIZE; start += datasize) {
      const chunkSize = Math.min(datasize, HID_CONFIG.MACRO_SIZE - start);
      payload.fill(0);
      payload.set(macrodata.slice(start, start + chunkSize), 2);
      payload[0] = start;
      payload[1] = chunkSize;
      await sendCommand(HID_COMMANDS.WRITE_MACROS, payload);
    }
    hasUnsavedMacroEdits = false;
    updateLog("Macros written.");
  } catch (e) {
    updateLog(`Macro write error: ${e.message}`);
  }
}

async function writeKey(layer, switchId, usage) {
  const payload = new Uint8Array([switchId, layer, usage & 0xFF, (usage >> 8) & 0xFF]);
  return sendCommand(HID_COMMANDS.WRITE_KEY, payload);
}

function handleInputReport({ reportId, data }) {
  if (reportId !== HID_CONFIG.REPORT_ID || !commandResolver) return;
  const arr = new Uint8Array(data.buffer);
  const { resolve, timer } = commandResolver;
  clearTimeout(timer);
  commandResolver = null;
  resolve({ cmd: arr[0], body: arr.slice(1) });
}

/** =============================================
 *  4. UI 描画・ログ
 * ============================================= */
const updateLog = (msg) => {
  const logEl = document.getElementById("log");
  if (!logEl) return;
  logEl.textContent += `\n> ${msg}`;
  logEl.scrollTop = logEl.scrollHeight;
};

function getSelectedModifierBits() {
  let bits = 0;
  modifierKeyDefs.forEach(def => { if (selectedModifiers[def.key]) bits |= def.bit; });
  return bits;
}

function getSelectedModifierNames() {
  return modifierKeyDefs.filter(def => selectedModifiers[def.key]).map(def => def.label);
}

function isShiftFaceEnabled() { return selectedModifiers.shift; }

function getCharKeyDisplayLabel(def) {
  if (!isShiftFaceEnabled()) return def.label;
  if (def.usage >= 0x04 && def.usage <= 0x1D) return def.label.toUpperCase();
  return shiftedCharLabelMap[def.usage] || def.label;
}

function buildLabelWithModifiers(baseLabel, modifierNames) {
  if (!modifierNames || modifierNames.length === 0) return baseLabel;
  return `${modifierNames.join("+")}+${baseLabel}`;
}

function getModifierNamesFromUsage(usage) {
  const hi = (usage >> 8) & 0xFF;
  const names = [];
  if (hi & 0x11) names.push("Ctrl");
  if (hi & 0x22) names.push("Shift");
  if (hi & 0x44) names.push("Alt");
  if (hi & 0x88) names.push("Win");
  return names;
}

function hasFullWidthCharacter(text = "") { return /[^\u0000-\u00FF]/.test(text); }

function parseKeymapUsage(rawUsage, switchId = null) {
  const baseUsage     = rawUsage & 0xFF;
  const modifierNames = getModifierNamesFromUsage(rawUsage);
  const matchedLabel  = MASTER_USAGE_MAP[baseUsage];

  if (matchedLabel) {
    return { usage: rawUsage, label: buildLabelWithModifiers(matchedLabel, modifierNames) };
  }
  if (baseUsage === 0x00 && modifierNames.length > 0) {
    return { usage: rawUsage, label: modifierNames.join("+") };
  }
  if (baseUsage === 0x00) {
    return { usage: 0x00, label: "None" };
  }
  return { usage: rawUsage, label: buildLabelWithModifiers(toHex2(baseUsage), modifierNames) };
}

function renderLayerTabs() {
  const tabsEl = document.getElementById("layerTabs");
  if (!tabsEl) return;
  tabsEl.innerHTML = "";
  ["Layer 0", "Layer 1"].forEach((label, idx) => {
    const btn = document.createElement("button");
    btn.className = "layer-tab" + (idx === viewMode ? " active" : "");
    btn.textContent = label;
    btn.onclick = () => {
      viewMode = idx;
      renderLayerTabs();
      renderNumpad();
    };
    tabsEl.appendChild(btn);
  });
}

function renderNumpad() {
  const pad = document.getElementById("numpad");
  if (!pad) return;
  pad.innerHTML = "";

  const currentLayerKeymaps = keymaps[viewMode] || [];

  PHYSICAL_LAYOUT.forEach(sw => {
    const keyEl = document.createElement("button");
    keyEl.className = "key";

    if (sw.rowSpan) keyEl.style.gridRow = `span ${sw.rowSpan}`;
    if (sw.colSpan) keyEl.style.gridColumn = `span ${sw.colSpan}`;

    const keyData = currentLayerKeymaps[sw.id] || { usage: 0, label: "None" };
    let displayLabel = keyData.label || "None";

    if (keyData.usage === 0x53) {
      keyEl.classList.add("num-on");
      displayLabel = "<span>Num</span><span>Lock</span>";
    } else if (keyData.usage === 0xBC) {
      keyEl.classList.add("fn-on");
      displayLabel = "<span>Fn</span>";
    }

    if (pendingChanges.has(`${viewMode}:${sw.id}`)) keyEl.classList.add("pending");

    if (displayLabel.includes("+")) {
      keyEl.classList.add("modifier-combo");
      const parts = displayLabel.split("+");
      const base  = parts.pop();
      keyEl.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;width:100%;"><span style="font-size:9px;opacity:0.7;margin-bottom:2px;overflow:hidden;white-space:nowrap;text-align:center;width:100%;max-width:72px;">${parts.join("+")}</span><span style="font-size:15px;font-weight:bold;overflow:hidden;white-space:nowrap;text-align:center;width:100%;max-width:72px;">${base}</span></div>`;
    } else if (displayLabel.includes("\n")) {
      keyEl.classList.add("modifier-combo");
      const lines = displayLabel.split("\n");
      keyEl.innerHTML = `<div style="display:flex;flex-direction:column;line-height:1.15;"><span>${lines[0]}</span><span>${lines[1]}</span></div>`;
    } else {
      if (!keyEl.innerHTML) keyEl.textContent = displayLabel;
      if (hasFullWidthCharacter(displayLabel)) keyEl.classList.add("fullwidth-label");
      else if (displayLabel.length >= 6) keyEl.classList.add("long-label");
    }

    keyEl.onclick = () => onKeyClick(sw.id);
    pad.appendChild(keyEl);
  });
}

function renderDialogKeyLists() {
  const renderList = (containerId, defs, onClickFactory, extraClass = "") => {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";
    defs.forEach(def => {
      const btn = document.createElement("button");
      if (extraClass) btn.className = extraClass;
      if (def.className) btn.classList.add(def.className);
      btn.textContent = typeof def.label === "function" ? def.label() : def.label;
      btn.onclick = onClickFactory(def);
      container.appendChild(btn);
    });
  };

  const renderModifierList = () => {
    const container = document.getElementById("modifierKeys");
    if (!container) return;
    container.innerHTML = "";
    modifierKeyDefs.forEach(def => {
      const btn = document.createElement("button");
      btn.textContent = def.label;
      if (selectedModifiers[def.key]) btn.classList.add("active");
      btn.onclick = () => {
        selectedModifiers[def.key] = !selectedModifiers[def.key];
        renderDialogKeyLists();
      };
      container.appendChild(btn);
    });
  };

  renderModifierList();

  const onDialogKeyClick = (def) => () => {
    if (selectedSwitchId === null) return;
    const modBits      = getSelectedModifierBits();
    const combinedUsage = modBits | def.usage;
    const parsed        = parseKeymapUsage(combinedUsage, selectedSwitchId);
    keymaps[viewMode][selectedSwitchId] = parsed;
    pendingChanges.add(`${viewMode}:${selectedSwitchId}`);
    document.getElementById("keyDialog").classList.add("hidden");
    selectedSwitchId = null;
    renderNumpad();
  };

  renderList("charKeys",           charKeyDefs,          def => onDialogKeyClick({ usage: def.usage, label: getCharKeyDisplayLabel(def) }), "single-char");
  renderList("keypadKeys",         keypadKeyDefs,         onDialogKeyClick);
  renderList("editKeys",           editKeyDefs,           onDialogKeyClick);
  renderList("jpExtKeys",          japaneseExtKeyDefs,    onDialogKeyClick);
  renderList("specialKeyCodes",    specialKeyDefs,        onDialogKeyClick);
  renderList("mouseSimKeys",       mouseSimKeyDefs,       onDialogKeyClick);
  renderList("functionKeysF1ToF12",functionKeyDefs.slice(0, 12), onDialogKeyClick);
  renderList("functionKeysF1ToF24",functionKeyDefs.slice(12),    onDialogKeyClick);
  renderList("macroKeys",          macroKeyDefs,          onDialogKeyClick);

  const layerKeyDefs = [{ label: "Fn（レイヤー切替）", usage: 0xBC }];
  renderList("layerKeys", layerKeyDefs, onDialogKeyClick);
}

function renderMacroEditor() {
  const slotsContainer = document.getElementById("macroSlots");
  if (slotsContainer) {
    slotsContainer.innerHTML = "";
    const limit = getMacroSelectableLimit(macros);
    for (let i = 0; i < HID_CONFIG.MACRO_COUNT; i++) {
      const btn = document.createElement("button");
      btn.textContent = `m${i}`;
      if (i === selectedMacroIndex) btn.classList.add("active");
      if (i > limit) btn.classList.add("disabled");
      btn.onclick = () => {
        if (i <= limit) { selectedMacroIndex = i; renderMacroEditor(); }
      };
      slotsContainer.appendChild(btn);
    }
  }

  const seqContainer = document.getElementById("macroSequence");
  if (seqContainer) {
    seqContainer.innerHTML = "";
    const currentMacro  = macros[selectedMacroIndex] || [];
    const activeModifiers = getActiveMacroModifierUsages(selectedMacroIndex);

    if (currentMacro.length === 0) {
      const emptyHint = document.createElement("div");
      emptyHint.className = "macro-sequence-empty";
      emptyHint.textContent = "マクロコードが空です。下のキーを押して追加してください。";
      seqContainer.appendChild(emptyHint);
    } else {
      currentMacro.forEach((usage, idx) => {
        const token = document.createElement("div");
        token.className = "macro-token";
        if (MACRO_MODIFIER_USAGES.has(usage) && activeModifiers.has(usage)) {
          token.classList.add("active-modifier");
        }
        const labelSpan = document.createElement("span");
        labelSpan.textContent = getMacroUsageLabel(usage);
        token.appendChild(labelSpan);

        const removeBtn = document.createElement("button");
        removeBtn.className = "remove-token";
        removeBtn.textContent = "×";
        removeBtn.onclick = (e) => { e.stopPropagation(); removeMacroCodeAt(selectedMacroIndex, idx); };
        token.appendChild(removeBtn);
        seqContainer.appendChild(token);
      });
    }
  }

  const usedBytes    = getMacroStorageUsedBytes(macros);
  const remainingBytes = getMacroRemainingBytes(macros);

  const statusEl = document.getElementById("macroStorageStatus");
  if (statusEl) statusEl.textContent = `使用中: ${usedBytes} / ${HID_CONFIG.MACRO_SIZE} bytes`;
  const remainEl = document.getElementById("macroRemainingBytes");
  if (remainEl) remainEl.textContent = `残り: ${remainingBytes} bytes`;

  const currentMacroLength = (macros[selectedMacroIndex] || []).length;
  const deleteLastBtn = document.getElementById("macroDeleteLastBtn");
  if (deleteLastBtn) deleteLastBtn.disabled = currentMacroLength === 0;
  const clearBtn = document.getElementById("macroClearBtn");
  if (clearBtn) clearBtn.disabled = currentMacroLength === 0;

  const renderMacroButtonsList = (containerId, defs) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";
    defs.forEach(def => {
      const btn = document.createElement("button");
      if (def.className) btn.className = def.className;
      btn.textContent = def.label;
      btn.disabled = remainingBytes === 0 && def.usage !== 0x00;
      btn.onclick = () => appendMacroUsageToSelected(def.usage);
      container.appendChild(btn);
    });
  };

  renderMacroButtonsList("macroBasicKeys",    macroBasicUsageDefs);
  renderMacroButtonsList("macroModifierKeys", macroModifierUsageDefs);
  renderMacroButtonsList("macroJpKeys",       macroJpKeyDefs);
  renderMacroButtonsList("macroDelayKeys",    macroDelayKeyDefs);
}

function onKeyClick(switchId) {
  if (!device) return updateLog("Not connected.");
  selectedSwitchId  = switchId;
  selectedModifiers = { shift: false, ctrl: false, alt: false, win: false };
  renderDialogKeyLists();
  document.getElementById("keyDialog").classList.remove("hidden");
}

/** =============================================
 *  5. イベント初期化・メイン処理
 * ============================================= */
async function readKeymap() {
  if (!device) return;
  try {
    updateLog("Reading keymap via NVM direct read...");

    const KEYMAP_START = 2;
    const KEYMAP_BYTES = 8 * 2 * 2;
    const nvmData  = new Uint8Array(KEYMAP_BYTES);
    const payload  = new Uint8Array(HID_CONFIG.RAW_DATA_SIZE - 1);
    const dataSize = payload.length - 2;

    for (let start = 0; start < KEYMAP_BYTES; start += dataSize) {
      const chunkSize = Math.min(dataSize, KEYMAP_BYTES - start);
      payload.fill(0);
      payload[0] = KEYMAP_START + start;
      payload[1] = chunkSize;
      const { body } = await sendCommand(HID_COMMANDS.READ_NVM, payload);
      const readBytes = Math.min(body[0], chunkSize);
      nvmData.set(body.slice(1, 1 + readBytes), start);
    }

    const hexDump = Array.from(nvmData).map(b => b.toString(16).padStart(2, '0')).join(' ');
    updateLog(`Keymap NVM raw: ${hexDump}`);

    const layer0 = [];
    for (let i = 0; i < 8; i++) {
      const usage = nvmData[i * 2] | (nvmData[i * 2 + 1] << 8);
      layer0.push(parseKeymapUsage(usage, i));
    }

    const layer1 = [];
    for (let i = 0; i < 8; i++) {
      const usage = nvmData[16 + i * 2] | (nvmData[16 + i * 2 + 1] << 8);
      layer1.push(parseKeymapUsage(usage, i));
    }

    keymaps = [layer0, layer1];
    viewMode = 0;
    pendingChanges.clear();
    renderLayerTabs();
    renderNumpad();
    updateLog("Keymap read success (via NVM).");
  } catch (e) {
    updateLog(`Keymap read aborted: ${e.message}`);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  renderLayerTabs();
  renderNumpad();

  if (navigator.hid) navigator.hid.ondisconnect = handleHidDisconnect;

  document.getElementById("connectBtn").onclick = async () => {
    if (device) {
      clearConnectionState("Disconnect requested by user.", { log: true });
      return;
    }
    try {
      updateLog("Connecting to WebHID device...");
      const devices = await navigator.hid.requestDevice({ filters: [] });
      if (devices.length === 0) { updateLog("No matching device selected."); return; }

      device = devices[0];
      await device.open();
      device.oninputreport = handleInputReport;

      updateLog("Verifying hardware firmware version...");
      const { body } = await sendCommand(HID_COMMANDS.GET_VERSION);
      const hwVer = (body[0] << 8) | body[1];
      if (hwVer !== HID_CONFIG.VERSION_NUM) {
        throw new Error(`Firmware version mismatch: 0x${hwVer.toString(16).toUpperCase()} (expected 0x${HID_CONFIG.VERSION_NUM.toString(16).toUpperCase()})`);
      }

      updateLog(`Device connected! (Firmware: 0x${hwVer.toString(16).toUpperCase()})`);
      setConnectedUiState(true);
      pendingChanges.clear();
      await readKeymap();
      await readMacros(true);
    } catch (e) {
      clearConnectionState(`Connection failed: ${e.message}`, { log: false });
      updateLog(`Error: ${e.message}`);
    }
  };

  document.getElementById("readKeymapBtn").onclick = () => readKeymap();

  document.getElementById("writeKeymapBtn").onclick = async () => {
    if (!device) return;
    try {
      updateLog("Writing ALL key configurations forcibly...");
      for (let layer = 0; layer <= 1; layer++) {
        for (let switchId = 0; switchId < 8; switchId++) {
          const keyData = keymaps[layer][switchId];
          if (!keyData) continue;
          if (layer === 0) {
            await writeKey(0, switchId, keyData.usage);
          } else {
            const payload = new Uint8Array([switchId, keyData.usage >> 8, keyData.usage & 0xFF]);
            await sendCommand(HID_COMMANDS.WRITE_RE_KEY, payload);
          }
        }
      }
      pendingChanges.clear();
      renderNumpad();
      updateLog("Keymap values successfully synchronized with NVRAM.");
    } catch (e) {
      updateLog(`Keymap flash aborted: ${e.message}`);
    }
  };

  document.getElementById("readMacrosBtn").onclick  = () => readMacros(true);
  document.getElementById("writeMacrosBtn").onclick = () => writeMacros();

  document.getElementById("openMacroEditorBtn").onclick = () => {
    if (!device) return;
    renderMacroEditor();
    document.getElementById("macroEditorDialog").classList.remove("hidden");
  };

  document.getElementById("resetKeymapBtn").onclick = async () => {
    if (!device) return;
    if (!confirm("キーマップをデフォルト（出荷時）に戻します。よろしいですか？")) return;
    try {
      updateLog("Requesting hardware-side NVM layout reset factor...");
      await sendCommand(HID_COMMANDS.RESET_KEYMAP);
      updateLog("Device reset completed. Reloading updated values...");
      pendingChanges.clear();
      await readKeymap();
      await readMacros(true);
    } catch (e) {
      updateLog(`Reset action aborted: ${e.message}`);
    }
  };

  document.getElementById("startBootloaderBtn").onclick = async () => {
    if (!device) return;
    if (!confirm("デバイスをブートローダーモードに移行させます。よろしいですか？")) return;
    try {
      updateLog("Entering chip vendor bootloader space...");
      await sendCommand(HID_COMMANDS.START_BOOT_LOADER);
      clearConnectionState("Device detached for firmware flashing execution.", { log: true });
    } catch (e) {
      updateLog(`Bootloader entry failed: ${e.message}`);
    }
  };

  document.getElementById("clearLogBtn").onclick = () => {
    const logEl = document.getElementById("log");
    if (logEl) logEl.textContent = "";
  };

  // ダイアログ閉じる
  document.getElementById("closeDialog").onclick = () => document.getElementById("keyDialog").classList.add("hidden");
  document.getElementById("closeSpecialDialog").onclick = () => {
    document.getElementById("specialKeyDialog").classList.add("hidden");
    selectedSwitchId = null;
  };
  document.getElementById("closeMacroEditorDialog").onclick = () => {
    document.getElementById("macroEditorDialog").classList.add("hidden");
  };

  // 特殊機能キー設定
  document.getElementById("setNumLock").onclick = () => {
    if (selectedSwitchId === null) return;
    keymaps[viewMode][selectedSwitchId] = { usage: 0x53, label: "NumLock" };
    pendingChanges.add(`${viewMode}:${selectedSwitchId}`);
    document.getElementById("specialKeyDialog").classList.add("hidden");
    selectedSwitchId = null;
    renderNumpad();
  };

  document.getElementById("setFn").onclick = () => {
    if (selectedSwitchId === null) return;
    keymaps[viewMode][selectedSwitchId] = { usage: 0xBC, label: "Fn" };
    pendingChanges.add(`${viewMode}:${selectedSwitchId}`);
    document.getElementById("specialKeyDialog").classList.add("hidden");
    selectedSwitchId = null;
    renderNumpad();
  };

  // マクロ操作
  document.getElementById("macroDeleteLastBtn").onclick = () => removeLastMacroCode();
  document.getElementById("macroClearBtn").onclick = () => {
    if (confirm("このマクロに登録されているコードをすべてクリアしますか？")) clearSelectedMacro();
  };

  // NVM読み出し
  document.getElementById("readNvmBtn").onclick = async () => {
    if (!device) return updateLog("Not connected.");
    try {
      const requestedBytes = HID_CONFIG.NVM_SIZE;
      const nvmData  = new Uint8Array(requestedBytes);
      const payload  = new Uint8Array(HID_CONFIG.RAW_DATA_SIZE - 1);
      const dataSize = payload.length - 2;

      for (let start = 0; start < requestedBytes; start += dataSize) {
        const chunkSize = Math.min(dataSize, requestedBytes - start);
        payload.fill(0);
        payload[0] = start;
        payload[1] = chunkSize;
        const { body } = await sendCommand(HID_COMMANDS.READ_NVM, payload);
        const readBytes = Math.min(body[0], chunkSize);
        nvmData.set(body.slice(1, 1 + readBytes), start);
      }

      let hexString = "";
      for (let i = 0; i < nvmData.length; i++) {
        if (i > 0 && i % 8 === 0) hexString += "\n";
        hexString += nvmData[i].toString(16).padStart(2, '0') + " ";
      }
      updateLog(`NVM Data:\n${hexString.trim()}`);
    } catch (e) {
      updateLog(`NVM Read Failed: ${e.message}`);
    }
  };

  // macro ptrs
  document.getElementById("readMacroPtrsBtn").onclick = async () => {
    if (!device) return updateLog("Not connected.");
    try {
      const requestedBytes = 10;
      const payload = new Uint8Array([requestedBytes]);
      const { body } = await sendCommand(HID_COMMANDS.READ_MACRO_PTRS, payload);
      const readLength = Math.min(body[0], requestedBytes);
      const ptrData    = body.slice(1, 1 + readLength);
      const hexString  = Array.from(ptrData).map(b => b.toString(16).toUpperCase().padStart(2, "0")).join(" ");
      updateLog(`macro ptrs (${readLength} bytes): ${hexString}`);
    } catch (e) {
      updateLog(`Macro ptrs read failed: ${e.message}`);
    }
  };
});
