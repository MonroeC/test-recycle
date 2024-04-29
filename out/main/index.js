"use strict";
const electron = require("electron");
const utils = require("@electron-toolkit/utils");
const require$$0$1 = require("os");
const require$$1$1 = require("fs");
const require$$2 = require("path");
const require$$1 = require("child_process");
const require$$4 = require("util");
const require$$0$2 = require("net");
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var lib = {};
const name = "systeminformation";
const version = "5.22.7";
const description = "Advanced, lightweight system and OS information library";
const license = "MIT";
const author = "Sebastian Hildebrandt <hildebrandt@plus-innovations.com> (https://plus-innovations.com)";
const homepage = "https://systeminformation.io";
const main = "./lib/index.js";
const bin = {
  systeminformation: "lib/cli.js"
};
const types = "./lib/index.d.ts";
const scripts = {
  test: "node ./test/test.js"
};
const files = [
  "lib/"
];
const keywords = [
  "system information",
  "sysinfo",
  "monitor",
  "monitoring",
  "os",
  "linux",
  "osx",
  "windows",
  "freebsd",
  "openbsd",
  "netbsd",
  "cpu",
  "cpuload",
  "physical cores",
  "logical cores",
  "processor",
  "cores",
  "threads",
  "socket type",
  "memory",
  "file system",
  "fsstats",
  "diskio",
  "block devices",
  "netstats",
  "network",
  "network interfaces",
  "network connections",
  "network stats",
  "iface",
  "printer",
  "processes",
  "users",
  "internet",
  "battery",
  "docker",
  "docker stats",
  "docker processes",
  "graphics",
  "graphic card",
  "graphic controller",
  "gpu",
  "display",
  "smart",
  "disk layout",
  "usb",
  "audio",
  "bluetooth",
  "wifi",
  "wifinetworks",
  "virtual box",
  "virtualbox",
  "vm",
  "backend",
  "hardware",
  "BIOS",
  "chassis"
];
const repository = {
  type: "git",
  url: "https://github.com/sebhildebrandt/systeminformation.git"
};
const funding = {
  type: "Buy me a coffee",
  url: "https://www.buymeacoffee.com/systeminfo"
};
const os$9 = [
  "darwin",
  "linux",
  "win32",
  "freebsd",
  "openbsd",
  "netbsd",
  "sunos",
  "android"
];
const engines = {
  node: ">=8.0.0"
};
const require$$0 = {
  name,
  version,
  description,
  license,
  author,
  homepage,
  main,
  bin,
  types,
  scripts,
  files,
  keywords,
  repository,
  funding,
  os: os$9,
  engines
};
var util$j = {};
const os$8 = require$$0$1;
const fs$c = require$$1$1;
const path$2 = require$$2;
const spawn = require$$1.spawn;
const exec$g = require$$1.exec;
const execSync$b = require$$1.execSync;
const util$i = require$$4;
let _platform$h = process.platform;
const _linux$g = _platform$h === "linux" || _platform$h === "android";
const _darwin$g = _platform$h === "darwin";
const _windows$h = _platform$h === "win32";
const _freebsd$f = _platform$h === "freebsd";
const _openbsd$f = _platform$h === "openbsd";
const _netbsd$f = _platform$h === "netbsd";
let _cores = 0;
let wmicPath = "";
let codepage = "";
let _smartMonToolsInstalled = null;
let _rpi_cpuinfo = null;
const WINDIR = process.env.WINDIR || "C:\\Windows";
let _psChild;
let _psResult = "";
let _psCmds = [];
let _psPersistent = false;
const _psToUTF8 = "$OutputEncoding = [System.Console]::OutputEncoding = [System.Console]::InputEncoding = [System.Text.Encoding]::UTF8 ; ";
const _psCmdStart = "--###START###--";
const _psError = "--ERROR--";
const _psCmdSeperator = "--###ENDCMD###--";
const _psIdSeperator = "--##ID##--";
const execOptsWin = {
  windowsHide: true,
  maxBuffer: 1024 * 2e4,
  encoding: "UTF-8",
  env: util$i._extend({}, process.env, { LANG: "en_US.UTF-8" })
};
function toInt(value) {
  let result = parseInt(value, 10);
  if (isNaN(result)) {
    result = 0;
  }
  return result;
}
function splitByNumber(str) {
  let numberStarted = false;
  let num = "";
  let cpart = "";
  for (const c of str) {
    if (c >= "0" && c <= "9" || numberStarted) {
      numberStarted = true;
      num += c;
    } else {
      cpart += c;
    }
  }
  return [cpart, num];
}
const stringReplace = new String().replace;
const stringToLower = new String().toLowerCase;
const stringToString = new String().toString;
const stringSubstr = new String().substr;
const stringTrim = new String().trim;
const stringStartWith = new String().startsWith;
const mathMin = Math.min;
function isFunction(functionToCheck) {
  let getType = {};
  return functionToCheck && getType.toString.call(functionToCheck) === "[object Function]";
}
function unique(obj) {
  let uniques = [];
  let stringify = {};
  for (let i = 0; i < obj.length; i++) {
    let keys = Object.keys(obj[i]);
    keys.sort(function(a, b) {
      return a - b;
    });
    let str = "";
    for (let j = 0; j < keys.length; j++) {
      str += JSON.stringify(keys[j]);
      str += JSON.stringify(obj[i][keys[j]]);
    }
    if (!{}.hasOwnProperty.call(stringify, str)) {
      uniques.push(obj[i]);
      stringify[str] = true;
    }
  }
  return uniques;
}
function sortByKey(array, keys) {
  return array.sort(function(a, b) {
    let x = "";
    let y = "";
    keys.forEach(function(key) {
      x = x + a[key];
      y = y + b[key];
    });
    return x < y ? -1 : x > y ? 1 : 0;
  });
}
function cores() {
  if (_cores === 0) {
    _cores = os$8.cpus().length;
  }
  return _cores;
}
function getValue(lines, property, separator, trimmed, lineMatch) {
  separator = separator || ":";
  property = property.toLowerCase();
  trimmed = trimmed || false;
  lineMatch = lineMatch || false;
  let result = "";
  lines.some((line) => {
    let lineLower = line.toLowerCase().replace(/\t/g, "");
    if (trimmed) {
      lineLower = lineLower.trim();
    }
    if (lineLower.startsWith(property) && (lineMatch ? lineLower.match(property + separator) || lineLower.match(property + " " + separator) : true)) {
      const parts = trimmed ? line.trim().split(separator) : line.split(separator);
      if (parts.length >= 2) {
        parts.shift();
        result = parts.join(separator).trim();
        return true;
      }
    }
  });
  return result;
}
function decodeEscapeSequence(str, base) {
  base = base || 16;
  return str.replace(/\\x([0-9A-Fa-f]{2})/g, function() {
    return String.fromCharCode(parseInt(arguments[1], base));
  });
}
function detectSplit(str) {
  let seperator = "";
  let part = 0;
  str.split("").forEach((element) => {
    if (element >= "0" && element <= "9") {
      if (part === 1) {
        part++;
      }
    } else {
      if (part === 0) {
        part++;
      }
      if (part === 1) {
        seperator += element;
      }
    }
  });
  return seperator;
}
function parseTime(t, pmDesignator) {
  pmDesignator = pmDesignator || "";
  t = t.toUpperCase();
  let hour = 0;
  let min = 0;
  let splitter = detectSplit(t);
  let parts = t.split(splitter);
  if (parts.length >= 2) {
    if (parts[2]) {
      parts[1] += parts[2];
    }
    let isPM = parts[1] && parts[1].toLowerCase().indexOf("pm") > -1 || parts[1].toLowerCase().indexOf("p.m.") > -1 || parts[1].toLowerCase().indexOf("p. m.") > -1 || parts[1].toLowerCase().indexOf("n") > -1 || parts[1].toLowerCase().indexOf("ch") > -1 || parts[1].toLowerCase().indexOf("ös") > -1 || pmDesignator && parts[1].toLowerCase().indexOf(pmDesignator) > -1;
    hour = parseInt(parts[0], 10);
    min = parseInt(parts[1], 10);
    hour = isPM && hour < 12 ? hour + 12 : hour;
    return ("0" + hour).substr(-2) + ":" + ("0" + min).substr(-2);
  }
}
function parseDateTime(dt, culture) {
  const result = {
    date: "",
    time: ""
  };
  culture = culture || {};
  let dateFormat = (culture.dateFormat || "").toLowerCase();
  let pmDesignator = culture.pmDesignator || "";
  const parts = dt.split(" ");
  if (parts[0]) {
    if (parts[0].indexOf("/") >= 0) {
      const dtparts = parts[0].split("/");
      if (dtparts.length === 3) {
        if (dtparts[0].length === 4) {
          result.date = dtparts[0] + "-" + ("0" + dtparts[1]).substr(-2) + "-" + ("0" + dtparts[2]).substr(-2);
        } else if (dtparts[2].length === 2) {
          if (dateFormat.indexOf("/d/") > -1 || dateFormat.indexOf("/dd/") > -1) {
            result.date = "20" + dtparts[2] + "-" + ("0" + dtparts[1]).substr(-2) + "-" + ("0" + dtparts[0]).substr(-2);
          } else {
            result.date = "20" + dtparts[2] + "-" + ("0" + dtparts[1]).substr(-2) + "-" + ("0" + dtparts[0]).substr(-2);
          }
        } else {
          const isEN = dt.toLowerCase().indexOf("pm") > -1 || dt.toLowerCase().indexOf("p.m.") > -1 || dt.toLowerCase().indexOf("p. m.") > -1 || dt.toLowerCase().indexOf("am") > -1 || dt.toLowerCase().indexOf("a.m.") > -1 || dt.toLowerCase().indexOf("a. m.") > -1;
          if ((isEN || dateFormat.indexOf("/d/") > -1 || dateFormat.indexOf("/dd/") > -1) && dateFormat.indexOf("dd/") !== 0) {
            result.date = dtparts[2] + "-" + ("0" + dtparts[0]).substr(-2) + "-" + ("0" + dtparts[1]).substr(-2);
          } else {
            result.date = dtparts[2] + "-" + ("0" + dtparts[1]).substr(-2) + "-" + ("0" + dtparts[0]).substr(-2);
          }
        }
      }
    }
    if (parts[0].indexOf(".") >= 0) {
      const dtparts = parts[0].split(".");
      if (dtparts.length === 3) {
        if (dateFormat.indexOf(".d.") > -1 || dateFormat.indexOf(".dd.") > -1) {
          result.date = dtparts[2] + "-" + ("0" + dtparts[0]).substr(-2) + "-" + ("0" + dtparts[1]).substr(-2);
        } else {
          result.date = dtparts[2] + "-" + ("0" + dtparts[1]).substr(-2) + "-" + ("0" + dtparts[0]).substr(-2);
        }
      }
    }
    if (parts[0].indexOf("-") >= 0) {
      const dtparts = parts[0].split("-");
      if (dtparts.length === 3) {
        result.date = dtparts[0] + "-" + ("0" + dtparts[1]).substr(-2) + "-" + ("0" + dtparts[2]).substr(-2);
      }
    }
  }
  if (parts[1]) {
    parts.shift();
    let time2 = parts.join(" ");
    result.time = parseTime(time2, pmDesignator);
  }
  return result;
}
function parseHead(head, rights) {
  let space = rights > 0;
  let count = 1;
  let from = 0;
  let to = 0;
  let result = [];
  for (let i = 0; i < head.length; i++) {
    if (count <= rights) {
      if (/\s/.test(head[i]) && !space) {
        to = i - 1;
        result.push({
          from,
          to: to + 1,
          cap: head.substring(from, to + 1)
        });
        from = to + 2;
        count++;
      }
      space = head[i] === " ";
    } else {
      if (!/\s/.test(head[i]) && space) {
        to = i - 1;
        if (from < to) {
          result.push({
            from,
            to,
            cap: head.substring(from, to)
          });
        }
        from = to + 1;
        count++;
      }
      space = head[i] === " ";
    }
  }
  to = 5e3;
  result.push({
    from,
    to,
    cap: head.substring(from, to)
  });
  let len = result.length;
  for (let i = 0; i < len; i++) {
    if (result[i].cap.replace(/\s/g, "").length === 0) {
      if (i + 1 < len) {
        result[i].to = result[i + 1].to;
        result[i].cap = result[i].cap + result[i + 1].cap;
        result.splice(i + 1, 1);
        len = len - 1;
      }
    }
  }
  return result;
}
function findObjectByKey(array, key, value) {
  for (let i = 0; i < array.length; i++) {
    if (array[i][key] === value) {
      return i;
    }
  }
  return -1;
}
function getWmic() {
  if (os$8.type() === "Windows_NT" && !wmicPath) {
    wmicPath = WINDIR + "\\system32\\wbem\\wmic.exe";
    if (!fs$c.existsSync(wmicPath)) {
      try {
        const wmicPathArray = execSync$b("WHERE WMIC", execOptsWin).toString().split("\r\n");
        if (wmicPathArray && wmicPathArray.length) {
          wmicPath = wmicPathArray[0];
        } else {
          wmicPath = "wmic";
        }
      } catch (e) {
        wmicPath = "wmic";
      }
    }
  }
  return wmicPath;
}
function wmic(command) {
  return new Promise((resolve) => {
    process.nextTick(() => {
      try {
        powerShell(getWmic() + " " + command).then((stdout) => {
          resolve(stdout, "");
        });
      } catch (e) {
        resolve("", e);
      }
    });
  });
}
function getVboxmanage() {
  return _windows$h ? `"${process.env.VBOX_INSTALL_PATH || process.env.VBOX_MSI_INSTALL_PATH}\\VBoxManage.exe"` : "vboxmanage";
}
function powerShellProceedResults(data) {
  let id = "";
  let parts;
  let res = "";
  if (data.indexOf(_psCmdStart) >= 0) {
    parts = data.split(_psCmdStart);
    const parts2 = parts[1].split(_psIdSeperator);
    id = parts2[0];
    if (parts2.length > 1) {
      data = parts2.slice(1).join(_psIdSeperator);
    }
  }
  if (data.indexOf(_psCmdSeperator) >= 0) {
    parts = data.split(_psCmdSeperator);
    res = parts[0];
  }
  let remove = -1;
  for (let i = 0; i < _psCmds.length; i++) {
    if (_psCmds[i].id === id) {
      remove = i;
      _psCmds[i].callback(res);
    }
  }
  if (remove >= 0) {
    _psCmds.splice(remove, 1);
  }
}
function powerShellStart() {
  if (!_psChild) {
    _psChild = spawn("powershell.exe", ["-NoProfile", "-NoLogo", "-InputFormat", "Text", "-NoExit", "-Command", "-"], {
      stdio: "pipe",
      windowsHide: true,
      maxBuffer: 1024 * 2e4,
      encoding: "UTF-8",
      env: util$i._extend({}, process.env, { LANG: "en_US.UTF-8" })
    });
    if (_psChild && _psChild.pid) {
      _psPersistent = true;
      _psChild.stdout.on("data", function(data) {
        _psResult = _psResult + data.toString("utf8");
        if (data.indexOf(_psCmdSeperator) >= 0) {
          powerShellProceedResults(_psResult);
          _psResult = "";
        }
      });
      _psChild.stderr.on("data", function() {
        powerShellProceedResults(_psResult + _psError);
      });
      _psChild.on("error", function() {
        powerShellProceedResults(_psResult + _psError);
      });
      _psChild.on("close", function() {
        _psChild.kill();
      });
    }
  }
}
function powerShellRelease() {
  try {
    if (_psChild) {
      _psChild.stdin.write("exit" + os$8.EOL);
      _psChild.stdin.end();
      _psPersistent = false;
    }
  } catch (e) {
    if (_psChild) {
      _psChild.kill();
    }
  }
  _psChild = null;
}
function powerShell(cmd) {
  if (_psPersistent) {
    const id = Math.random().toString(36).substring(2, 12);
    return new Promise((resolve) => {
      process.nextTick(() => {
        function callback(data) {
          resolve(data);
        }
        _psCmds.push({
          id,
          cmd,
          callback,
          start: /* @__PURE__ */ new Date()
        });
        try {
          if (_psChild && _psChild.pid) {
            _psChild.stdin.write(_psToUTF8 + "echo " + _psCmdStart + id + _psIdSeperator + "; " + os$8.EOL + cmd + os$8.EOL + "echo " + _psCmdSeperator + os$8.EOL);
          }
        } catch (e) {
          resolve("");
        }
      });
    });
  } else {
    let result = "";
    return new Promise((resolve) => {
      process.nextTick(() => {
        try {
          const child = spawn("powershell.exe", ["-NoProfile", "-NoLogo", "-InputFormat", "Text", "-NoExit", "-ExecutionPolicy", "Unrestricted", "-Command", "-"], {
            stdio: "pipe",
            windowsHide: true,
            maxBuffer: 1024 * 2e4,
            encoding: "UTF-8",
            env: util$i._extend({}, process.env, { LANG: "en_US.UTF-8" })
          });
          if (child && !child.pid) {
            child.on("error", function() {
              resolve(result);
            });
          }
          if (child && child.pid) {
            child.stdout.on("data", function(data) {
              result = result + data.toString("utf8");
            });
            child.stderr.on("data", function() {
              child.kill();
              resolve(result);
            });
            child.on("close", function() {
              child.kill();
              resolve(result);
            });
            child.on("error", function() {
              child.kill();
              resolve(result);
            });
            try {
              child.stdin.write(_psToUTF8 + cmd + os$8.EOL);
              child.stdin.write("exit" + os$8.EOL);
              child.stdin.end();
            } catch (e) {
              child.kill();
              resolve(result);
            }
          } else {
            resolve(result);
          }
        } catch (e) {
          resolve(result);
        }
      });
    });
  }
}
function execSafe(cmd, args, options) {
  let result = "";
  options = options || {};
  return new Promise((resolve) => {
    process.nextTick(() => {
      try {
        const child = spawn(cmd, args, options);
        if (child && !child.pid) {
          child.on("error", function() {
            resolve(result);
          });
        }
        if (child && child.pid) {
          child.stdout.on("data", function(data) {
            result += data.toString();
          });
          child.on("close", function() {
            child.kill();
            resolve(result);
          });
          child.on("error", function() {
            child.kill();
            resolve(result);
          });
        } else {
          resolve(result);
        }
      } catch (e) {
        resolve(result);
      }
    });
  });
}
function getCodepage() {
  if (_windows$h) {
    if (!codepage) {
      try {
        const stdout = execSync$b("chcp", execOptsWin);
        const lines = stdout.toString().split("\r\n");
        const parts = lines[0].split(":");
        codepage = parts.length > 1 ? parts[1].replace(".", "").trim() : "";
      } catch (err) {
        codepage = "437";
      }
    }
    return codepage;
  }
  if (_linux$g || _darwin$g || _freebsd$f || _openbsd$f || _netbsd$f) {
    if (!codepage) {
      try {
        const stdout = execSync$b("echo $LANG");
        const lines = stdout.toString().split("\r\n");
        const parts = lines[0].split(".");
        codepage = parts.length > 1 ? parts[1].trim() : "";
        if (!codepage) {
          codepage = "UTF-8";
        }
      } catch (err) {
        codepage = "UTF-8";
      }
    }
    return codepage;
  }
}
function smartMonToolsInstalled() {
  if (_smartMonToolsInstalled !== null) {
    return _smartMonToolsInstalled;
  }
  _smartMonToolsInstalled = false;
  if (_windows$h) {
    try {
      const pathArray = execSync$b("WHERE smartctl 2>nul", execOptsWin).toString().split("\r\n");
      if (pathArray && pathArray.length) {
        _smartMonToolsInstalled = pathArray[0].indexOf(":\\") >= 0;
      } else {
        _smartMonToolsInstalled = false;
      }
    } catch (e) {
      _smartMonToolsInstalled = false;
    }
  }
  if (_linux$g || _darwin$g || _freebsd$f || _openbsd$f || _netbsd$f) {
    try {
      const pathArray = execSync$b("which smartctl 2>/dev/null", execOptsWin).toString().split("\r\n");
      _smartMonToolsInstalled = pathArray.length > 0;
    } catch (e) {
      util$i.noop();
    }
  }
  return _smartMonToolsInstalled;
}
function isRaspberry() {
  const PI_MODEL_NO = [
    "BCM2708",
    "BCM2709",
    "BCM2710",
    "BCM2711",
    "BCM2712",
    "BCM2835",
    "BCM2836",
    "BCM2837",
    "BCM2837B0"
  ];
  let cpuinfo = [];
  if (_rpi_cpuinfo !== null) {
    cpuinfo = _rpi_cpuinfo;
  } else {
    try {
      cpuinfo = fs$c.readFileSync("/proc/cpuinfo", { encoding: "utf8" }).toString().split("\n");
      _rpi_cpuinfo = cpuinfo;
    } catch (e) {
      return false;
    }
  }
  const hardware = getValue(cpuinfo, "hardware");
  return hardware && PI_MODEL_NO.indexOf(hardware) > -1;
}
function isRaspbian() {
  let osrelease = [];
  try {
    osrelease = fs$c.readFileSync("/etc/os-release", { encoding: "utf8" }).toString().split("\n");
  } catch (e) {
    return false;
  }
  const id = getValue(osrelease, "id", "=");
  return id && id.indexOf("raspbian") > -1;
}
function execWin(cmd, opts, callback) {
  if (!callback) {
    callback = opts;
    opts = execOptsWin;
  }
  let newCmd = "chcp 65001 > nul && cmd /C " + cmd + " && chcp " + codepage + " > nul";
  exec$g(newCmd, opts, function(error, stdout) {
    callback(error, stdout);
  });
}
function darwinXcodeExists() {
  const cmdLineToolsExists = fs$c.existsSync("/Library/Developer/CommandLineTools/usr/bin/");
  const xcodeAppExists = fs$c.existsSync("/Applications/Xcode.app/Contents/Developer/Tools");
  const xcodeExists = fs$c.existsSync("/Library/Developer/Xcode/");
  return cmdLineToolsExists || xcodeExists || xcodeAppExists;
}
function nanoSeconds() {
  const time2 = process.hrtime();
  if (!Array.isArray(time2) || time2.length !== 2) {
    return 0;
  }
  return +time2[0] * 1e9 + +time2[1];
}
function countUniqueLines(lines, startingWith) {
  startingWith = startingWith || "";
  const uniqueLines = [];
  lines.forEach((line) => {
    if (line.startsWith(startingWith)) {
      if (uniqueLines.indexOf(line) === -1) {
        uniqueLines.push(line);
      }
    }
  });
  return uniqueLines.length;
}
function countLines(lines, startingWith) {
  startingWith = startingWith || "";
  const uniqueLines = [];
  lines.forEach((line) => {
    if (line.startsWith(startingWith)) {
      uniqueLines.push(line);
    }
  });
  return uniqueLines.length;
}
function sanitizeShellString(str, strict) {
  if (typeof strict === "undefined") {
    strict = false;
  }
  const s = str || "";
  let result = "";
  const l = mathMin(s.length, 2e3);
  for (let i = 0; i <= l; i++) {
    if (!(s[i] === void 0 || s[i] === ">" || s[i] === "<" || s[i] === "*" || s[i] === "?" || s[i] === "[" || s[i] === "]" || s[i] === "|" || s[i] === "˚" || s[i] === "$" || s[i] === ";" || s[i] === "&" || s[i] === "]" || s[i] === "#" || s[i] === "\\" || s[i] === "	" || s[i] === "\n" || s[i] === "\r" || s[i] === "'" || s[i] === "`" || s[i] === '"' || s[i].length > 1 || strict && s[i] === "(" || strict && s[i] === ")" || strict && s[i] === "@" || strict && s[i] === " " || strict && s[i] == "{" || strict && s[i] == ";" || strict && s[i] == "}")) {
      result = result + s[i];
    }
  }
  return result;
}
function isPrototypePolluted() {
  const s = "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let notPolluted = true;
  let st = "";
  st.__proto__.replace = stringReplace;
  st.__proto__.toLowerCase = stringToLower;
  st.__proto__.toString = stringToString;
  st.__proto__.substr = stringSubstr;
  notPolluted = notPolluted || s.length !== 62;
  const ms = Date.now();
  if (typeof ms === "number" && ms > 16e11) {
    const l = ms % 100 + 15;
    for (let i = 0; i < l; i++) {
      const r = Math.random() * 61.99999999 + 1;
      const rs = parseInt(Math.floor(r).toString(), 10);
      const rs2 = parseInt(r.toString().split(".")[0], 10);
      const q = Math.random() * 61.99999999 + 1;
      const qs = parseInt(Math.floor(q).toString(), 10);
      const qs2 = parseInt(q.toString().split(".")[0], 10);
      notPolluted = notPolluted && r !== q;
      notPolluted = notPolluted && rs === rs2 && qs === qs2;
      st += s[rs - 1];
    }
    notPolluted = notPolluted && st.length === l;
    let p = Math.random() * l * 0.9999999999;
    let stm = st.substr(0, p) + " " + st.substr(p, 2e3);
    stm.__proto__.replace = stringReplace;
    let sto = stm.replace(/ /g, "");
    notPolluted = notPolluted && st === sto;
    p = Math.random() * l * 0.9999999999;
    stm = st.substr(0, p) + "{" + st.substr(p, 2e3);
    sto = stm.replace(/{/g, "");
    notPolluted = notPolluted && st === sto;
    p = Math.random() * l * 0.9999999999;
    stm = st.substr(0, p) + "*" + st.substr(p, 2e3);
    sto = stm.replace(/\*/g, "");
    notPolluted = notPolluted && st === sto;
    p = Math.random() * l * 0.9999999999;
    stm = st.substr(0, p) + "$" + st.substr(p, 2e3);
    sto = stm.replace(/\$/g, "");
    notPolluted = notPolluted && st === sto;
    const stl = st.toLowerCase();
    notPolluted = notPolluted && stl.length === l && stl[l - 1] && !stl[l];
    for (let i = 0; i < l; i++) {
      const s1 = st[i];
      s1.__proto__.toLowerCase = stringToLower;
      const s2 = stl ? stl[i] : "";
      const s1l = s1.toLowerCase();
      notPolluted = notPolluted && s1l[0] === s2 && s1l[0] && !s1l[1];
    }
  }
  return !notPolluted;
}
function hex2bin(hex) {
  return ("00000000" + parseInt(hex, 16).toString(2)).substr(-8);
}
function getFilesInPath(source) {
  const lstatSync = fs$c.lstatSync;
  const readdirSync = fs$c.readdirSync;
  const join2 = path$2.join;
  function isDirectory(source2) {
    return lstatSync(source2).isDirectory();
  }
  function isFile(source2) {
    return lstatSync(source2).isFile();
  }
  function getDirectories(source2) {
    return readdirSync(source2).map(function(name2) {
      return join2(source2, name2);
    }).filter(isDirectory);
  }
  function getFiles(source2) {
    return readdirSync(source2).map(function(name2) {
      return join2(source2, name2);
    }).filter(isFile);
  }
  function getFilesRecursively(source2) {
    try {
      let dirs = getDirectories(source2);
      let files2 = dirs.map(function(dir) {
        return getFilesRecursively(dir);
      }).reduce(function(a, b) {
        return a.concat(b);
      }, []);
      return files2.concat(getFiles(source2));
    } catch (e) {
      return [];
    }
  }
  if (fs$c.existsSync(source)) {
    return getFilesRecursively(source);
  } else {
    return [];
  }
}
function decodePiCpuinfo(lines) {
  if (_rpi_cpuinfo === null) {
    _rpi_cpuinfo = lines;
  }
  const oldRevisionCodes = {
    "0002": {
      type: "B",
      revision: "1.0",
      memory: 256,
      manufacturer: "Egoman",
      processor: "BCM2835"
    },
    "0003": {
      type: "B",
      revision: "1.0",
      memory: 256,
      manufacturer: "Egoman",
      processor: "BCM2835"
    },
    "0004": {
      type: "B",
      revision: "2.0",
      memory: 256,
      manufacturer: "Sony UK",
      processor: "BCM2835"
    },
    "0005": {
      type: "B",
      revision: "2.0",
      memory: 256,
      manufacturer: "Qisda",
      processor: "BCM2835"
    },
    "0006": {
      type: "B",
      revision: "2.0",
      memory: 256,
      manufacturer: "Egoman",
      processor: "BCM2835"
    },
    "0007": {
      type: "A",
      revision: "2.0",
      memory: 256,
      manufacturer: "Egoman",
      processor: "BCM2835"
    },
    "0008": {
      type: "A",
      revision: "2.0",
      memory: 256,
      manufacturer: "Sony UK",
      processor: "BCM2835"
    },
    "0009": {
      type: "A",
      revision: "2.0",
      memory: 256,
      manufacturer: "Qisda",
      processor: "BCM2835"
    },
    "000d": {
      type: "B",
      revision: "2.0",
      memory: 512,
      manufacturer: "Egoman",
      processor: "BCM2835"
    },
    "000e": {
      type: "B",
      revision: "2.0",
      memory: 512,
      manufacturer: "Sony UK",
      processor: "BCM2835"
    },
    "000f": {
      type: "B",
      revision: "2.0",
      memory: 512,
      manufacturer: "Egoman",
      processor: "BCM2835"
    },
    "0010": {
      type: "B+",
      revision: "1.2",
      memory: 512,
      manufacturer: "Sony UK",
      processor: "BCM2835"
    },
    "0011": {
      type: "CM1",
      revision: "1.0",
      memory: 512,
      manufacturer: "Sony UK",
      processor: "BCM2835"
    },
    "0012": {
      type: "A+",
      revision: "1.1",
      memory: 256,
      manufacturer: "Sony UK",
      processor: "BCM2835"
    },
    "0013": {
      type: "B+",
      revision: "1.2",
      memory: 512,
      manufacturer: "Embest",
      processor: "BCM2835"
    },
    "0014": {
      type: "CM1",
      revision: "1.0",
      memory: 512,
      manufacturer: "Embest",
      processor: "BCM2835"
    },
    "0015": {
      type: "A+",
      revision: "1.1",
      memory: 256,
      manufacturer: "512MB	Embest",
      processor: "BCM2835"
    }
  };
  const processorList = [
    "BCM2835",
    "BCM2836",
    "BCM2837",
    "BCM2711",
    "BCM2712"
  ];
  const manufacturerList = [
    "Sony UK",
    "Egoman",
    "Embest",
    "Sony Japan",
    "Embest",
    "Stadium"
  ];
  const typeList = {
    "00": "A",
    "01": "B",
    "02": "A+",
    "03": "B+",
    "04": "2B",
    "05": "Alpha (early prototype)",
    "06": "CM1",
    "08": "3B",
    "09": "Zero",
    "0a": "CM3",
    "0c": "Zero W",
    "0d": "3B+",
    "0e": "3A+",
    "0f": "Internal use only",
    "10": "CM3+",
    "11": "4B",
    "12": "Zero 2 W",
    "13": "400",
    "14": "CM4",
    "15": "CM4S",
    "17": "5"
  };
  const revisionCode = getValue(lines, "revision", ":", true);
  const model = getValue(lines, "model:", ":", true);
  const serial = getValue(lines, "serial", ":", true);
  let result = {};
  if ({}.hasOwnProperty.call(oldRevisionCodes, revisionCode)) {
    result = {
      model,
      serial,
      revisionCode,
      memory: oldRevisionCodes[revisionCode].memory,
      manufacturer: oldRevisionCodes[revisionCode].manufacturer,
      processor: oldRevisionCodes[revisionCode].processor,
      type: oldRevisionCodes[revisionCode].type,
      revision: oldRevisionCodes[revisionCode].revision
    };
  } else {
    const revision = ("00000000" + getValue(lines, "revision", ":", true).toLowerCase()).substr(-8);
    const memSizeCode = parseInt(hex2bin(revision.substr(2, 1)).substr(5, 3), 2) || 0;
    const manufacturer = manufacturerList[parseInt(revision.substr(3, 1), 10)];
    const processor = processorList[parseInt(revision.substr(4, 1), 10)];
    const typeCode = revision.substr(5, 2);
    result = {
      model,
      serial,
      revisionCode,
      memory: 256 * Math.pow(2, memSizeCode),
      manufacturer,
      processor,
      type: {}.hasOwnProperty.call(typeList, typeCode) ? typeList[typeCode] : "",
      revision: "1." + revision.substr(7, 1)
    };
  }
  return result;
}
function getRpiGpu() {
  let cpuinfo = null;
  if (_rpi_cpuinfo !== null) {
    cpuinfo = _rpi_cpuinfo;
  } else {
    try {
      cpuinfo = fs$c.readFileSync("/proc/cpuinfo", { encoding: "utf8" }).toString().split("\n");
      _rpi_cpuinfo = cpuinfo;
    } catch (e) {
      return false;
    }
  }
  const rpi = decodePiCpuinfo(cpuinfo);
  if (rpi.type === "4B" || rpi.type === "CM4" || rpi.type === "CM4S" || rpi.type === "400") {
    return "VideoCore VI";
  }
  if (rpi.type === "5") {
    return "VideoCore VII";
  }
  return "VideoCore IV";
}
function promiseAll(promises) {
  const resolvingPromises = promises.map(function(promise) {
    return new Promise(function(resolve) {
      let payload = new Array(2);
      promise.then(function(result) {
        payload[0] = result;
      }).catch(function(error) {
        payload[1] = error;
      }).then(function() {
        resolve(payload);
      });
    });
  });
  const errors = [];
  const results = [];
  return Promise.all(resolvingPromises).then(function(items) {
    items.forEach(function(payload) {
      if (payload[1]) {
        errors.push(payload[1]);
        results.push(null);
      } else {
        errors.push(null);
        results.push(payload[0]);
      }
    });
    return {
      errors,
      results
    };
  });
}
function promisify(nodeStyleFunction) {
  return function() {
    const args = Array.prototype.slice.call(arguments);
    return new Promise(function(resolve, reject) {
      args.push(function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
      nodeStyleFunction.apply(null, args);
    });
  };
}
function promisifySave(nodeStyleFunction) {
  return function() {
    const args = Array.prototype.slice.call(arguments);
    return new Promise(function(resolve) {
      args.push(function(err, data) {
        resolve(data);
      });
      nodeStyleFunction.apply(null, args);
    });
  };
}
function linuxVersion() {
  let result = "";
  if (_linux$g) {
    try {
      result = execSync$b("uname -v").toString();
    } catch (e) {
      result = "";
    }
  }
  return result;
}
function plistParser(xmlStr) {
  const tags = ["array", "dict", "key", "string", "integer", "date", "real", "data", "boolean", "arrayEmpty"];
  const startStr = "<plist version";
  let pos = xmlStr.indexOf(startStr);
  let len = xmlStr.length;
  while (xmlStr[pos] !== ">" && pos < len) {
    pos++;
  }
  let depth = 0;
  let inTagStart = false;
  let inTagContent = false;
  let inTagEnd = false;
  let metaData = [{ tagStart: "", tagEnd: "", tagContent: "", key: "", data: null }];
  let c = "";
  let cn = xmlStr[pos];
  while (pos < len) {
    c = cn;
    if (pos + 1 < len) {
      cn = xmlStr[pos + 1];
    }
    if (c === "<") {
      inTagContent = false;
      if (cn === "/") {
        inTagEnd = true;
      } else if (metaData[depth].tagStart) {
        metaData[depth].tagContent = "";
        if (!metaData[depth].data) {
          metaData[depth].data = metaData[depth].tagStart === "array" ? [] : {};
        }
        depth++;
        metaData.push({ tagStart: "", tagEnd: "", tagContent: "", key: null, data: null });
        inTagStart = true;
        inTagContent = false;
      } else if (!inTagStart) {
        inTagStart = true;
      }
    } else if (c === ">") {
      if (metaData[depth].tagStart === "true/") {
        inTagStart = false;
        inTagEnd = true;
        metaData[depth].tagStart = "";
        metaData[depth].tagEnd = "/boolean";
        metaData[depth].data = true;
      }
      if (metaData[depth].tagStart === "false/") {
        inTagStart = false;
        inTagEnd = true;
        metaData[depth].tagStart = "";
        metaData[depth].tagEnd = "/boolean";
        metaData[depth].data = false;
      }
      if (metaData[depth].tagStart === "array/") {
        inTagStart = false;
        inTagEnd = true;
        metaData[depth].tagStart = "";
        metaData[depth].tagEnd = "/arrayEmpty";
        metaData[depth].data = [];
      }
      if (inTagContent) {
        inTagContent = false;
      }
      if (inTagStart) {
        inTagStart = false;
        inTagContent = true;
        if (metaData[depth].tagStart === "array") {
          metaData[depth].data = [];
        }
        if (metaData[depth].tagStart === "dict") {
          metaData[depth].data = {};
        }
      }
      if (inTagEnd) {
        inTagEnd = false;
        if (metaData[depth].tagEnd && tags.indexOf(metaData[depth].tagEnd.substr(1)) >= 0) {
          if (metaData[depth].tagEnd === "/dict" || metaData[depth].tagEnd === "/array") {
            if (depth > 1 && metaData[depth - 2].tagStart === "array") {
              metaData[depth - 2].data.push(metaData[depth - 1].data);
            }
            if (depth > 1 && metaData[depth - 2].tagStart === "dict") {
              metaData[depth - 2].data[metaData[depth - 1].key] = metaData[depth - 1].data;
            }
            depth--;
            metaData.pop();
            metaData[depth].tagContent = "";
            metaData[depth].tagStart = "";
            metaData[depth].tagEnd = "";
          } else {
            if (metaData[depth].tagEnd === "/key" && metaData[depth].tagContent) {
              metaData[depth].key = metaData[depth].tagContent;
            } else {
              if (metaData[depth].tagEnd === "/real" && metaData[depth].tagContent) {
                metaData[depth].data = parseFloat(metaData[depth].tagContent) || 0;
              }
              if (metaData[depth].tagEnd === "/integer" && metaData[depth].tagContent) {
                metaData[depth].data = parseInt(metaData[depth].tagContent) || 0;
              }
              if (metaData[depth].tagEnd === "/string" && metaData[depth].tagContent) {
                metaData[depth].data = metaData[depth].tagContent || "";
              }
              if (metaData[depth].tagEnd === "/boolean") {
                metaData[depth].data = metaData[depth].tagContent || false;
              }
              if (metaData[depth].tagEnd === "/arrayEmpty") {
                metaData[depth].data = metaData[depth].tagContent || [];
              }
              if (depth > 0 && metaData[depth - 1].tagStart === "array") {
                metaData[depth - 1].data.push(metaData[depth].data);
              }
              if (depth > 0 && metaData[depth - 1].tagStart === "dict") {
                metaData[depth - 1].data[metaData[depth].key] = metaData[depth].data;
              }
            }
            metaData[depth].tagContent = "";
            metaData[depth].tagStart = "";
            metaData[depth].tagEnd = "";
          }
        }
        metaData[depth].tagEnd = "";
        inTagStart = false;
        inTagContent = false;
      }
    } else {
      if (inTagStart) {
        metaData[depth].tagStart += c;
      }
      if (inTagEnd) {
        metaData[depth].tagEnd += c;
      }
      if (inTagContent) {
        metaData[depth].tagContent += c;
      }
    }
    pos++;
  }
  return metaData[0].data;
}
function strIsNumeric(str) {
  return typeof str === "string" && !isNaN(str) && !isNaN(parseFloat(str));
}
function plistReader(output) {
  const lines = output.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].indexOf(" = ") >= 0) {
      const lineParts = lines[i].split(" = ");
      lineParts[0] = lineParts[0].trim();
      if (!lineParts[0].startsWith('"')) {
        lineParts[0] = '"' + lineParts[0] + '"';
      }
      lineParts[1] = lineParts[1].trim();
      if (lineParts[1].indexOf('"') === -1 && lineParts[1].endsWith(";")) {
        const valueString = lineParts[1].substring(0, lineParts[1].length - 1);
        if (!strIsNumeric(valueString)) {
          lineParts[1] = `"${valueString}";`;
        }
      }
      if (lineParts[1].indexOf('"') >= 0 && lineParts[1].endsWith(";")) {
        const valueString = lineParts[1].substring(0, lineParts[1].length - 1).replace(/"/g, "");
        if (strIsNumeric(valueString)) {
          lineParts[1] = `${valueString};`;
        }
      }
      lines[i] = lineParts.join(" : ");
    }
    lines[i] = lines[i].replace(/\(/g, "[").replace(/\)/g, "]").replace(/;/g, ",").trim();
    if (lines[i].startsWith("}") && lines[i - 1] && lines[i - 1].endsWith(",")) {
      lines[i - 1] = lines[i - 1].substring(0, lines[i - 1].length - 1);
    }
  }
  output = lines.join("");
  let obj = {};
  try {
    obj = JSON.parse(output);
  } catch (e) {
  }
  return obj;
}
function semverCompare(v1, v2) {
  let res = 0;
  const parts1 = v1.split(".");
  const parts2 = v2.split(".");
  if (parts1[0] < parts2[0]) {
    res = 1;
  } else if (parts1[0] > parts2[0]) {
    res = -1;
  } else if (parts1[0] === parts2[0] && parts1.length >= 2 && parts2.length >= 2) {
    if (parts1[1] < parts2[1]) {
      res = 1;
    } else if (parts1[1] > parts2[1]) {
      res = -1;
    } else if (parts1[1] === parts2[1]) {
      if (parts1.length >= 3 && parts2.length >= 3) {
        if (parts1[2] < parts2[2]) {
          res = 1;
        } else if (parts1[2] > parts2[2]) {
          res = -1;
        }
      } else if (parts2.length >= 3) {
        res = 1;
      }
    }
  }
  return res;
}
function noop() {
}
util$j.toInt = toInt;
util$j.splitByNumber = splitByNumber;
util$j.execOptsWin = execOptsWin;
util$j.getCodepage = getCodepage;
util$j.execWin = execWin;
util$j.isFunction = isFunction;
util$j.unique = unique;
util$j.sortByKey = sortByKey;
util$j.cores = cores;
util$j.getValue = getValue;
util$j.decodeEscapeSequence = decodeEscapeSequence;
util$j.parseDateTime = parseDateTime;
util$j.parseHead = parseHead;
util$j.findObjectByKey = findObjectByKey;
util$j.getWmic = getWmic;
util$j.wmic = wmic;
util$j.darwinXcodeExists = darwinXcodeExists;
util$j.getVboxmanage = getVboxmanage;
util$j.powerShell = powerShell;
util$j.powerShellStart = powerShellStart;
util$j.powerShellRelease = powerShellRelease;
util$j.execSafe = execSafe;
util$j.nanoSeconds = nanoSeconds;
util$j.countUniqueLines = countUniqueLines;
util$j.countLines = countLines;
util$j.noop = noop;
util$j.isRaspberry = isRaspberry;
util$j.isRaspbian = isRaspbian;
util$j.sanitizeShellString = sanitizeShellString;
util$j.isPrototypePolluted = isPrototypePolluted;
util$j.decodePiCpuinfo = decodePiCpuinfo;
util$j.getRpiGpu = getRpiGpu;
util$j.promiseAll = promiseAll;
util$j.promisify = promisify;
util$j.promisifySave = promisifySave;
util$j.smartMonToolsInstalled = smartMonToolsInstalled;
util$j.linuxVersion = linuxVersion;
util$j.plistParser = plistParser;
util$j.plistReader = plistReader;
util$j.stringReplace = stringReplace;
util$j.stringToLower = stringToLower;
util$j.stringToString = stringToString;
util$j.stringSubstr = stringSubstr;
util$j.stringTrim = stringTrim;
util$j.stringStartWith = stringStartWith;
util$j.mathMin = mathMin;
util$j.WINDIR = WINDIR;
util$j.getFilesInPath = getFilesInPath;
util$j.semverCompare = semverCompare;
var system$1 = {};
const fs$b = require$$1$1;
const os$7 = require$$0$1;
const util$h = util$j;
const exec$f = require$$1.exec;
const execSync$a = require$$1.execSync;
const execPromise = util$h.promisify(require$$1.exec);
let _platform$g = process.platform;
const _linux$f = _platform$g === "linux" || _platform$g === "android";
const _darwin$f = _platform$g === "darwin";
const _windows$g = _platform$g === "win32";
const _freebsd$e = _platform$g === "freebsd";
const _openbsd$e = _platform$g === "openbsd";
const _netbsd$e = _platform$g === "netbsd";
const _sunos$e = _platform$g === "sunos";
function system(callback) {
  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = {
        manufacturer: "",
        model: "Computer",
        version: "",
        serial: "-",
        uuid: "-",
        sku: "-",
        virtual: false
      };
      if (_linux$f || _freebsd$e || _openbsd$e || _netbsd$e) {
        exec$f("export LC_ALL=C; dmidecode -t system 2>/dev/null; unset LC_ALL", function(error, stdout) {
          let lines = stdout.toString().split("\n");
          result.manufacturer = util$h.getValue(lines, "manufacturer");
          result.model = util$h.getValue(lines, "product name");
          result.version = util$h.getValue(lines, "version");
          result.serial = util$h.getValue(lines, "serial number");
          result.uuid = util$h.getValue(lines, "uuid").toLowerCase();
          result.sku = util$h.getValue(lines, "sku number");
          const cmd = `echo -n "product_name: "; cat /sys/devices/virtual/dmi/id/product_name 2>/dev/null; echo;
            echo -n "product_serial: "; cat /sys/devices/virtual/dmi/id/product_serial 2>/dev/null; echo;
            echo -n "product_uuid: "; cat /sys/devices/virtual/dmi/id/product_uuid 2>/dev/null; echo;
            echo -n "product_version: "; cat /sys/devices/virtual/dmi/id/product_version 2>/dev/null; echo;
            echo -n "sys_vendor: "; cat /sys/devices/virtual/dmi/id/sys_vendor 2>/dev/null; echo;`;
          try {
            lines = execSync$a(cmd).toString().split("\n");
            result.manufacturer = result.manufacturer === "" ? util$h.getValue(lines, "sys_vendor") : result.manufacturer;
            result.model = result.model === "" ? util$h.getValue(lines, "product_name") : result.model;
            result.version = result.version === "" ? util$h.getValue(lines, "product_version") : result.version;
            result.serial = result.serial === "" ? util$h.getValue(lines, "product_serial") : result.serial;
            result.uuid = result.uuid === "" ? util$h.getValue(lines, "product_uuid").toLowerCase() : result.uuid;
          } catch (e) {
            util$h.noop();
          }
          if (!result.serial || result.serial.toLowerCase().indexOf("o.e.m.") !== -1) {
            result.serial = "-";
          }
          if (!result.manufacturer || result.manufacturer.toLowerCase().indexOf("o.e.m.") !== -1) {
            result.manufacturer = "";
          }
          if (!result.model || result.model.toLowerCase().indexOf("o.e.m.") !== -1) {
            result.model = "Computer";
          }
          if (!result.version || result.version.toLowerCase().indexOf("o.e.m.") !== -1) {
            result.version = "";
          }
          if (!result.sku || result.sku.toLowerCase().indexOf("o.e.m.") !== -1) {
            result.sku = "-";
          }
          if (result.model.toLowerCase() === "virtualbox" || result.model.toLowerCase() === "kvm" || result.model.toLowerCase() === "virtual machine" || result.model.toLowerCase() === "bochs" || result.model.toLowerCase().startsWith("vmware") || result.model.toLowerCase().startsWith("droplet")) {
            result.virtual = true;
            switch (result.model.toLowerCase()) {
              case "virtualbox":
                result.virtualHost = "VirtualBox";
                break;
              case "vmware":
                result.virtualHost = "VMware";
                break;
              case "kvm":
                result.virtualHost = "KVM";
                break;
              case "bochs":
                result.virtualHost = "bochs";
                break;
            }
          }
          if (result.manufacturer.toLowerCase().startsWith("vmware") || result.manufacturer.toLowerCase() === "xen") {
            result.virtual = true;
            switch (result.manufacturer.toLowerCase()) {
              case "vmware":
                result.virtualHost = "VMware";
                break;
              case "xen":
                result.virtualHost = "Xen";
                break;
            }
          }
          if (!result.virtual) {
            try {
              const disksById = execSync$a("ls -1 /dev/disk/by-id/ 2>/dev/null").toString();
              if (disksById.indexOf("_QEMU_") >= 0) {
                result.virtual = true;
                result.virtualHost = "QEMU";
              }
              if (disksById.indexOf("_VBOX_") >= 0) {
                result.virtual = true;
                result.virtualHost = "VirtualBox";
              }
            } catch (e) {
              util$h.noop();
            }
          }
          if (!result.virtual && (os$7.release().toLowerCase().indexOf("microsoft") >= 0 || os$7.release().toLowerCase().endsWith("wsl2"))) {
            const kernelVersion = parseFloat(os$7.release().toLowerCase());
            result.virtual = true;
            result.manufacturer = "Microsoft";
            result.model = "WSL";
            result.version = kernelVersion < 4.19 ? "1" : "2";
          }
          if ((_freebsd$e || _openbsd$e || _netbsd$e) && !result.virtualHost) {
            try {
              const procInfo = execSync$a("dmidecode -t 4");
              const procLines = procInfo.toString().split("\n");
              const procManufacturer = util$h.getValue(procLines, "manufacturer", ":", true);
              switch (procManufacturer.toLowerCase()) {
                case "virtualbox":
                  result.virtualHost = "VirtualBox";
                  break;
                case "vmware":
                  result.virtualHost = "VMware";
                  break;
                case "kvm":
                  result.virtualHost = "KVM";
                  break;
                case "bochs":
                  result.virtualHost = "bochs";
                  break;
              }
            } catch (e) {
              util$h.noop();
            }
          }
          if (fs$b.existsSync("/.dockerenv") || fs$b.existsSync("/.dockerinit")) {
            result.model = "Docker Container";
          }
          try {
            const stdout2 = execSync$a('dmesg 2>/dev/null | grep -iE "virtual|hypervisor" | grep -iE "vmware|qemu|kvm|xen" | grep -viE "Nested Virtualization|/virtual/"');
            let lines2 = stdout2.toString().split("\n");
            if (lines2.length > 0) {
              if (result.model === "Computer") {
                result.model = "Virtual machine";
              }
              result.virtual = true;
              if (stdout2.toString().toLowerCase().indexOf("vmware") >= 0 && !result.virtualHost) {
                result.virtualHost = "VMware";
              }
              if (stdout2.toString().toLowerCase().indexOf("qemu") >= 0 && !result.virtualHost) {
                result.virtualHost = "QEMU";
              }
              if (stdout2.toString().toLowerCase().indexOf("xen") >= 0 && !result.virtualHost) {
                result.virtualHost = "Xen";
              }
              if (stdout2.toString().toLowerCase().indexOf("kvm") >= 0 && !result.virtualHost) {
                result.virtualHost = "KVM";
              }
            }
          } catch (e) {
            util$h.noop();
          }
          if (result.manufacturer === "" && result.model === "Computer" && result.version === "") {
            fs$b.readFile("/proc/cpuinfo", function(error2, stdout2) {
              if (!error2) {
                let lines2 = stdout2.toString().split("\n");
                result.model = util$h.getValue(lines2, "hardware", ":", true).toUpperCase();
                result.version = util$h.getValue(lines2, "revision", ":", true).toLowerCase();
                result.serial = util$h.getValue(lines2, "serial", ":", true);
                const model = util$h.getValue(lines2, "model:", ":", true);
                if ((result.model === "BCM2835" || result.model === "BCM2708" || result.model === "BCM2709" || result.model === "BCM2710" || result.model === "BCM2711" || result.model === "BCM2836" || result.model === "BCM2837") && model.toLowerCase().indexOf("raspberry") >= 0) {
                  const rPIRevision = util$h.decodePiCpuinfo(lines2);
                  result.model = rPIRevision.model;
                  result.version = rPIRevision.revisionCode;
                  result.manufacturer = "Raspberry Pi Foundation";
                  result.raspberry = {
                    manufacturer: rPIRevision.manufacturer,
                    processor: rPIRevision.processor,
                    type: rPIRevision.type,
                    revision: rPIRevision.revision
                  };
                }
              }
              if (callback) {
                callback(result);
              }
              resolve(result);
            });
          } else {
            if (callback) {
              callback(result);
            }
            resolve(result);
          }
        });
      }
      if (_darwin$f) {
        exec$f("ioreg -c IOPlatformExpertDevice -d 2", function(error, stdout) {
          if (!error) {
            let lines = stdout.toString().replace(/[<>"]/g, "").split("\n");
            const model = util$h.splitByNumber(util$h.getValue(lines, "model", "=", true));
            const version2 = util$h.getValue(lines, "version", "=", true);
            result.manufacturer = util$h.getValue(lines, "manufacturer", "=", true);
            result.model = version2 ? util$h.getValue(lines, "model", "=", true) : model[0];
            result.version = version2 || model[1];
            result.serial = util$h.getValue(lines, "ioplatformserialnumber", "=", true);
            result.uuid = util$h.getValue(lines, "ioplatformuuid", "=", true).toLowerCase();
            result.sku = util$h.getValue(lines, "board-id", "=", true) || util$h.getValue(lines, "target-sub-type", "=", true);
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_sunos$e) {
        if (callback) {
          callback(result);
        }
        resolve(result);
      }
      if (_windows$g) {
        try {
          util$h.powerShell("Get-CimInstance Win32_ComputerSystemProduct | select Name,Vendor,Version,IdentifyingNumber,UUID | fl").then((stdout, error) => {
            if (!error) {
              let lines = stdout.split("\r\n");
              result.manufacturer = util$h.getValue(lines, "vendor", ":");
              result.model = util$h.getValue(lines, "name", ":");
              result.version = util$h.getValue(lines, "version", ":");
              result.serial = util$h.getValue(lines, "identifyingnumber", ":");
              result.uuid = util$h.getValue(lines, "uuid", ":").toLowerCase();
              const model = result.model.toLowerCase();
              if (model === "virtualbox" || model === "kvm" || model === "virtual machine" || model === "bochs" || model.startsWith("vmware") || model.startsWith("qemu") || model.startsWith("parallels")) {
                result.virtual = true;
                if (model.startsWith("virtualbox")) {
                  result.virtualHost = "VirtualBox";
                }
                if (model.startsWith("vmware")) {
                  result.virtualHost = "VMware";
                }
                if (model.startsWith("kvm")) {
                  result.virtualHost = "KVM";
                }
                if (model.startsWith("bochs")) {
                  result.virtualHost = "bochs";
                }
                if (model.startsWith("qemu")) {
                  result.virtualHost = "KVM";
                }
                if (model.startsWith("parallels")) {
                  result.virtualHost = "Parallels";
                }
              }
              const manufacturer = result.manufacturer.toLowerCase();
              if (manufacturer.startsWith("vmware") || manufacturer.startsWith("qemu") || manufacturer === "xen" || manufacturer.startsWith("parallels")) {
                result.virtual = true;
                if (manufacturer.startsWith("vmware")) {
                  result.virtualHost = "VMware";
                }
                if (manufacturer.startsWith("xen")) {
                  result.virtualHost = "Xen";
                }
                if (manufacturer.startsWith("qemu")) {
                  result.virtualHost = "KVM";
                }
                if (manufacturer.startsWith("parallels")) {
                  result.virtualHost = "Parallels";
                }
              }
              util$h.powerShell('Get-CimInstance MS_Systeminformation -Namespace "root/wmi" | select systemsku | fl ').then((stdout2, error2) => {
                if (!error2) {
                  let lines2 = stdout2.split("\r\n");
                  result.sku = util$h.getValue(lines2, "systemsku", ":");
                }
                if (!result.virtual) {
                  util$h.powerShell("Get-CimInstance Win32_bios | select Version, SerialNumber, SMBIOSBIOSVersion").then((stdout3, error3) => {
                    if (!error3) {
                      let lines2 = stdout3.toString();
                      if (lines2.indexOf("VRTUAL") >= 0 || lines2.indexOf("A M I ") >= 0 || lines2.indexOf("VirtualBox") >= 0 || lines2.indexOf("VMWare") >= 0 || lines2.indexOf("Xen") >= 0 || lines2.indexOf("Parallels") >= 0) {
                        result.virtual = true;
                        if (lines2.indexOf("VirtualBox") >= 0 && !result.virtualHost) {
                          result.virtualHost = "VirtualBox";
                        }
                        if (lines2.indexOf("VMware") >= 0 && !result.virtualHost) {
                          result.virtualHost = "VMware";
                        }
                        if (lines2.indexOf("Xen") >= 0 && !result.virtualHost) {
                          result.virtualHost = "Xen";
                        }
                        if (lines2.indexOf("VRTUAL") >= 0 && !result.virtualHost) {
                          result.virtualHost = "Hyper-V";
                        }
                        if (lines2.indexOf("A M I") >= 0 && !result.virtualHost) {
                          result.virtualHost = "Virtual PC";
                        }
                        if (lines2.indexOf("Parallels") >= 0 && !result.virtualHost) {
                          result.virtualHost = "Parallels";
                        }
                      }
                      if (callback) {
                        callback(result);
                      }
                      resolve(result);
                    } else {
                      if (callback) {
                        callback(result);
                      }
                      resolve(result);
                    }
                  });
                } else {
                  if (callback) {
                    callback(result);
                  }
                  resolve(result);
                }
              });
            } else {
              if (callback) {
                callback(result);
              }
              resolve(result);
            }
          });
        } catch (e) {
          if (callback) {
            callback(result);
          }
          resolve(result);
        }
      }
    });
  });
}
system$1.system = system;
function cleanDefaults(s) {
  const cmpStr = s.toLowerCase();
  if (cmpStr.indexOf("o.e.m.") === -1 && cmpStr.indexOf("default string") === -1 && cmpStr !== "default") {
    return s || "";
  }
  return "";
}
function bios(callback) {
  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = {
        vendor: "",
        version: "",
        releaseDate: "",
        revision: ""
      };
      let cmd = "";
      if (_linux$f || _freebsd$e || _openbsd$e || _netbsd$e) {
        if (process.arch === "arm") {
          cmd = "cat /proc/cpuinfo | grep Serial";
        } else {
          cmd = "export LC_ALL=C; dmidecode -t bios 2>/dev/null; unset LC_ALL";
        }
        exec$f(cmd, function(error, stdout) {
          let lines = stdout.toString().split("\n");
          result.vendor = util$h.getValue(lines, "Vendor");
          result.version = util$h.getValue(lines, "Version");
          let datetime = util$h.getValue(lines, "Release Date");
          result.releaseDate = util$h.parseDateTime(datetime).date;
          result.revision = util$h.getValue(lines, "BIOS Revision");
          result.serial = util$h.getValue(lines, "SerialNumber");
          let language = util$h.getValue(lines, "Currently Installed Language").split("|")[0];
          if (language) {
            result.language = language;
          }
          if (lines.length && stdout.toString().indexOf("Characteristics:") >= 0) {
            const features = [];
            lines.forEach((line) => {
              if (line.indexOf(" is supported") >= 0) {
                const feature = line.split(" is supported")[0].trim();
                features.push(feature);
              }
            });
            result.features = features;
          }
          const cmd2 = `echo -n "bios_date: "; cat /sys/devices/virtual/dmi/id/bios_date 2>/dev/null; echo;
            echo -n "bios_vendor: "; cat /sys/devices/virtual/dmi/id/bios_vendor 2>/dev/null; echo;
            echo -n "bios_version: "; cat /sys/devices/virtual/dmi/id/bios_version 2>/dev/null; echo;`;
          try {
            lines = execSync$a(cmd2).toString().split("\n");
            result.vendor = !result.vendor ? util$h.getValue(lines, "bios_vendor") : result.vendor;
            result.version = !result.version ? util$h.getValue(lines, "bios_version") : result.version;
            datetime = util$h.getValue(lines, "bios_date");
            result.releaseDate = !result.releaseDate ? util$h.parseDateTime(datetime).date : result.releaseDate;
          } catch (e) {
            util$h.noop();
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_darwin$f) {
        result.vendor = "Apple Inc.";
        exec$f(
          "system_profiler SPHardwareDataType -json",
          function(error, stdout) {
            try {
              const hardwareData = JSON.parse(stdout.toString());
              if (hardwareData && hardwareData.SPHardwareDataType && hardwareData.SPHardwareDataType.length) {
                let bootRomVersion = hardwareData.SPHardwareDataType[0].boot_rom_version;
                bootRomVersion = bootRomVersion ? bootRomVersion.split("(")[0].trim() : null;
                result.version = bootRomVersion;
              }
            } catch (e) {
              util$h.noop();
            }
            if (callback) {
              callback(result);
            }
            resolve(result);
          }
        );
      }
      if (_sunos$e) {
        result.vendor = "Sun Microsystems";
        if (callback) {
          callback(result);
        }
        resolve(result);
      }
      if (_windows$g) {
        try {
          util$h.powerShell('Get-CimInstance Win32_bios | select Description,Version,Manufacturer,@{n="ReleaseDate";e={$_.ReleaseDate.ToString("yyyy-MM-dd")}},BuildNumber,SerialNumber,SMBIOSBIOSVersion | fl').then((stdout, error) => {
            if (!error) {
              let lines = stdout.toString().split("\r\n");
              const description2 = util$h.getValue(lines, "description", ":");
              const version2 = util$h.getValue(lines, "SMBIOSBIOSVersion", ":");
              if (description2.indexOf(" Version ") !== -1) {
                result.vendor = description2.split(" Version ")[0].trim();
                result.version = description2.split(" Version ")[1].trim();
              } else if (description2.indexOf(" Ver: ") !== -1) {
                result.vendor = util$h.getValue(lines, "manufacturer", ":");
                result.version = description2.split(" Ver: ")[1].trim();
              } else {
                result.vendor = util$h.getValue(lines, "manufacturer", ":");
                result.version = version2 || util$h.getValue(lines, "version", ":");
              }
              result.releaseDate = util$h.getValue(lines, "releasedate", ":");
              result.revision = util$h.getValue(lines, "buildnumber", ":");
              result.serial = cleanDefaults(util$h.getValue(lines, "serialnumber", ":"));
            }
            if (callback) {
              callback(result);
            }
            resolve(result);
          });
        } catch (e) {
          if (callback) {
            callback(result);
          }
          resolve(result);
        }
      }
    });
  });
}
system$1.bios = bios;
function baseboard(callback) {
  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = {
        manufacturer: "",
        model: "",
        version: "",
        serial: "-",
        assetTag: "-",
        memMax: null,
        memSlots: null
      };
      let cmd = "";
      if (_linux$f || _freebsd$e || _openbsd$e || _netbsd$e) {
        if (process.arch === "arm") {
          cmd = "cat /proc/cpuinfo | grep Serial";
        } else {
          cmd = "export LC_ALL=C; dmidecode -t 2 2>/dev/null; unset LC_ALL";
        }
        const workload = [];
        workload.push(execPromise(cmd));
        workload.push(execPromise("export LC_ALL=C; dmidecode -t memory 2>/dev/null"));
        util$h.promiseAll(
          workload
        ).then((data) => {
          let lines = data.results[0] ? data.results[0].toString().split("\n") : [""];
          result.manufacturer = util$h.getValue(lines, "Manufacturer");
          result.model = util$h.getValue(lines, "Product Name");
          result.version = util$h.getValue(lines, "Version");
          result.serial = util$h.getValue(lines, "Serial Number");
          result.assetTag = util$h.getValue(lines, "Asset Tag");
          const cmd2 = `echo -n "board_asset_tag: "; cat /sys/devices/virtual/dmi/id/board_asset_tag 2>/dev/null; echo;
            echo -n "board_name: "; cat /sys/devices/virtual/dmi/id/board_name 2>/dev/null; echo;
            echo -n "board_serial: "; cat /sys/devices/virtual/dmi/id/board_serial 2>/dev/null; echo;
            echo -n "board_vendor: "; cat /sys/devices/virtual/dmi/id/board_vendor 2>/dev/null; echo;
            echo -n "board_version: "; cat /sys/devices/virtual/dmi/id/board_version 2>/dev/null; echo;`;
          try {
            lines = execSync$a(cmd2).toString().split("\n");
            result.manufacturer = !result.manufacturer ? util$h.getValue(lines, "board_vendor") : result.manufacturer;
            result.model = !result.model ? util$h.getValue(lines, "board_name") : result.model;
            result.version = !result.version ? util$h.getValue(lines, "board_version") : result.version;
            result.serial = !result.serial ? util$h.getValue(lines, "board_serial") : result.serial;
            result.assetTag = !result.assetTag ? util$h.getValue(lines, "board_asset_tag") : result.assetTag;
          } catch (e) {
            util$h.noop();
          }
          if (result.serial.toLowerCase().indexOf("o.e.m.") !== -1) {
            result.serial = "-";
          }
          if (result.assetTag.toLowerCase().indexOf("o.e.m.") !== -1) {
            result.assetTag = "-";
          }
          lines = data.results[1] ? data.results[1].toString().split("\n") : [""];
          result.memMax = util$h.toInt(util$h.getValue(lines, "Maximum Capacity")) * 1024 * 1024 * 1024 || null;
          result.memSlots = util$h.toInt(util$h.getValue(lines, "Number Of Devices")) || null;
          let linesRpi = "";
          try {
            linesRpi = fs$b.readFileSync("/proc/cpuinfo").toString().split("\n");
          } catch (e) {
            util$h.noop();
          }
          if (linesRpi) {
            const hardware = util$h.getValue(linesRpi, "hardware");
            if (hardware.startsWith("BCM")) {
              const rpi = util$h.decodePiCpuinfo(linesRpi);
              result.manufacturer = rpi.manufacturer;
              result.model = "Raspberry Pi";
              result.serial = rpi.serial;
              result.version = rpi.type + " - " + rpi.revision;
              result.memMax = os$7.totalmem();
              result.memSlots = 0;
            }
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_darwin$f) {
        const workload = [];
        workload.push(execPromise("ioreg -c IOPlatformExpertDevice -d 2"));
        workload.push(execPromise("system_profiler SPMemoryDataType"));
        util$h.promiseAll(
          workload
        ).then((data) => {
          let lines = data.results[0] ? data.results[0].toString().replace(/[<>"]/g, "").split("\n") : [""];
          result.manufacturer = util$h.getValue(lines, "manufacturer", "=", true);
          result.model = util$h.getValue(lines, "model", "=", true);
          result.version = util$h.getValue(lines, "version", "=", true);
          result.serial = util$h.getValue(lines, "ioplatformserialnumber", "=", true);
          result.assetTag = util$h.getValue(lines, "board-id", "=", true);
          let devices = data.results[1] ? data.results[1].toString().split("        BANK ") : [""];
          if (devices.length === 1) {
            devices = data.results[1] ? data.results[1].toString().split("        DIMM") : [""];
          }
          devices.shift();
          result.memSlots = devices.length;
          if (os$7.arch() === "arm64") {
            result.memSlots = 0;
            result.memMax = os$7.totalmem();
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_sunos$e) {
        if (callback) {
          callback(result);
        }
        resolve(result);
      }
      if (_windows$g) {
        try {
          const workload = [];
          const win10plus = parseInt(os$7.release()) >= 10;
          const maxCapacityAttribute = win10plus ? "MaxCapacityEx" : "MaxCapacity";
          workload.push(util$h.powerShell("Get-CimInstance Win32_baseboard | select Model,Manufacturer,Product,Version,SerialNumber,PartNumber,SKU | fl"));
          workload.push(util$h.powerShell(`Get-CimInstance Win32_physicalmemoryarray | select ${maxCapacityAttribute}, MemoryDevices | fl`));
          util$h.promiseAll(
            workload
          ).then((data) => {
            let lines = data.results[0] ? data.results[0].toString().split("\r\n") : [""];
            result.manufacturer = cleanDefaults(util$h.getValue(lines, "manufacturer", ":"));
            result.model = cleanDefaults(util$h.getValue(lines, "model", ":"));
            if (!result.model) {
              result.model = cleanDefaults(util$h.getValue(lines, "product", ":"));
            }
            result.version = cleanDefaults(util$h.getValue(lines, "version", ":"));
            result.serial = cleanDefaults(util$h.getValue(lines, "serialnumber", ":"));
            result.assetTag = cleanDefaults(util$h.getValue(lines, "partnumber", ":"));
            if (!result.assetTag) {
              result.assetTag = cleanDefaults(util$h.getValue(lines, "sku", ":"));
            }
            lines = data.results[1] ? data.results[1].toString().split("\r\n") : [""];
            result.memMax = util$h.toInt(util$h.getValue(lines, maxCapacityAttribute, ":")) * (win10plus ? 1024 : 1) || null;
            result.memSlots = util$h.toInt(util$h.getValue(lines, "MemoryDevices", ":")) || null;
            if (callback) {
              callback(result);
            }
            resolve(result);
          });
        } catch (e) {
          if (callback) {
            callback(result);
          }
          resolve(result);
        }
      }
    });
  });
}
system$1.baseboard = baseboard;
function macOsChassisType(model) {
  model = model.toLowerCase();
  if (model.startsWith("macbookair")) {
    return "Notebook";
  }
  if (model.startsWith("macbookpro")) {
    return "Laptop";
  }
  if (model.startsWith("macbook")) {
    return "Notebook";
  }
  if (model.startsWith("macmini")) {
    return "Desktop";
  }
  if (model.startsWith("imac")) {
    return "Desktop";
  }
  if (model.startsWith("macstudio")) {
    return "Desktop";
  }
  if (model.startsWith("macpro")) {
    return "Tower";
  }
  return "Other";
}
function chassis(callback) {
  const chassisTypes = [
    "Other",
    "Unknown",
    "Desktop",
    "Low Profile Desktop",
    "Pizza Box",
    "Mini Tower",
    "Tower",
    "Portable",
    "Laptop",
    "Notebook",
    "Hand Held",
    "Docking Station",
    "All in One",
    "Sub Notebook",
    "Space-Saving",
    "Lunch Box",
    "Main System Chassis",
    "Expansion Chassis",
    "SubChassis",
    "Bus Expansion Chassis",
    "Peripheral Chassis",
    "Storage Chassis",
    "Rack Mount Chassis",
    "Sealed-Case PC",
    "Multi-System Chassis",
    "Compact PCI",
    "Advanced TCA",
    "Blade",
    "Blade Enclosure",
    "Tablet",
    "Convertible",
    "Detachable",
    "IoT Gateway ",
    "Embedded PC",
    "Mini PC",
    "Stick PC"
  ];
  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = {
        manufacturer: "",
        model: "",
        type: "",
        version: "",
        serial: "-",
        assetTag: "-",
        sku: ""
      };
      if (_linux$f || _freebsd$e || _openbsd$e || _netbsd$e) {
        const cmd = `echo -n "chassis_asset_tag: "; cat /sys/devices/virtual/dmi/id/chassis_asset_tag 2>/dev/null; echo;
            echo -n "chassis_serial: "; cat /sys/devices/virtual/dmi/id/chassis_serial 2>/dev/null; echo;
            echo -n "chassis_type: "; cat /sys/devices/virtual/dmi/id/chassis_type 2>/dev/null; echo;
            echo -n "chassis_vendor: "; cat /sys/devices/virtual/dmi/id/chassis_vendor 2>/dev/null; echo;
            echo -n "chassis_version: "; cat /sys/devices/virtual/dmi/id/chassis_version 2>/dev/null; echo;`;
        exec$f(cmd, function(error, stdout) {
          let lines = stdout.toString().split("\n");
          result.manufacturer = util$h.getValue(lines, "chassis_vendor");
          const ctype = parseInt(util$h.getValue(lines, "chassis_type").replace(/\D/g, ""));
          result.type = ctype && !isNaN(ctype) && ctype < chassisTypes.length ? chassisTypes[ctype - 1] : "";
          result.version = util$h.getValue(lines, "chassis_version");
          result.serial = util$h.getValue(lines, "chassis_serial");
          result.assetTag = util$h.getValue(lines, "chassis_asset_tag");
          if (result.manufacturer.toLowerCase().indexOf("o.e.m.") !== -1) {
            result.manufacturer = "-";
          }
          if (result.version.toLowerCase().indexOf("o.e.m.") !== -1) {
            result.version = "-";
          }
          if (result.serial.toLowerCase().indexOf("o.e.m.") !== -1) {
            result.serial = "-";
          }
          if (result.assetTag.toLowerCase().indexOf("o.e.m.") !== -1) {
            result.assetTag = "-";
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_darwin$f) {
        exec$f("ioreg -c IOPlatformExpertDevice -d 2", function(error, stdout) {
          if (!error) {
            let lines = stdout.toString().replace(/[<>"]/g, "").split("\n");
            const model = util$h.getValue(lines, "model", "=", true);
            const modelParts = util$h.splitByNumber(model);
            const version2 = util$h.getValue(lines, "version", "=", true);
            result.manufacturer = util$h.getValue(lines, "manufacturer", "=", true);
            result.model = version2 ? util$h.getValue(lines, "model", "=", true) : modelParts[0];
            result.type = macOsChassisType(result.model);
            result.version = version2 || model;
            result.serial = util$h.getValue(lines, "ioplatformserialnumber", "=", true);
            result.assetTag = util$h.getValue(lines, "board-id", "=", true) || util$h.getValue(lines, "target-type", "=", true);
            result.sku = util$h.getValue(lines, "target-sub-type", "=", true);
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_sunos$e) {
        if (callback) {
          callback(result);
        }
        resolve(result);
      }
      if (_windows$g) {
        try {
          util$h.powerShell("Get-CimInstance Win32_SystemEnclosure | select Model,Manufacturer,ChassisTypes,Version,SerialNumber,PartNumber,SKU,SMBIOSAssetTag | fl").then((stdout, error) => {
            if (!error) {
              let lines = stdout.toString().split("\r\n");
              result.manufacturer = cleanDefaults(util$h.getValue(lines, "manufacturer", ":"));
              result.model = cleanDefaults(util$h.getValue(lines, "model", ":"));
              const ctype = parseInt(util$h.getValue(lines, "ChassisTypes", ":").replace(/\D/g, ""));
              result.type = ctype && !isNaN(ctype) && ctype < chassisTypes.length ? chassisTypes[ctype - 1] : "";
              result.version = cleanDefaults(util$h.getValue(lines, "version", ":"));
              result.serial = cleanDefaults(util$h.getValue(lines, "serialnumber", ":"));
              result.assetTag = cleanDefaults(util$h.getValue(lines, "partnumber", ":"));
              if (!result.assetTag) {
                result.assetTag = cleanDefaults(util$h.getValue(lines, "SMBIOSAssetTag", ":"));
              }
              result.sku = cleanDefaults(util$h.getValue(lines, "sku", ":"));
            }
            if (callback) {
              callback(result);
            }
            resolve(result);
          });
        } catch (e) {
          if (callback) {
            callback(result);
          }
          resolve(result);
        }
      }
    });
  });
}
system$1.chassis = chassis;
var osinfo = {};
const os$6 = require$$0$1;
const fs$a = require$$1$1;
const util$g = util$j;
const exec$e = require$$1.exec;
const execSync$9 = require$$1.execSync;
let _platform$f = process.platform;
const _linux$e = _platform$f === "linux" || _platform$f === "android";
const _darwin$e = _platform$f === "darwin";
const _windows$f = _platform$f === "win32";
const _freebsd$d = _platform$f === "freebsd";
const _openbsd$d = _platform$f === "openbsd";
const _netbsd$d = _platform$f === "netbsd";
const _sunos$d = _platform$f === "sunos";
function time() {
  let t = (/* @__PURE__ */ new Date()).toString().split(" ");
  return {
    current: Date.now(),
    uptime: os$6.uptime(),
    timezone: t.length >= 7 ? t[5] : "",
    timezoneName: Intl ? Intl.DateTimeFormat().resolvedOptions().timeZone : t.length >= 7 ? t.slice(6).join(" ").replace(/\(/g, "").replace(/\)/g, "") : ""
  };
}
osinfo.time = time;
function getLogoFile(distro) {
  distro = distro || "";
  distro = distro.toLowerCase();
  let result = _platform$f;
  if (_windows$f) {
    result = "windows";
  } else if (distro.indexOf("mac os") !== -1) {
    result = "apple";
  } else if (distro.indexOf("arch") !== -1) {
    result = "arch";
  } else if (distro.indexOf("centos") !== -1) {
    result = "centos";
  } else if (distro.indexOf("coreos") !== -1) {
    result = "coreos";
  } else if (distro.indexOf("debian") !== -1) {
    result = "debian";
  } else if (distro.indexOf("deepin") !== -1) {
    result = "deepin";
  } else if (distro.indexOf("elementary") !== -1) {
    result = "elementary";
  } else if (distro.indexOf("fedora") !== -1) {
    result = "fedora";
  } else if (distro.indexOf("gentoo") !== -1) {
    result = "gentoo";
  } else if (distro.indexOf("mageia") !== -1) {
    result = "mageia";
  } else if (distro.indexOf("mandriva") !== -1) {
    result = "mandriva";
  } else if (distro.indexOf("manjaro") !== -1) {
    result = "manjaro";
  } else if (distro.indexOf("mint") !== -1) {
    result = "mint";
  } else if (distro.indexOf("mx") !== -1) {
    result = "mx";
  } else if (distro.indexOf("openbsd") !== -1) {
    result = "openbsd";
  } else if (distro.indexOf("freebsd") !== -1) {
    result = "freebsd";
  } else if (distro.indexOf("opensuse") !== -1) {
    result = "opensuse";
  } else if (distro.indexOf("pclinuxos") !== -1) {
    result = "pclinuxos";
  } else if (distro.indexOf("puppy") !== -1) {
    result = "puppy";
  } else if (distro.indexOf("raspbian") !== -1) {
    result = "raspbian";
  } else if (distro.indexOf("reactos") !== -1) {
    result = "reactos";
  } else if (distro.indexOf("redhat") !== -1) {
    result = "redhat";
  } else if (distro.indexOf("slackware") !== -1) {
    result = "slackware";
  } else if (distro.indexOf("sugar") !== -1) {
    result = "sugar";
  } else if (distro.indexOf("steam") !== -1) {
    result = "steam";
  } else if (distro.indexOf("suse") !== -1) {
    result = "suse";
  } else if (distro.indexOf("mate") !== -1) {
    result = "ubuntu-mate";
  } else if (distro.indexOf("lubuntu") !== -1) {
    result = "lubuntu";
  } else if (distro.indexOf("xubuntu") !== -1) {
    result = "xubuntu";
  } else if (distro.indexOf("ubuntu") !== -1) {
    result = "ubuntu";
  } else if (distro.indexOf("solaris") !== -1) {
    result = "solaris";
  } else if (distro.indexOf("tails") !== -1) {
    result = "tails";
  } else if (distro.indexOf("feren") !== -1) {
    result = "ferenos";
  } else if (distro.indexOf("robolinux") !== -1) {
    result = "robolinux";
  } else if (_linux$e && distro) {
    result = distro.toLowerCase().trim().replace(/\s+/g, "-");
  }
  return result;
}
function getFQDN() {
  let fqdn = os$6.hostname;
  if (_linux$e || _darwin$e) {
    try {
      const stdout = execSync$9("hostnamectl --json short 2>/dev/null");
      const json = JSON.parse(stdout.toString());
      fqdn = json["StaticHostname"];
    } catch (e) {
      try {
        const stdout = execSync$9("hostname -f 2>/dev/null");
        fqdn = stdout.toString().split(os$6.EOL)[0];
      } catch (e2) {
        util$g.noop();
      }
    }
  }
  if (_freebsd$d || _openbsd$d || _netbsd$d) {
    try {
      const stdout = execSync$9("hostname 2>/dev/null");
      fqdn = stdout.toString().split(os$6.EOL)[0];
    } catch (e) {
      util$g.noop();
    }
  }
  if (_windows$f) {
    try {
      const stdout = execSync$9("echo %COMPUTERNAME%.%USERDNSDOMAIN%", util$g.execOptsWin);
      fqdn = stdout.toString().replace(".%USERDNSDOMAIN%", "").split(os$6.EOL)[0];
    } catch (e) {
      util$g.noop();
    }
  }
  return fqdn;
}
function osInfo(callback) {
  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = {
        platform: _platform$f === "win32" ? "Windows" : _platform$f,
        distro: "unknown",
        release: "unknown",
        codename: "",
        kernel: os$6.release(),
        arch: os$6.arch(),
        hostname: os$6.hostname(),
        fqdn: getFQDN(),
        codepage: "",
        logofile: "",
        serial: "",
        build: "",
        servicepack: "",
        uefi: false
      };
      if (_linux$e) {
        exec$e("cat /etc/*-release; cat /usr/lib/os-release; cat /etc/openwrt_release", function(error, stdout) {
          let release = {};
          let lines = stdout.toString().split("\n");
          lines.forEach(function(line) {
            if (line.indexOf("=") !== -1) {
              release[line.split("=")[0].trim().toUpperCase()] = line.split("=")[1].trim();
            }
          });
          result.distro = (release.DISTRIB_ID || release.NAME || "unknown").replace(/"/g, "");
          result.logofile = getLogoFile(result.distro);
          let releaseVersion = (release.VERSION || "").replace(/"/g, "");
          let codename = (release.DISTRIB_CODENAME || release.VERSION_CODENAME || "").replace(/"/g, "");
          const prettyName = (release.PRETTY_NAME || "").replace(/"/g, "");
          if (prettyName.indexOf(result.distro + " ") === 0) {
            releaseVersion = prettyName.replace(result.distro + " ", "").trim();
          }
          if (releaseVersion.indexOf("(") >= 0) {
            codename = releaseVersion.split("(")[1].replace(/[()]/g, "").trim();
            releaseVersion = releaseVersion.split("(")[0].trim();
          }
          result.release = (releaseVersion || release.DISTRIB_RELEASE || release.VERSION_ID || "unknown").replace(/"/g, "");
          result.codename = codename;
          result.codepage = util$g.getCodepage();
          result.build = (release.BUILD_ID || "").replace(/"/g, "").trim();
          isUefiLinux().then((uefi) => {
            result.uefi = uefi;
            uuid().then((data) => {
              result.serial = data.os;
              if (callback) {
                callback(result);
              }
              resolve(result);
            });
          });
        });
      }
      if (_freebsd$d || _openbsd$d || _netbsd$d) {
        exec$e("sysctl kern.ostype kern.osrelease kern.osrevision kern.hostuuid machdep.bootmethod kern.geom.confxml", function(error, stdout) {
          let lines = stdout.toString().split("\n");
          const distro = util$g.getValue(lines, "kern.ostype");
          const logofile = getLogoFile(distro);
          const release = util$g.getValue(lines, "kern.osrelease").split("-")[0];
          const serial = util$g.getValue(lines, "kern.uuid");
          const bootmethod = util$g.getValue(lines, "machdep.bootmethod");
          const uefiConf = stdout.toString().indexOf("<type>efi</type>") >= 0;
          const uefi = bootmethod ? bootmethod.toLowerCase().indexOf("uefi") >= 0 : uefiConf ? uefiConf : null;
          result.distro = distro || result.distro;
          result.logofile = logofile || result.logofile;
          result.release = release || result.release;
          result.serial = serial || result.serial;
          result.codename = "";
          result.codepage = util$g.getCodepage();
          result.uefi = uefi || null;
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_darwin$e) {
        exec$e("sw_vers; sysctl kern.ostype kern.osrelease kern.osrevision kern.uuid", function(error, stdout) {
          let lines = stdout.toString().split("\n");
          result.serial = util$g.getValue(lines, "kern.uuid");
          result.distro = util$g.getValue(lines, "ProductName");
          result.release = (util$g.getValue(lines, "ProductVersion", ":", true, true) + " " + util$g.getValue(lines, "ProductVersionExtra", ":", true, true)).trim();
          result.build = util$g.getValue(lines, "BuildVersion");
          result.logofile = getLogoFile(result.distro);
          result.codename = "macOS";
          result.codename = result.release.indexOf("10.4") > -1 ? "Mac OS X Tiger" : result.codename;
          result.codename = result.release.indexOf("10.5") > -1 ? "Mac OS X Leopard" : result.codename;
          result.codename = result.release.indexOf("10.6") > -1 ? "Mac OS X Snow Leopard" : result.codename;
          result.codename = result.release.indexOf("10.7") > -1 ? "Mac OS X Lion" : result.codename;
          result.codename = result.release.indexOf("10.8") > -1 ? "OS X Mountain Lion" : result.codename;
          result.codename = result.release.indexOf("10.9") > -1 ? "OS X Mavericks" : result.codename;
          result.codename = result.release.indexOf("10.10") > -1 ? "OS X Yosemite" : result.codename;
          result.codename = result.release.indexOf("10.11") > -1 ? "OS X El Capitan" : result.codename;
          result.codename = result.release.indexOf("10.12") > -1 ? "macOS Sierra" : result.codename;
          result.codename = result.release.indexOf("10.13") > -1 ? "macOS High Sierra" : result.codename;
          result.codename = result.release.indexOf("10.14") > -1 ? "macOS Mojave" : result.codename;
          result.codename = result.release.indexOf("10.15") > -1 ? "macOS Catalina" : result.codename;
          result.codename = result.release.startsWith("11.") ? "macOS Big Sur" : result.codename;
          result.codename = result.release.startsWith("12.") ? "macOS Monterey" : result.codename;
          result.codename = result.release.startsWith("13.") ? "macOS Ventura" : result.codename;
          result.codename = result.release.startsWith("14.") ? "macOS Sonoma" : result.codename;
          result.uefi = true;
          result.codepage = util$g.getCodepage();
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_sunos$d) {
        result.release = result.kernel;
        exec$e("uname -o", function(error, stdout) {
          let lines = stdout.toString().split("\n");
          result.distro = lines[0];
          result.logofile = getLogoFile(result.distro);
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_windows$f) {
        result.logofile = getLogoFile();
        result.release = result.kernel;
        try {
          const workload = [];
          workload.push(util$g.powerShell("Get-CimInstance Win32_OperatingSystem | select Caption,SerialNumber,BuildNumber,ServicePackMajorVersion,ServicePackMinorVersion | fl"));
          workload.push(util$g.powerShell("(Get-CimInstance Win32_ComputerSystem).HypervisorPresent"));
          workload.push(util$g.powerShell("Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SystemInformation]::TerminalServerSession"));
          util$g.promiseAll(
            workload
          ).then((data) => {
            let lines = data.results[0] ? data.results[0].toString().split("\r\n") : [""];
            result.distro = util$g.getValue(lines, "Caption", ":").trim();
            result.serial = util$g.getValue(lines, "SerialNumber", ":").trim();
            result.build = util$g.getValue(lines, "BuildNumber", ":").trim();
            result.servicepack = util$g.getValue(lines, "ServicePackMajorVersion", ":").trim() + "." + util$g.getValue(lines, "ServicePackMinorVersion", ":").trim();
            result.codepage = util$g.getCodepage();
            const hyperv = data.results[1] ? data.results[1].toString().toLowerCase() : "";
            result.hypervisor = hyperv.indexOf("true") !== -1;
            const term = data.results[2] ? data.results[2].toString() : "";
            result.remoteSession = term.toString().toLowerCase().indexOf("true") >= 0;
            isUefiWindows().then((uefi) => {
              result.uefi = uefi;
              if (callback) {
                callback(result);
              }
              resolve(result);
            });
          });
        } catch (e) {
          if (callback) {
            callback(result);
          }
          resolve(result);
        }
      }
    });
  });
}
osinfo.osInfo = osInfo;
function isUefiLinux() {
  return new Promise((resolve) => {
    process.nextTick(() => {
      fs$a.stat("/sys/firmware/efi", function(err) {
        if (!err) {
          return resolve(true);
        } else {
          exec$e('dmesg | grep -E "EFI v"', function(error, stdout) {
            if (!error) {
              const lines = stdout.toString().split("\n");
              return resolve(lines.length > 0);
            }
            return resolve(false);
          });
        }
      });
    });
  });
}
function isUefiWindows() {
  return new Promise((resolve) => {
    process.nextTick(() => {
      try {
        exec$e('findstr /C:"Detected boot environment" "%windir%\\Panther\\setupact.log"', util$g.execOptsWin, function(error, stdout) {
          if (!error) {
            const line = stdout.toString().split("\n\r")[0];
            return resolve(line.toLowerCase().indexOf("efi") >= 0);
          } else {
            exec$e("echo %firmware_type%", util$g.execOptsWin, function(error2, stdout2) {
              if (!error2) {
                const line = stdout2.toString() || "";
                return resolve(line.toLowerCase().indexOf("efi") >= 0);
              } else {
                return resolve(false);
              }
            });
          }
        });
      } catch (e) {
        return resolve(false);
      }
    });
  });
}
function versions(apps, callback) {
  let versionObject = {
    kernel: os$6.release(),
    openssl: "",
    systemOpenssl: "",
    systemOpensslLib: "",
    node: process.versions.node,
    v8: process.versions.v8,
    npm: "",
    yarn: "",
    pm2: "",
    gulp: "",
    grunt: "",
    git: "",
    tsc: "",
    mysql: "",
    redis: "",
    mongodb: "",
    apache: "",
    nginx: "",
    php: "",
    docker: "",
    postfix: "",
    postgresql: "",
    perl: "",
    python: "",
    python3: "",
    pip: "",
    pip3: "",
    java: "",
    gcc: "",
    virtualbox: "",
    bash: "",
    zsh: "",
    fish: "",
    powershell: "",
    dotnet: ""
  };
  function checkVersionParam(apps2) {
    if (apps2 === "*") {
      return {
        versions: versionObject,
        counter: 30
      };
    }
    if (!Array.isArray(apps2)) {
      apps2 = apps2.trim().toLowerCase().replace(/,+/g, "|").replace(/ /g, "|");
      apps2 = apps2.split("|");
      const result = {
        versions: {},
        counter: 0
      };
      apps2.forEach((el) => {
        if (el) {
          for (let key in versionObject) {
            if ({}.hasOwnProperty.call(versionObject, key)) {
              if (key.toLowerCase() === el.toLowerCase() && !{}.hasOwnProperty.call(result.versions, key)) {
                result.versions[key] = versionObject[key];
                if (key === "openssl") {
                  result.versions.systemOpenssl = "";
                  result.versions.systemOpensslLib = "";
                }
                if (!result.versions[key]) {
                  result.counter++;
                }
              }
            }
          }
        }
      });
      return result;
    }
  }
  return new Promise((resolve) => {
    process.nextTick(() => {
      if (util$g.isFunction(apps) && !callback) {
        callback = apps;
        apps = "*";
      } else {
        apps = apps || "*";
        if (typeof apps !== "string") {
          if (callback) {
            callback({});
          }
          return resolve({});
        }
      }
      const appsObj = checkVersionParam(apps);
      let totalFunctions = appsObj.counter;
      let functionProcessed = /* @__PURE__ */ function() {
        return function() {
          if (--totalFunctions === 0) {
            if (callback) {
              callback(appsObj.versions);
            }
            resolve(appsObj.versions);
          }
        };
      }();
      let cmd = "";
      try {
        if ({}.hasOwnProperty.call(appsObj.versions, "openssl")) {
          appsObj.versions.openssl = process.versions.openssl;
          exec$e("openssl version", function(error, stdout) {
            if (!error) {
              let openssl_string = stdout.toString().split("\n")[0].trim();
              let openssl = openssl_string.split(" ");
              appsObj.versions.systemOpenssl = openssl.length > 0 ? openssl[1] : openssl[0];
              appsObj.versions.systemOpensslLib = openssl.length > 0 ? openssl[0] : "openssl";
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, "npm")) {
          exec$e("npm -v", function(error, stdout) {
            if (!error) {
              appsObj.versions.npm = stdout.toString().split("\n")[0];
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, "pm2")) {
          cmd = "pm2";
          if (_windows$f) {
            cmd += ".cmd";
          }
          exec$e(`${cmd} -v`, function(error, stdout) {
            if (!error) {
              let pm2 = stdout.toString().split("\n")[0].trim();
              if (!pm2.startsWith("[PM2]")) {
                appsObj.versions.pm2 = pm2;
              }
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, "yarn")) {
          exec$e("yarn --version", function(error, stdout) {
            if (!error) {
              appsObj.versions.yarn = stdout.toString().split("\n")[0];
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, "gulp")) {
          cmd = "gulp";
          if (_windows$f) {
            cmd += ".cmd";
          }
          exec$e(`${cmd} --version`, function(error, stdout) {
            if (!error) {
              const gulp = stdout.toString().split("\n")[0] || "";
              appsObj.versions.gulp = (gulp.toLowerCase().split("version")[1] || "").trim();
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, "tsc")) {
          cmd = "tsc";
          if (_windows$f) {
            cmd += ".cmd";
          }
          exec$e(`${cmd} --version`, function(error, stdout) {
            if (!error) {
              const tsc = stdout.toString().split("\n")[0] || "";
              appsObj.versions.tsc = (tsc.toLowerCase().split("version")[1] || "").trim();
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, "grunt")) {
          cmd = "grunt";
          if (_windows$f) {
            cmd += ".cmd";
          }
          exec$e(`${cmd} --version`, function(error, stdout) {
            if (!error) {
              const grunt = stdout.toString().split("\n")[0] || "";
              appsObj.versions.grunt = (grunt.toLowerCase().split("cli v")[1] || "").trim();
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, "git")) {
          if (_darwin$e) {
            const gitHomebrewExists = fs$a.existsSync("/usr/local/Cellar/git") || fs$a.existsSync("/opt/homebrew/bin/git");
            if (util$g.darwinXcodeExists() || gitHomebrewExists) {
              exec$e("git --version", function(error, stdout) {
                if (!error) {
                  let git = stdout.toString().split("\n")[0] || "";
                  git = (git.toLowerCase().split("version")[1] || "").trim();
                  appsObj.versions.git = (git.split(" ")[0] || "").trim();
                }
                functionProcessed();
              });
            } else {
              functionProcessed();
            }
          } else {
            exec$e("git --version", function(error, stdout) {
              if (!error) {
                let git = stdout.toString().split("\n")[0] || "";
                git = (git.toLowerCase().split("version")[1] || "").trim();
                appsObj.versions.git = (git.split(" ")[0] || "").trim();
              }
              functionProcessed();
            });
          }
        }
        if ({}.hasOwnProperty.call(appsObj.versions, "apache")) {
          exec$e("apachectl -v 2>&1", function(error, stdout) {
            if (!error) {
              const apache = (stdout.toString().split("\n")[0] || "").split(":");
              appsObj.versions.apache = apache.length > 1 ? apache[1].replace("Apache", "").replace("/", "").split("(")[0].trim() : "";
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, "nginx")) {
          exec$e("nginx -v 2>&1", function(error, stdout) {
            if (!error) {
              const nginx = stdout.toString().split("\n")[0] || "";
              appsObj.versions.nginx = (nginx.toLowerCase().split("/")[1] || "").trim();
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, "mysql")) {
          exec$e("mysql -V", function(error, stdout) {
            if (!error) {
              let mysql = stdout.toString().split("\n")[0] || "";
              mysql = mysql.toLowerCase();
              if (mysql.indexOf(",") > -1) {
                mysql = (mysql.split(",")[0] || "").trim();
                const parts = mysql.split(" ");
                appsObj.versions.mysql = (parts[parts.length - 1] || "").trim();
              } else {
                if (mysql.indexOf(" ver ") > -1) {
                  mysql = mysql.split(" ver ")[1];
                  appsObj.versions.mysql = mysql.split(" ")[0];
                }
              }
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, "php")) {
          exec$e("php -v", function(error, stdout) {
            if (!error) {
              const php = stdout.toString().split("\n")[0] || "";
              let parts = php.split("(");
              if (parts[0].indexOf("-")) {
                parts = parts[0].split("-");
              }
              appsObj.versions.php = parts[0].replace(/[^0-9.]/g, "");
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, "redis")) {
          exec$e("redis-server --version", function(error, stdout) {
            if (!error) {
              const redis = stdout.toString().split("\n")[0] || "";
              const parts = redis.split(" ");
              appsObj.versions.redis = util$g.getValue(parts, "v", "=", true);
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, "docker")) {
          exec$e("docker --version", function(error, stdout) {
            if (!error) {
              const docker2 = stdout.toString().split("\n")[0] || "";
              const parts = docker2.split(" ");
              appsObj.versions.docker = parts.length > 2 && parts[2].endsWith(",") ? parts[2].slice(0, -1) : "";
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, "postfix")) {
          exec$e("postconf -d | grep mail_version", function(error, stdout) {
            if (!error) {
              const postfix = stdout.toString().split("\n") || [];
              appsObj.versions.postfix = util$g.getValue(postfix, "mail_version", "=", true);
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, "mongodb")) {
          exec$e("mongod --version", function(error, stdout) {
            if (!error) {
              const mongodb = stdout.toString().split("\n")[0] || "";
              appsObj.versions.mongodb = (mongodb.toLowerCase().split(",")[0] || "").replace(/[^0-9.]/g, "");
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, "postgresql")) {
          if (_linux$e) {
            exec$e("locate bin/postgres", function(error, stdout) {
              if (!error) {
                const postgresqlBin = stdout.toString().split("\n").sort();
                if (postgresqlBin.length) {
                  exec$e(postgresqlBin[postgresqlBin.length - 1] + " -V", function(error2, stdout2) {
                    if (!error2) {
                      const postgresql = stdout2.toString().split("\n")[0].split(" ") || [];
                      appsObj.versions.postgresql = postgresql.length ? postgresql[postgresql.length - 1] : "";
                    }
                    functionProcessed();
                  });
                } else {
                  functionProcessed();
                }
              } else {
                exec$e("psql -V", function(error2, stdout2) {
                  if (!error2) {
                    const postgresql = stdout2.toString().split("\n")[0].split(" ") || [];
                    appsObj.versions.postgresql = postgresql.length ? postgresql[postgresql.length - 1] : "";
                    appsObj.versions.postgresql = appsObj.versions.postgresql.split("-")[0];
                  }
                  functionProcessed();
                });
              }
            });
          } else {
            if (_windows$f) {
              util$g.powerShell("Get-CimInstance Win32_Service | select caption | fl").then((stdout) => {
                let serviceSections = stdout.split(/\n\s*\n/);
                serviceSections.forEach((item) => {
                  if (item.trim() !== "") {
                    let lines = item.trim().split("\r\n");
                    let srvCaption = util$g.getValue(lines, "caption", ":", true).toLowerCase();
                    if (srvCaption.indexOf("postgresql") > -1) {
                      const parts = srvCaption.split(" server ");
                      if (parts.length > 1) {
                        appsObj.versions.postgresql = parts[1];
                      }
                    }
                  }
                });
                functionProcessed();
              });
            } else {
              exec$e("postgres -V", function(error, stdout) {
                if (!error) {
                  const postgresql = stdout.toString().split("\n")[0].split(" ") || [];
                  appsObj.versions.postgresql = postgresql.length ? postgresql[postgresql.length - 1] : "";
                }
                functionProcessed();
              });
            }
          }
        }
        if ({}.hasOwnProperty.call(appsObj.versions, "perl")) {
          exec$e("perl -v", function(error, stdout) {
            if (!error) {
              const perl = stdout.toString().split("\n") || "";
              while (perl.length > 0 && perl[0].trim() === "") {
                perl.shift();
              }
              if (perl.length > 0) {
                appsObj.versions.perl = perl[0].split("(").pop().split(")")[0].replace("v", "");
              }
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, "python")) {
          if (_darwin$e) {
            try {
              const stdout = execSync$9("sw_vers");
              const lines = stdout.toString().split("\n");
              const osVersion = util$g.getValue(lines, "ProductVersion", ":");
              const gitHomebrewExists1 = fs$a.existsSync("/usr/local/Cellar/python");
              const gitHomebrewExists2 = fs$a.existsSync("/opt/homebrew/bin/python");
              if (util$g.darwinXcodeExists() && util$g.semverCompare("12.0.1", osVersion) < 0 || gitHomebrewExists1 || gitHomebrewExists2) {
                const cmd2 = gitHomebrewExists1 ? "/usr/local/Cellar/python -V 2>&1" : gitHomebrewExists2 ? "/opt/homebrew/bin/python -V 2>&1" : "python -V 2>&1";
                exec$e(cmd2, function(error, stdout2) {
                  if (!error) {
                    const python = stdout2.toString().split("\n")[0] || "";
                    appsObj.versions.python = python.toLowerCase().replace("python", "").trim();
                  }
                  functionProcessed();
                });
              } else {
                functionProcessed();
              }
            } catch (e) {
              functionProcessed();
            }
          } else {
            exec$e("python -V 2>&1", function(error, stdout) {
              if (!error) {
                const python = stdout.toString().split("\n")[0] || "";
                appsObj.versions.python = python.toLowerCase().replace("python", "").trim();
              }
              functionProcessed();
            });
          }
        }
        if ({}.hasOwnProperty.call(appsObj.versions, "python3")) {
          if (_darwin$e) {
            const gitHomebrewExists = fs$a.existsSync("/usr/local/Cellar/python3") || fs$a.existsSync("/opt/homebrew/bin/python3");
            if (util$g.darwinXcodeExists() || gitHomebrewExists) {
              exec$e("python3 -V 2>&1", function(error, stdout) {
                if (!error) {
                  const python = stdout.toString().split("\n")[0] || "";
                  appsObj.versions.python3 = python.toLowerCase().replace("python", "").trim();
                }
                functionProcessed();
              });
            } else {
              functionProcessed();
            }
          } else {
            exec$e("python3 -V 2>&1", function(error, stdout) {
              if (!error) {
                const python = stdout.toString().split("\n")[0] || "";
                appsObj.versions.python3 = python.toLowerCase().replace("python", "").trim();
              }
              functionProcessed();
            });
          }
        }
        if ({}.hasOwnProperty.call(appsObj.versions, "pip")) {
          if (_darwin$e) {
            const gitHomebrewExists = fs$a.existsSync("/usr/local/Cellar/pip") || fs$a.existsSync("/opt/homebrew/bin/pip");
            if (util$g.darwinXcodeExists() || gitHomebrewExists) {
              exec$e("pip -V 2>&1", function(error, stdout) {
                if (!error) {
                  const pip = stdout.toString().split("\n")[0] || "";
                  const parts = pip.split(" ");
                  appsObj.versions.pip = parts.length >= 2 ? parts[1] : "";
                }
                functionProcessed();
              });
            } else {
              functionProcessed();
            }
          } else {
            exec$e("pip -V 2>&1", function(error, stdout) {
              if (!error) {
                const pip = stdout.toString().split("\n")[0] || "";
                const parts = pip.split(" ");
                appsObj.versions.pip = parts.length >= 2 ? parts[1] : "";
              }
              functionProcessed();
            });
          }
        }
        if ({}.hasOwnProperty.call(appsObj.versions, "pip3")) {
          if (_darwin$e) {
            const gitHomebrewExists = fs$a.existsSync("/usr/local/Cellar/pip3") || fs$a.existsSync("/opt/homebrew/bin/pip3");
            if (util$g.darwinXcodeExists() || gitHomebrewExists) {
              exec$e("pip3 -V 2>&1", function(error, stdout) {
                if (!error) {
                  const pip = stdout.toString().split("\n")[0] || "";
                  const parts = pip.split(" ");
                  appsObj.versions.pip3 = parts.length >= 2 ? parts[1] : "";
                }
                functionProcessed();
              });
            } else {
              functionProcessed();
            }
          } else {
            exec$e("pip3 -V 2>&1", function(error, stdout) {
              if (!error) {
                const pip = stdout.toString().split("\n")[0] || "";
                const parts = pip.split(" ");
                appsObj.versions.pip3 = parts.length >= 2 ? parts[1] : "";
              }
              functionProcessed();
            });
          }
        }
        if ({}.hasOwnProperty.call(appsObj.versions, "java")) {
          if (_darwin$e) {
            exec$e("/usr/libexec/java_home -V 2>&1", function(error, stdout) {
              if (!error && stdout.toString().toLowerCase().indexOf("no java runtime") === -1) {
                exec$e("java -version 2>&1", function(error2, stdout2) {
                  if (!error2) {
                    const java = stdout2.toString().split("\n")[0] || "";
                    const parts = java.split('"');
                    appsObj.versions.java = parts.length === 3 ? parts[1].trim() : "";
                  }
                  functionProcessed();
                });
              } else {
                functionProcessed();
              }
            });
          } else {
            exec$e("java -version 2>&1", function(error, stdout) {
              if (!error) {
                const java = stdout.toString().split("\n")[0] || "";
                const parts = java.split('"');
                appsObj.versions.java = parts.length === 3 ? parts[1].trim() : "";
              }
              functionProcessed();
            });
          }
        }
        if ({}.hasOwnProperty.call(appsObj.versions, "gcc")) {
          if (_darwin$e && util$g.darwinXcodeExists() || !_darwin$e) {
            exec$e("gcc -dumpversion", function(error, stdout) {
              if (!error) {
                appsObj.versions.gcc = stdout.toString().split("\n")[0].trim() || "";
              }
              if (appsObj.versions.gcc.indexOf(".") > -1) {
                functionProcessed();
              } else {
                exec$e("gcc --version", function(error2, stdout2) {
                  if (!error2) {
                    const gcc = stdout2.toString().split("\n")[0].trim();
                    if (gcc.indexOf("gcc") > -1 && gcc.indexOf(")") > -1) {
                      const parts = gcc.split(")");
                      appsObj.versions.gcc = parts[1].trim() || appsObj.versions.gcc;
                    }
                  }
                  functionProcessed();
                });
              }
            });
          } else {
            functionProcessed();
          }
        }
        if ({}.hasOwnProperty.call(appsObj.versions, "virtualbox")) {
          exec$e(util$g.getVboxmanage() + " -v 2>&1", function(error, stdout) {
            if (!error) {
              const vbox = stdout.toString().split("\n")[0] || "";
              const parts = vbox.split("r");
              appsObj.versions.virtualbox = parts[0];
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, "bash")) {
          exec$e("bash --version", function(error, stdout) {
            if (!error) {
              const line = stdout.toString().split("\n")[0];
              const parts = line.split(" version ");
              if (parts.length > 1) {
                appsObj.versions.bash = parts[1].split(" ")[0].split("(")[0];
              }
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, "zsh")) {
          exec$e("zsh --version", function(error, stdout) {
            if (!error) {
              const line = stdout.toString().split("\n")[0];
              const parts = line.split("zsh ");
              if (parts.length > 1) {
                appsObj.versions.zsh = parts[1].split(" ")[0];
              }
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, "fish")) {
          exec$e("fish --version", function(error, stdout) {
            if (!error) {
              const line = stdout.toString().split("\n")[0];
              const parts = line.split(" version ");
              if (parts.length > 1) {
                appsObj.versions.fish = parts[1].split(" ")[0];
              }
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, "powershell")) {
          if (_windows$f) {
            util$g.powerShell("$PSVersionTable").then((stdout) => {
              const lines = stdout.toString().split("\n").map((line) => line.replace(/ +/g, " ").replace(/ +/g, ":"));
              appsObj.versions.powershell = util$g.getValue(lines, "psversion");
              functionProcessed();
            });
          } else {
            functionProcessed();
          }
        }
        if ({}.hasOwnProperty.call(appsObj.versions, "dotnet")) {
          if (_windows$f) {
            util$g.powerShell('gci "HKLM:\\SOFTWARE\\Microsoft\\NET Framework Setup\\NDP" -recurse | gp -name Version,Release -EA 0 | where { $_.PSChildName -match "^(?!S)\\p{L}"} | select PSChildName, Version, Release').then((stdout) => {
              const lines = stdout.toString().split("\r\n");
              let dotnet = "";
              lines.forEach((line) => {
                line = line.replace(/ +/g, " ");
                const parts = line.split(" ");
                dotnet = dotnet || (parts[0].toLowerCase().startsWith("client") && parts.length > 2 ? parts[1].trim() : parts[0].toLowerCase().startsWith("full") && parts.length > 2 ? parts[1].trim() : "");
              });
              appsObj.versions.dotnet = dotnet.trim();
              functionProcessed();
            });
          } else {
            functionProcessed();
          }
        }
      } catch (e) {
        if (callback) {
          callback(appsObj.versions);
        }
        resolve(appsObj.versions);
      }
    });
  });
}
osinfo.versions = versions;
function shell(callback) {
  return new Promise((resolve) => {
    process.nextTick(() => {
      if (_windows$f) {
        resolve("cmd");
      } else {
        let result = "";
        exec$e("echo $SHELL", function(error, stdout) {
          if (!error) {
            result = stdout.toString().split("\n")[0];
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
    });
  });
}
osinfo.shell = shell;
function getUniqueMacAdresses() {
  let macs = [];
  try {
    const ifaces = os$6.networkInterfaces();
    for (let dev in ifaces) {
      if ({}.hasOwnProperty.call(ifaces, dev)) {
        ifaces[dev].forEach(function(details) {
          if (details && details.mac && details.mac !== "00:00:00:00:00:00") {
            const mac = details.mac.toLowerCase();
            if (macs.indexOf(mac) === -1) {
              macs.push(mac);
            }
          }
        });
      }
    }
    macs = macs.sort(function(a, b) {
      if (a < b) {
        return -1;
      }
      if (a > b) {
        return 1;
      }
      return 0;
    });
  } catch (e) {
    macs.push("00:00:00:00:00:00");
  }
  return macs;
}
function uuid(callback) {
  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = {
        os: "",
        hardware: "",
        macs: getUniqueMacAdresses()
      };
      let parts;
      if (_darwin$e) {
        exec$e("system_profiler SPHardwareDataType -json", function(error, stdout) {
          if (!error) {
            try {
              const jsonObj = JSON.parse(stdout.toString());
              if (jsonObj.SPHardwareDataType && jsonObj.SPHardwareDataType.length > 0) {
                const spHardware = jsonObj.SPHardwareDataType[0];
                result.os = spHardware.platform_UUID.toLowerCase();
                result.hardware = spHardware.serial_number;
              }
            } catch (e) {
              util$g.noop();
            }
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_linux$e) {
        const cmd = `echo -n "os: "; cat /var/lib/dbus/machine-id 2> /dev/null ||
cat /etc/machine-id 2> /dev/null; echo;
echo -n "hardware: "; cat /sys/class/dmi/id/product_uuid 2> /dev/null; echo;`;
        exec$e(cmd, function(error, stdout) {
          const lines = stdout.toString().split("\n");
          result.os = util$g.getValue(lines, "os").toLowerCase();
          result.hardware = util$g.getValue(lines, "hardware").toLowerCase();
          if (!result.hardware) {
            const lines2 = fs$a.readFileSync("/proc/cpuinfo", { encoding: "utf8" }).toString().split("\n");
            const serial = util$g.getValue(lines2, "serial");
            result.hardware = serial || "";
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_freebsd$d || _openbsd$d || _netbsd$d) {
        exec$e("sysctl -i kern.hostid kern.hostuuid", function(error, stdout) {
          const lines = stdout.toString().split("\n");
          result.os = util$g.getValue(lines, "kern.hostid", ":").toLowerCase();
          result.hardware = util$g.getValue(lines, "kern.hostuuid", ":").toLowerCase();
          if (result.os.indexOf("unknown") >= 0) {
            result.os = "";
          }
          if (result.hardware.indexOf("unknown") >= 0) {
            result.hardware = "";
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_windows$f) {
        let sysdir = "%windir%\\System32";
        if (process.arch === "ia32" && Object.prototype.hasOwnProperty.call(process.env, "PROCESSOR_ARCHITEW6432")) {
          sysdir = "%windir%\\sysnative\\cmd.exe /c %windir%\\System32";
        }
        util$g.powerShell("Get-CimInstance Win32_ComputerSystemProduct | select UUID | fl").then((stdout) => {
          let lines = stdout.split("\r\n");
          result.hardware = util$g.getValue(lines, "uuid", ":").toLowerCase();
          exec$e(`${sysdir}\\reg query "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Cryptography" /v MachineGuid`, util$g.execOptsWin, function(error, stdout2) {
            parts = stdout2.toString().split("\n\r")[0].split("REG_SZ");
            result.os = parts.length > 1 ? parts[1].replace(/\r+|\n+|\s+/ig, "").toLowerCase() : "";
            if (callback) {
              callback(result);
            }
            resolve(result);
          });
        });
      }
    });
  });
}
osinfo.uuid = uuid;
var cpu$1 = {};
const os$5 = require$$0$1;
const exec$d = require$$1.exec;
const execSync$8 = require$$1.execSync;
const fs$9 = require$$1$1;
const util$f = util$j;
let _platform$e = process.platform;
const _linux$d = _platform$e === "linux" || _platform$e === "android";
const _darwin$d = _platform$e === "darwin";
const _windows$e = _platform$e === "win32";
const _freebsd$c = _platform$e === "freebsd";
const _openbsd$c = _platform$e === "openbsd";
const _netbsd$c = _platform$e === "netbsd";
const _sunos$c = _platform$e === "sunos";
let _cpu_speed = 0;
let _current_cpu = {
  user: 0,
  nice: 0,
  system: 0,
  idle: 0,
  irq: 0,
  steal: 0,
  guest: 0,
  load: 0,
  tick: 0,
  ms: 0,
  currentLoad: 0,
  currentLoadUser: 0,
  currentLoadSystem: 0,
  currentLoadNice: 0,
  currentLoadIdle: 0,
  currentLoadIrq: 0,
  currentLoadSteal: 0,
  currentLoadGuest: 0,
  rawCurrentLoad: 0,
  rawCurrentLoadUser: 0,
  rawCurrentLoadSystem: 0,
  rawCurrentLoadNice: 0,
  rawCurrentLoadIdle: 0,
  rawCurrentLoadIrq: 0,
  rawCurrentLoadSteal: 0,
  rawCurrentLoadGuest: 0
};
let _cpus = [];
let _corecount = 0;
const AMDBaseFrequencies = {
  "8346": "1.8",
  "8347": "1.9",
  "8350": "2.0",
  "8354": "2.2",
  "8356|SE": "2.4",
  "8356": "2.3",
  "8360": "2.5",
  "2372": "2.1",
  "2373": "2.1",
  "2374": "2.2",
  "2376": "2.3",
  "2377": "2.3",
  "2378": "2.4",
  "2379": "2.4",
  "2380": "2.5",
  "2381": "2.5",
  "2382": "2.6",
  "2384": "2.7",
  "2386": "2.8",
  "2387": "2.8",
  "2389": "2.9",
  "2393": "3.1",
  "8374": "2.2",
  "8376": "2.3",
  "8378": "2.4",
  "8379": "2.4",
  "8380": "2.5",
  "8381": "2.5",
  "8382": "2.6",
  "8384": "2.7",
  "8386": "2.8",
  "8387": "2.8",
  "8389": "2.9",
  "8393": "3.1",
  "2419EE": "1.8",
  "2423HE": "2.0",
  "2425HE": "2.1",
  "2427": "2.2",
  "2431": "2.4",
  "2435": "2.6",
  "2439SE": "2.8",
  "8425HE": "2.1",
  "8431": "2.4",
  "8435": "2.6",
  "8439SE": "2.8",
  "4122": "2.2",
  "4130": "2.6",
  "4162EE": "1.7",
  "4164EE": "1.8",
  "4170HE": "2.1",
  "4174HE": "2.3",
  "4176HE": "2.4",
  "4180": "2.6",
  "4184": "2.8",
  "6124HE": "1.8",
  "6128HE": "2.0",
  "6132HE": "2.2",
  "6128": "2.0",
  "6134": "2.3",
  "6136": "2.4",
  "6140": "2.6",
  "6164HE": "1.7",
  "6166HE": "1.8",
  "6168": "1.9",
  "6172": "2.1",
  "6174": "2.2",
  "6176": "2.3",
  "6176SE": "2.3",
  "6180SE": "2.5",
  "3250": "2.5",
  "3260": "2.7",
  "3280": "2.4",
  "4226": "2.7",
  "4228": "2.8",
  "4230": "2.9",
  "4234": "3.1",
  "4238": "3.3",
  "4240": "3.4",
  "4256": "1.6",
  "4274": "2.5",
  "4276": "2.6",
  "4280": "2.8",
  "4284": "3.0",
  "6204": "3.3",
  "6212": "2.6",
  "6220": "3.0",
  "6234": "2.4",
  "6238": "2.6",
  "6262HE": "1.6",
  "6272": "2.1",
  "6274": "2.2",
  "6276": "2.3",
  "6278": "2.4",
  "6282SE": "2.6",
  "6284SE": "2.7",
  "6308": "3.5",
  "6320": "2.8",
  "6328": "3.2",
  "6338P": "2.3",
  "6344": "2.6",
  "6348": "2.8",
  "6366": "1.8",
  "6370P": "2.0",
  "6376": "2.3",
  "6378": "2.4",
  "6380": "2.5",
  "6386": "2.8",
  "FX|4100": "3.6",
  "FX|4120": "3.9",
  "FX|4130": "3.8",
  "FX|4150": "3.8",
  "FX|4170": "4.2",
  "FX|6100": "3.3",
  "FX|6120": "3.6",
  "FX|6130": "3.6",
  "FX|6200": "3.8",
  "FX|8100": "2.8",
  "FX|8120": "3.1",
  "FX|8140": "3.2",
  "FX|8150": "3.6",
  "FX|8170": "3.9",
  "FX|4300": "3.8",
  "FX|4320": "4.0",
  "FX|4350": "4.2",
  "FX|6300": "3.5",
  "FX|6350": "3.9",
  "FX|8300": "3.3",
  "FX|8310": "3.4",
  "FX|8320": "3.5",
  "FX|8350": "4.0",
  "FX|8370": "4.0",
  "FX|9370": "4.4",
  "FX|9590": "4.7",
  "FX|8320E": "3.2",
  "FX|8370E": "3.3",
  // ZEN Desktop CPUs
  "1200": "3.1",
  "Pro 1200": "3.1",
  "1300X": "3.5",
  "Pro 1300": "3.5",
  "1400": "3.2",
  "1500X": "3.5",
  "Pro 1500": "3.5",
  "1600": "3.2",
  "1600X": "3.6",
  "Pro 1600": "3.2",
  "1700": "3.0",
  "Pro 1700": "3.0",
  "1700X": "3.4",
  "Pro 1700X": "3.4",
  "1800X": "3.6",
  "1900X": "3.8",
  "1920": "3.2",
  "1920X": "3.5",
  "1950X": "3.4",
  // ZEN Desktop APUs
  "200GE": "3.2",
  "Pro 200GE": "3.2",
  "220GE": "3.4",
  "240GE": "3.5",
  "3000G": "3.5",
  "300GE": "3.4",
  "3050GE": "3.4",
  "2200G": "3.5",
  "Pro 2200G": "3.5",
  "2200GE": "3.2",
  "Pro 2200GE": "3.2",
  "2400G": "3.6",
  "Pro 2400G": "3.6",
  "2400GE": "3.2",
  "Pro 2400GE": "3.2",
  // ZEN Mobile APUs
  "Pro 200U": "2.3",
  "300U": "2.4",
  "2200U": "2.5",
  "3200U": "2.6",
  "2300U": "2.0",
  "Pro 2300U": "2.0",
  "2500U": "2.0",
  "Pro 2500U": "2.2",
  "2600H": "3.2",
  "2700U": "2.0",
  "Pro 2700U": "2.2",
  "2800H": "3.3",
  // ZEN Server Processors
  "7351": "2.4",
  "7351P": "2.4",
  "7401": "2.0",
  "7401P": "2.0",
  "7551P": "2.0",
  "7551": "2.0",
  "7251": "2.1",
  "7261": "2.5",
  "7281": "2.1",
  "7301": "2.2",
  "7371": "3.1",
  "7451": "2.3",
  "7501": "2.0",
  "7571": "2.2",
  "7601": "2.2",
  // ZEN Embedded Processors
  "V1500B": "2.2",
  "V1780B": "3.35",
  "V1202B": "2.3",
  "V1404I": "2.0",
  "V1605B": "2.0",
  "V1756B": "3.25",
  "V1807B": "3.35",
  "3101": "2.1",
  "3151": "2.7",
  "3201": "1.5",
  "3251": "2.5",
  "3255": "2.5",
  "3301": "2.0",
  "3351": "1.9",
  "3401": "1.85",
  "3451": "2.15",
  // ZEN+ Desktop
  "1200|AF": "3.1",
  "2300X": "3.5",
  "2500X": "3.6",
  "2600": "3.4",
  "2600E": "3.1",
  "1600|AF": "3.2",
  "2600X": "3.6",
  "2700": "3.2",
  "2700E": "2.8",
  "Pro 2700": "3.2",
  "2700X": "3.7",
  "Pro 2700X": "3.6",
  "2920X": "3.5",
  "2950X": "3.5",
  "2970WX": "3.0",
  "2990WX": "3.0",
  // ZEN+ Desktop APU
  "Pro 300GE": "3.4",
  "Pro 3125GE": "3.4",
  "3150G": "3.5",
  "Pro 3150G": "3.5",
  "3150GE": "3.3",
  "Pro 3150GE": "3.3",
  "3200G": "3.6",
  "Pro 3200G": "3.6",
  "3200GE": "3.3",
  "Pro 3200GE": "3.3",
  "3350G": "3.6",
  "Pro 3350G": "3.6",
  "3350GE": "3.3",
  "Pro 3350GE": "3.3",
  "3400G": "3.7",
  "Pro 3400G": "3.7",
  "3400GE": "3.3",
  "Pro 3400GE": "3.3",
  // ZEN+ Mobile
  "3300U": "2.1",
  "PRO 3300U": "2.1",
  "3450U": "2.1",
  "3500U": "2.1",
  "PRO 3500U": "2.1",
  "3500C": "2.1",
  "3550H": "2.1",
  "3580U": "2.1",
  "3700U": "2.3",
  "PRO 3700U": "2.3",
  "3700C": "2.3",
  "3750H": "2.3",
  "3780U": "2.3",
  // ZEN2 Desktop CPUS
  "3100": "3.6",
  "3300X": "3.8",
  "3500": "3.6",
  "3500X": "3.6",
  "3600": "3.6",
  "Pro 3600": "3.6",
  "3600X": "3.8",
  "3600XT": "3.8",
  "Pro 3700": "3.6",
  "3700X": "3.6",
  "3800X": "3.9",
  "3800XT": "3.9",
  "3900": "3.1",
  "Pro 3900": "3.1",
  "3900X": "3.8",
  "3900XT": "3.8",
  "3950X": "3.5",
  "3960X": "3.8",
  "3970X": "3.7",
  "3990X": "2.9",
  "3945WX": "4.0",
  "3955WX": "3.9",
  "3975WX": "3.5",
  "3995WX": "2.7",
  // ZEN2 Desktop APUs
  "4300GE": "3.5",
  "Pro 4300GE": "3.5",
  "4300G": "3.8",
  "Pro 4300G": "3.8",
  "4600GE": "3.3",
  "Pro 4650GE": "3.3",
  "4600G": "3.7",
  "Pro 4650G": "3.7",
  "4700GE": "3.1",
  "Pro 4750GE": "3.1",
  "4700G": "3.6",
  "Pro 4750G": "3.6",
  "4300U": "2.7",
  "4450U": "2.5",
  "Pro 4450U": "2.5",
  "4500U": "2.3",
  "4600U": "2.1",
  "PRO 4650U": "2.1",
  "4680U": "2.1",
  "4600HS": "3.0",
  "4600H": "3.0",
  "4700U": "2.0",
  "PRO 4750U": "1.7",
  "4800U": "1.8",
  "4800HS": "2.9",
  "4800H": "2.9",
  "4900HS": "3.0",
  "4900H": "3.3",
  "5300U": "2.6",
  "5500U": "2.1",
  "5700U": "1.8",
  // ZEN2 - EPYC
  "7232P": "3.1",
  "7302P": "3.0",
  "7402P": "2.8",
  "7502P": "2.5",
  "7702P": "2.0",
  "7252": "3.1",
  "7262": "3.2",
  "7272": "2.9",
  "7282": "2.8",
  "7302": "3.0",
  "7352": "2.3",
  "7402": "2.8",
  "7452": "2.35",
  "7502": "2.5",
  "7532": "2.4",
  "7542": "2.9",
  "7552": "2.2",
  "7642": "2.3",
  "7662": "2.0",
  "7702": "2.0",
  "7742": "2.25",
  "7H12": "2.6",
  "7F32": "3.7",
  "7F52": "3.5",
  "7F72": "3.2",
  // Epyc (Milan)
  "7773X": "2.2",
  "7763": "2.45",
  "7713": "2.0",
  "7713P": "2.0",
  "7663": "2.0",
  "7643": "2.3",
  "7573X": "2.8",
  "75F3": "2.95",
  "7543": "2.8",
  "7543P": "2.8",
  "7513": "2.6",
  "7473X": "2.8",
  "7453": "2.75",
  "74F3": "3.2",
  "7443": "2.85",
  "7443P": "2.85",
  "7413": "2.65",
  "7373X": "3.05",
  "73F3": "3.5",
  "7343": "3.2",
  "7313": "3.0",
  "7313P": "3.0",
  "72F3": "3.7",
  // ZEN3
  "5600X": "3.7",
  "5800X": "3.8",
  "5900X": "3.7",
  "5950X": "3.4",
  "5945WX": "4.1",
  "5955WX": "4.0",
  "5965WX": "3.8",
  "5975WX": "3.6",
  "5995WX": "2.7",
  "7960X": "4.2",
  "7970X": "4.0",
  "7980X": "3.2",
  "7965WX": "4.2",
  "7975WX": "4.0",
  "7985WX": "3.2",
  "7995WX": "2.5",
  // ZEN4
  "9754": "2.25",
  "9754S": "2.25",
  "9734": "2.2",
  "9684X": "2.55",
  "9384X": "3.1",
  "9184X": "3.55",
  "9654P": "2.4",
  "9654": "2.4",
  "9634": "2.25",
  "9554P": "3.1",
  "9554": "3.1",
  "9534": "2.45",
  "9474F": "3.6",
  "9454P": "2.75",
  "9454": "2.75",
  "9374F": "3.85",
  "9354P": "3.25",
  "9354": "3.25",
  "9334": "2.7",
  "9274F": "4.05",
  "9254": "2.9",
  "9224": "2.5",
  "9174F": "4.1",
  "9124": "3.0"
};
const socketTypes = {
  1: "Other",
  2: "Unknown",
  3: "Daughter Board",
  4: "ZIF Socket",
  5: "Replacement/Piggy Back",
  6: "None",
  7: "LIF Socket",
  8: "Slot 1",
  9: "Slot 2",
  10: "370 Pin Socket",
  11: "Slot A",
  12: "Slot M",
  13: "423",
  14: "A (Socket 462)",
  15: "478",
  16: "754",
  17: "940",
  18: "939",
  19: "mPGA604",
  20: "LGA771",
  21: "LGA775",
  22: "S1",
  23: "AM2",
  24: "F (1207)",
  25: "LGA1366",
  26: "G34",
  27: "AM3",
  28: "C32",
  29: "LGA1156",
  30: "LGA1567",
  31: "PGA988A",
  32: "BGA1288",
  33: "rPGA988B",
  34: "BGA1023",
  35: "BGA1224",
  36: "LGA1155",
  37: "LGA1356",
  38: "LGA2011",
  39: "FS1",
  40: "FS2",
  41: "FM1",
  42: "FM2",
  43: "LGA2011-3",
  44: "LGA1356-3",
  45: "LGA1150",
  46: "BGA1168",
  47: "BGA1234",
  48: "BGA1364",
  49: "AM4",
  50: "LGA1151",
  51: "BGA1356",
  52: "BGA1440",
  53: "BGA1515",
  54: "LGA3647-1",
  55: "SP3",
  56: "SP3r2",
  57: "LGA2066",
  58: "BGA1392",
  59: "BGA1510",
  60: "BGA1528",
  61: "LGA4189",
  62: "LGA1200",
  63: "LGA4677",
  64: "LGA1700",
  65: "BGA1744",
  66: "BGA1781",
  67: "BGA1211",
  68: "BGA2422",
  69: "LGA1211",
  70: "LGA2422",
  71: "LGA5773",
  72: "BGA5773"
};
const socketTypesByName = {
  "LGA1150": "i7-5775C i3-4340 i3-4170 G3250 i3-4160T i3-4160 E3-1231 G3258 G3240 i7-4790S i7-4790K i7-4790 i5-4690K i5-4690 i5-4590T i5-4590S i5-4590 i5-4460 i3-4360 i3-4150 G1820 G3420 G3220 i7-4771 i5-4440 i3-4330 i3-4130T i3-4130 E3-1230 i7-4770S i7-4770K i7-4770 i5-4670K i5-4670 i5-4570T i5-4570S i5-4570 i5-4430",
  "LGA1151": "i9-9900KS E-2288G E-2224 G5420 i9-9900T i9-9900 i7-9700T i7-9700F i7-9700E i7-9700 i5-9600 i5-9500T i5-9500F i5-9500 i5-9400T i3-9350K i3-9300 i3-9100T i3-9100F i3-9100 G4930 i9-9900KF i7-9700KF i5-9600KF i5-9400F i5-9400 i3-9350KF i9-9900K i7-9700K i5-9600K G5500 G5400 i7-8700T i7-8086K i5-8600 i5-8500T i5-8500 i5-8400T i3-8300 i3-8100T G4900 i7-8700K i7-8700 i5-8600K i5-8400 i3-8350K i3-8100 E3-1270 G4600 G4560 i7-7700T i7-7700K i7-7700 i5-7600K i5-7600 i5-7500T i5-7500 i5-7400 i3-7350K i3-7300 i3-7100T i3-7100 G3930 G3900 G4400 i7-6700T i7-6700K i7-6700 i5-6600K i5-6600 i5-6500T i5-6500 i5-6400T i5-6400 i3-6300 i3-6100T i3-6100 E3-1270 E3-1270 T4500 T4400",
  "1155": "G440 G460 G465 G470 G530T G540T G550T G1610T G1620T G530 G540 G1610 G550 G1620 G555 G1630 i3-2100T i3-2120T i3-3220T i3-3240T i3-3250T i3-2100 i3-2105 i3-2102 i3-3210 i3-3220 i3-2125 i3-2120 i3-3225 i3-2130 i3-3245 i3-3240 i3-3250 i5-3570T i5-2500T i5-2400S i5-2405S i5-2390T i5-3330S i5-2500S i5-3335S i5-2300 i5-3450S i5-3340S i5-3470S i5-3475S i5-3470T i5-2310 i5-3550S i5-2320 i5-3330 i5-3350P i5-3450 i5-2400 i5-3340 i5-3570S i5-2380P i5-2450P i5-3470 i5-2500K i5-3550 i5-2500 i5-3570 i5-3570K i5-2550K i7-3770T i7-2600S i7-3770S i7-2600K i7-2600 i7-3770 i7-3770K i7-2700K G620T G630T G640T G2020T G645T G2100T G2030T G622 G860T G620 G632 G2120T G630 G640 G2010 G840 G2020 G850 G645 G2030 G860 G2120 G870 G2130 G2140 E3-1220L E3-1220L E3-1260L E3-1265L E3-1220 E3-1225 E3-1220 E3-1235 E3-1225 E3-1230 E3-1230 E3-1240 E3-1245 E3-1270 E3-1275 E3-1240 E3-1245 E3-1270 E3-1280 E3-1275 E3-1290 E3-1280 E3-1290"
};
function getSocketTypesByName(str) {
  let result = "";
  for (const key in socketTypesByName) {
    const names = socketTypesByName[key].split(" ");
    names.forEach((element) => {
      if (str.indexOf(element) >= 0) {
        result = key;
      }
    });
  }
  return result;
}
function cpuManufacturer(str) {
  let result = str;
  str = str.toLowerCase();
  if (str.indexOf("intel") >= 0) {
    result = "Intel";
  }
  if (str.indexOf("amd") >= 0) {
    result = "AMD";
  }
  if (str.indexOf("qemu") >= 0) {
    result = "QEMU";
  }
  if (str.indexOf("hygon") >= 0) {
    result = "Hygon";
  }
  if (str.indexOf("centaur") >= 0) {
    result = "WinChip/Via";
  }
  if (str.indexOf("vmware") >= 0) {
    result = "VMware";
  }
  if (str.indexOf("Xen") >= 0) {
    result = "Xen Hypervisor";
  }
  if (str.indexOf("tcg") >= 0) {
    result = "QEMU";
  }
  if (str.indexOf("apple") >= 0) {
    result = "Apple";
  }
  return result;
}
function cpuBrandManufacturer(res) {
  res.brand = res.brand.replace(/\(R\)+/g, "®").replace(/\s+/g, " ").trim();
  res.brand = res.brand.replace(/\(TM\)+/g, "™").replace(/\s+/g, " ").trim();
  res.brand = res.brand.replace(/\(C\)+/g, "©").replace(/\s+/g, " ").trim();
  res.brand = res.brand.replace(/CPU+/g, "").replace(/\s+/g, " ").trim();
  res.manufacturer = cpuManufacturer(res.brand);
  let parts = res.brand.split(" ");
  parts.shift();
  res.brand = parts.join(" ");
  return res;
}
function getAMDSpeed(brand) {
  let result = "0";
  for (let key in AMDBaseFrequencies) {
    if ({}.hasOwnProperty.call(AMDBaseFrequencies, key)) {
      let parts = key.split("|");
      let found = 0;
      parts.forEach((item) => {
        if (brand.indexOf(item) > -1) {
          found++;
        }
      });
      if (found === parts.length) {
        result = AMDBaseFrequencies[key];
      }
    }
  }
  return parseFloat(result);
}
function getCpu() {
  return new Promise((resolve) => {
    process.nextTick(() => {
      const UNKNOWN = "unknown";
      let result = {
        manufacturer: UNKNOWN,
        brand: UNKNOWN,
        vendor: "",
        family: "",
        model: "",
        stepping: "",
        revision: "",
        voltage: "",
        speed: 0,
        speedMin: 0,
        speedMax: 0,
        governor: "",
        cores: util$f.cores(),
        physicalCores: util$f.cores(),
        performanceCores: util$f.cores(),
        efficiencyCores: 0,
        processors: 1,
        socket: "",
        flags: "",
        virtualization: false,
        cache: {}
      };
      cpuFlags().then((flags) => {
        result.flags = flags;
        result.virtualization = flags.indexOf("vmx") > -1 || flags.indexOf("svm") > -1;
        if (_darwin$d) {
          exec$d("sysctl machdep.cpu hw.cpufrequency_max hw.cpufrequency_min hw.packages hw.physicalcpu_max hw.ncpu hw.tbfrequency hw.cpufamily hw.cpusubfamily", function(error, stdout) {
            let lines = stdout.toString().split("\n");
            const modelline = util$f.getValue(lines, "machdep.cpu.brand_string");
            const modellineParts = modelline.split("@");
            result.brand = modellineParts[0].trim();
            const speed = modellineParts[1] ? modellineParts[1].trim() : "0";
            result.speed = parseFloat(speed.replace(/GHz+/g, ""));
            let tbFrequency = util$f.getValue(lines, "hw.tbfrequency") / 1e9;
            tbFrequency = tbFrequency < 0.1 ? tbFrequency * 100 : tbFrequency;
            result.speed = result.speed === 0 ? tbFrequency : result.speed;
            _cpu_speed = result.speed;
            result = cpuBrandManufacturer(result);
            result.speedMin = util$f.getValue(lines, "hw.cpufrequency_min") ? util$f.getValue(lines, "hw.cpufrequency_min") / 1e9 : result.speed;
            result.speedMax = util$f.getValue(lines, "hw.cpufrequency_max") ? util$f.getValue(lines, "hw.cpufrequency_max") / 1e9 : result.speed;
            result.vendor = util$f.getValue(lines, "machdep.cpu.vendor") || "Apple";
            result.family = util$f.getValue(lines, "machdep.cpu.family") || util$f.getValue(lines, "hw.cpufamily");
            result.model = util$f.getValue(lines, "machdep.cpu.model");
            result.stepping = util$f.getValue(lines, "machdep.cpu.stepping") || util$f.getValue(lines, "hw.cpusubfamily");
            result.virtualization = true;
            const countProcessors = util$f.getValue(lines, "hw.packages");
            const countCores = util$f.getValue(lines, "hw.physicalcpu_max");
            const countThreads = util$f.getValue(lines, "hw.ncpu");
            if (os$5.arch() === "arm64") {
              result.socket = "SOC";
              try {
                const clusters = execSync$8("ioreg -c IOPlatformDevice -d 3 -r | grep cluster-type").toString().split("\n");
                const efficiencyCores = clusters.filter((line) => line.indexOf('"E"') >= 0).length;
                const performanceCores = clusters.filter((line) => line.indexOf('"P"') >= 0).length;
                result.efficiencyCores = efficiencyCores;
                result.performanceCores = performanceCores;
              } catch (e) {
                util$f.noop();
              }
            }
            if (countProcessors) {
              result.processors = parseInt(countProcessors) || 1;
            }
            if (countCores && countThreads) {
              result.cores = parseInt(countThreads) || util$f.cores();
              result.physicalCores = parseInt(countCores) || util$f.cores();
            }
            cpuCache().then((res) => {
              result.cache = res;
              resolve(result);
            });
          });
        }
        if (_linux$d) {
          let modelline = "";
          let lines = [];
          if (os$5.cpus()[0] && os$5.cpus()[0].model) {
            modelline = os$5.cpus()[0].model;
          }
          exec$d('export LC_ALL=C; lscpu; echo -n "Governor: "; cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor 2>/dev/null; echo; unset LC_ALL', function(error, stdout) {
            if (!error) {
              lines = stdout.toString().split("\n");
            }
            modelline = util$f.getValue(lines, "model name") || modelline;
            modelline = util$f.getValue(lines, "bios model name") || modelline;
            const modellineParts = modelline.split("@");
            result.brand = modellineParts[0].trim();
            result.speed = modellineParts[1] ? parseFloat(modellineParts[1].trim()) : 0;
            if (result.speed === 0 && (result.brand.indexOf("AMD") > -1 || result.brand.toLowerCase().indexOf("ryzen") > -1)) {
              result.speed = getAMDSpeed(result.brand);
            }
            if (result.speed === 0) {
              const current = getCpuCurrentSpeedSync();
              if (current.avg !== 0) {
                result.speed = current.avg;
              }
            }
            _cpu_speed = result.speed;
            result.speedMin = Math.round(parseFloat(util$f.getValue(lines, "cpu min mhz").replace(/,/g, ".")) / 10) / 100;
            result.speedMax = Math.round(parseFloat(util$f.getValue(lines, "cpu max mhz").replace(/,/g, ".")) / 10) / 100;
            result = cpuBrandManufacturer(result);
            result.vendor = cpuManufacturer(util$f.getValue(lines, "vendor id"));
            result.family = util$f.getValue(lines, "cpu family");
            result.model = util$f.getValue(lines, "model:");
            result.stepping = util$f.getValue(lines, "stepping");
            result.revision = util$f.getValue(lines, "cpu revision");
            result.cache.l1d = util$f.getValue(lines, "l1d cache");
            if (result.cache.l1d) {
              result.cache.l1d = parseInt(result.cache.l1d) * (result.cache.l1d.indexOf("M") !== -1 ? 1024 * 1024 : result.cache.l1d.indexOf("K") !== -1 ? 1024 : 1);
            }
            result.cache.l1i = util$f.getValue(lines, "l1i cache");
            if (result.cache.l1i) {
              result.cache.l1i = parseInt(result.cache.l1i) * (result.cache.l1i.indexOf("M") !== -1 ? 1024 * 1024 : result.cache.l1i.indexOf("K") !== -1 ? 1024 : 1);
            }
            result.cache.l2 = util$f.getValue(lines, "l2 cache");
            if (result.cache.l2) {
              result.cache.l2 = parseInt(result.cache.l2) * (result.cache.l2.indexOf("M") !== -1 ? 1024 * 1024 : result.cache.l2.indexOf("K") !== -1 ? 1024 : 1);
            }
            result.cache.l3 = util$f.getValue(lines, "l3 cache");
            if (result.cache.l3) {
              result.cache.l3 = parseInt(result.cache.l3) * (result.cache.l3.indexOf("M") !== -1 ? 1024 * 1024 : result.cache.l3.indexOf("K") !== -1 ? 1024 : 1);
            }
            const threadsPerCore = util$f.getValue(lines, "thread(s) per core") || "1";
            const processors = util$f.getValue(lines, "socket(s)") || "1";
            const threadsPerCoreInt = parseInt(threadsPerCore, 10);
            const processorsInt = parseInt(processors, 10) || 1;
            const coresPerSocket = parseInt(util$f.getValue(lines, "core(s) per socket"), 10);
            result.physicalCores = coresPerSocket ? coresPerSocket * processorsInt : result.cores / threadsPerCoreInt;
            result.performanceCores = threadsPerCoreInt > 1 ? result.cores - result.physicalCores : result.cores;
            result.efficiencyCores = threadsPerCoreInt > 1 ? result.cores - threadsPerCoreInt * result.performanceCores : 0;
            result.processors = processorsInt;
            result.governor = util$f.getValue(lines, "governor") || "";
            if (result.vendor === "ARM") {
              const linesRpi = fs$9.readFileSync("/proc/cpuinfo").toString().split("\n");
              const rPIRevision = util$f.decodePiCpuinfo(linesRpi);
              if (rPIRevision.model.toLowerCase().indexOf("raspberry") >= 0) {
                result.family = result.manufacturer;
                result.manufacturer = rPIRevision.manufacturer;
                result.brand = rPIRevision.processor;
                result.revision = rPIRevision.revisionCode;
                result.socket = "SOC";
              }
            }
            let lines2 = [];
            exec$d('export LC_ALL=C; dmidecode –t 4 2>/dev/null | grep "Upgrade: Socket"; unset LC_ALL', function(error2, stdout2) {
              lines2 = stdout2.toString().split("\n");
              if (lines2 && lines2.length) {
                result.socket = util$f.getValue(lines2, "Upgrade").replace("Socket", "").trim() || result.socket;
              }
              resolve(result);
            });
          });
        }
        if (_freebsd$c || _openbsd$c || _netbsd$c) {
          let modelline = "";
          let lines = [];
          if (os$5.cpus()[0] && os$5.cpus()[0].model) {
            modelline = os$5.cpus()[0].model;
          }
          exec$d("export LC_ALL=C; dmidecode -t 4; dmidecode -t 7 unset LC_ALL", function(error, stdout) {
            let cache = [];
            if (!error) {
              const data = stdout.toString().split("# dmidecode");
              const processor = data.length > 1 ? data[1] : "";
              cache = data.length > 2 ? data[2].split("Cache Information") : [];
              lines = processor.split("\n");
            }
            result.brand = modelline.split("@")[0].trim();
            result.speed = modelline.split("@")[1] ? parseFloat(modelline.split("@")[1].trim()) : 0;
            if (result.speed === 0 && (result.brand.indexOf("AMD") > -1 || result.brand.toLowerCase().indexOf("ryzen") > -1)) {
              result.speed = getAMDSpeed(result.brand);
            }
            if (result.speed === 0) {
              const current = getCpuCurrentSpeedSync();
              if (current.avg !== 0) {
                result.speed = current.avg;
              }
            }
            _cpu_speed = result.speed;
            result.speedMin = result.speed;
            result.speedMax = Math.round(parseFloat(util$f.getValue(lines, "max speed").replace(/Mhz/g, "")) / 10) / 100;
            result = cpuBrandManufacturer(result);
            result.vendor = cpuManufacturer(util$f.getValue(lines, "manufacturer"));
            let sig = util$f.getValue(lines, "signature");
            sig = sig.split(",");
            for (let i = 0; i < sig.length; i++) {
              sig[i] = sig[i].trim();
            }
            result.family = util$f.getValue(sig, "Family", " ", true);
            result.model = util$f.getValue(sig, "Model", " ", true);
            result.stepping = util$f.getValue(sig, "Stepping", " ", true);
            result.revision = "";
            const voltage = parseFloat(util$f.getValue(lines, "voltage"));
            result.voltage = isNaN(voltage) ? "" : voltage.toFixed(2);
            for (let i = 0; i < cache.length; i++) {
              lines = cache[i].split("\n");
              let cacheType = util$f.getValue(lines, "Socket Designation").toLowerCase().replace(" ", "-").split("-");
              cacheType = cacheType.length ? cacheType[0] : "";
              const sizeParts = util$f.getValue(lines, "Installed Size").split(" ");
              let size = parseInt(sizeParts[0], 10);
              const unit = sizeParts.length > 1 ? sizeParts[1] : "kb";
              size = size * (unit === "kb" ? 1024 : unit === "mb" ? 1024 * 1024 : unit === "gb" ? 1024 * 1024 * 1024 : 1);
              if (cacheType) {
                if (cacheType === "l1") {
                  result.cache[cacheType + "d"] = size / 2;
                  result.cache[cacheType + "i"] = size / 2;
                } else {
                  result.cache[cacheType] = size;
                }
              }
            }
            result.socket = util$f.getValue(lines, "Upgrade").replace("Socket", "").trim();
            const threadCount = util$f.getValue(lines, "thread count").trim();
            const coreCount = util$f.getValue(lines, "core count").trim();
            if (coreCount && threadCount) {
              result.cores = parseInt(threadCount, 10);
              result.physicalCores = parseInt(coreCount, 10);
            }
            resolve(result);
          });
        }
        if (_sunos$c) {
          resolve(result);
        }
        if (_windows$e) {
          try {
            const workload = [];
            workload.push(util$f.powerShell("Get-CimInstance Win32_processor | select Name, Revision, L2CacheSize, L3CacheSize, Manufacturer, MaxClockSpeed, Description, UpgradeMethod, Caption, NumberOfLogicalProcessors, NumberOfCores | fl"));
            workload.push(util$f.powerShell("Get-CimInstance Win32_CacheMemory | select CacheType,InstalledSize,Level | fl"));
            workload.push(util$f.powerShell("(Get-CimInstance Win32_ComputerSystem).HypervisorPresent"));
            Promise.all(
              workload
            ).then((data) => {
              let lines = data[0].split("\r\n");
              let name2 = util$f.getValue(lines, "name", ":") || "";
              if (name2.indexOf("@") >= 0) {
                result.brand = name2.split("@")[0].trim();
                result.speed = name2.split("@")[1] ? parseFloat(name2.split("@")[1].trim()) : 0;
                _cpu_speed = result.speed;
              } else {
                result.brand = name2.trim();
                result.speed = 0;
              }
              result = cpuBrandManufacturer(result);
              result.revision = util$f.getValue(lines, "revision", ":");
              result.vendor = util$f.getValue(lines, "manufacturer", ":");
              result.speedMax = Math.round(parseFloat(util$f.getValue(lines, "maxclockspeed", ":").replace(/,/g, ".")) / 10) / 100;
              if (result.speed === 0 && (result.brand.indexOf("AMD") > -1 || result.brand.toLowerCase().indexOf("ryzen") > -1)) {
                result.speed = getAMDSpeed(result.brand);
              }
              if (result.speed === 0) {
                result.speed = result.speedMax;
              }
              result.speedMin = result.speed;
              let description2 = util$f.getValue(lines, "description", ":").split(" ");
              for (let i = 0; i < description2.length; i++) {
                if (description2[i].toLowerCase().startsWith("family") && i + 1 < description2.length && description2[i + 1]) {
                  result.family = description2[i + 1];
                }
                if (description2[i].toLowerCase().startsWith("model") && i + 1 < description2.length && description2[i + 1]) {
                  result.model = description2[i + 1];
                }
                if (description2[i].toLowerCase().startsWith("stepping") && i + 1 < description2.length && description2[i + 1]) {
                  result.stepping = description2[i + 1];
                }
              }
              const socketId = util$f.getValue(lines, "UpgradeMethod", ":");
              if (socketTypes[socketId]) {
                result.socket = socketTypes[socketId];
              }
              const socketByName = getSocketTypesByName(name2);
              if (socketByName) {
                result.socket = socketByName;
              }
              const countProcessors = util$f.countLines(lines, "Caption");
              const countThreads = util$f.getValue(lines, "NumberOfLogicalProcessors", ":");
              const countCores = util$f.getValue(lines, "NumberOfCores", ":");
              if (countProcessors) {
                result.processors = parseInt(countProcessors) || 1;
              }
              if (countCores && countThreads) {
                result.cores = parseInt(countThreads) || util$f.cores();
                result.physicalCores = parseInt(countCores) || util$f.cores();
              }
              if (countProcessors > 1) {
                result.cores = result.cores * countProcessors;
                result.physicalCores = result.physicalCores * countProcessors;
              }
              result.cache = parseWinCache(data[0], data[1]);
              const hyperv = data[2] ? data[2].toString().toLowerCase() : "";
              result.virtualization = hyperv.indexOf("true") !== -1;
              resolve(result);
            });
          } catch (e) {
            resolve(result);
          }
        }
      });
    });
  });
}
function cpu(callback) {
  return new Promise((resolve) => {
    process.nextTick(() => {
      getCpu().then((result) => {
        if (callback) {
          callback(result);
        }
        resolve(result);
      });
    });
  });
}
cpu$1.cpu = cpu;
function getCpuCurrentSpeedSync() {
  let cpus = os$5.cpus();
  let minFreq = 999999999;
  let maxFreq = 0;
  let avgFreq = 0;
  let cores2 = [];
  if (cpus && cpus.length) {
    for (let i in cpus) {
      if ({}.hasOwnProperty.call(cpus, i)) {
        let freq = cpus[i].speed > 100 ? (cpus[i].speed + 1) / 1e3 : cpus[i].speed / 10;
        avgFreq = avgFreq + freq;
        if (freq > maxFreq) {
          maxFreq = freq;
        }
        if (freq < minFreq) {
          minFreq = freq;
        }
        cores2.push(parseFloat(freq.toFixed(2)));
      }
    }
    avgFreq = avgFreq / cpus.length;
    return {
      min: parseFloat(minFreq.toFixed(2)),
      max: parseFloat(maxFreq.toFixed(2)),
      avg: parseFloat(avgFreq.toFixed(2)),
      cores: cores2
    };
  } else {
    return {
      min: 0,
      max: 0,
      avg: 0,
      cores: cores2
    };
  }
}
function cpuCurrentSpeed(callback) {
  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = getCpuCurrentSpeedSync();
      if (result.avg === 0 && _cpu_speed !== 0) {
        const currCpuSpeed = parseFloat(_cpu_speed);
        result = {
          min: currCpuSpeed,
          max: currCpuSpeed,
          avg: currCpuSpeed,
          cores: []
        };
      }
      if (callback) {
        callback(result);
      }
      resolve(result);
    });
  });
}
cpu$1.cpuCurrentSpeed = cpuCurrentSpeed;
function cpuTemperature(callback) {
  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = {
        main: null,
        cores: [],
        max: null,
        socket: [],
        chipset: null
      };
      if (_linux$d) {
        try {
          const cmd2 = 'cat /sys/class/thermal/thermal_zone*/type  2>/dev/null; echo "-----"; cat /sys/class/thermal/thermal_zone*/temp 2>/dev/null;';
          const parts = execSync$8(cmd2).toString().split("-----\n");
          if (parts.length === 2) {
            const lines = parts[0].split("\n");
            const lines2 = parts[1].split("\n");
            for (let i = 0; i < lines.length; i++) {
              const line = lines[i].trim();
              if (line.startsWith("acpi") && lines2[i]) {
                result.socket.push(Math.round(parseInt(lines2[i], 10) / 100) / 10);
              }
              if (line.startsWith("pch") && lines2[i]) {
                result.chipset = Math.round(parseInt(lines2[i], 10) / 100) / 10;
              }
            }
          }
        } catch (e) {
          util$f.noop();
        }
        const cmd = 'for mon in /sys/class/hwmon/hwmon*; do for label in "$mon"/temp*_label; do if [ -f $label ]; then value=${label%_*}_input; echo $(cat "$label")___$(cat "$value"); fi; done; done;';
        try {
          exec$d(cmd, function(error, stdout) {
            stdout = stdout.toString();
            const tdiePos = stdout.toLowerCase().indexOf("tdie");
            if (tdiePos !== -1) {
              stdout = stdout.substring(tdiePos);
            }
            let lines = stdout.split("\n");
            let tctl = 0;
            lines.forEach((line) => {
              const parts = line.split("___");
              const label = parts[0];
              const value = parts.length > 1 && parts[1] ? parts[1] : "0";
              if (value && label && label.toLowerCase() === "tctl") {
                tctl = result.main = Math.round(parseInt(value, 10) / 100) / 10;
              }
              if (value && (label === void 0 || label && label.toLowerCase().startsWith("core"))) {
                result.cores.push(Math.round(parseInt(value, 10) / 100) / 10);
              } else if (value && label && result.main === null && (label.toLowerCase().indexOf("package") >= 0 || label.toLowerCase().indexOf("physical") >= 0 || label.toLowerCase() === "tccd1")) {
                result.main = Math.round(parseInt(value, 10) / 100) / 10;
              }
            });
            if (tctl && result.main === null) {
              result.main = tctl;
            }
            if (result.cores.length > 0) {
              if (result.main === null) {
                result.main = Math.round(result.cores.reduce((a, b) => a + b, 0) / result.cores.length);
              }
              let maxtmp = Math.max.apply(Math, result.cores);
              result.max = maxtmp > result.main ? maxtmp : result.main;
            }
            if (result.main !== null) {
              if (result.max === null) {
                result.max = result.main;
              }
              if (callback) {
                callback(result);
              }
              resolve(result);
              return;
            }
            exec$d("sensors", function(error2, stdout2) {
              if (!error2) {
                let lines2 = stdout2.toString().split("\n");
                let tdieTemp = null;
                let newSectionStarts = true;
                let section = "";
                lines2.forEach(function(line) {
                  if (line.trim() === "") {
                    newSectionStarts = true;
                  } else if (newSectionStarts) {
                    if (line.trim().toLowerCase().startsWith("acpi")) {
                      section = "acpi";
                    }
                    if (line.trim().toLowerCase().startsWith("pch")) {
                      section = "pch";
                    }
                    if (line.trim().toLowerCase().startsWith("core")) {
                      section = "core";
                    }
                    newSectionStarts = false;
                  }
                  let regex = /[+-]([^°]*)/g;
                  let temps = line.match(regex);
                  let firstPart = line.split(":")[0].toUpperCase();
                  if (section === "acpi") {
                    if (firstPart.indexOf("TEMP") !== -1) {
                      result.socket.push(parseFloat(temps));
                    }
                  } else if (section === "pch") {
                    if (firstPart.indexOf("TEMP") !== -1 && !result.chipset) {
                      result.chipset = parseFloat(temps);
                    }
                  }
                  if (firstPart.indexOf("PHYSICAL") !== -1 || firstPart.indexOf("PACKAGE") !== -1) {
                    result.main = parseFloat(temps);
                  }
                  if (firstPart.indexOf("CORE ") !== -1) {
                    result.cores.push(parseFloat(temps));
                  }
                  if (firstPart.indexOf("TDIE") !== -1 && tdieTemp === null) {
                    tdieTemp = parseFloat(temps);
                  }
                });
                if (result.cores.length > 0) {
                  result.main = Math.round(result.cores.reduce((a, b) => a + b, 0) / result.cores.length);
                  let maxtmp = Math.max.apply(Math, result.cores);
                  result.max = maxtmp > result.main ? maxtmp : result.main;
                } else {
                  if (result.main === null && tdieTemp !== null) {
                    result.main = tdieTemp;
                    result.max = tdieTemp;
                  }
                }
                if (result.main !== null || result.max !== null) {
                  if (callback) {
                    callback(result);
                  }
                  resolve(result);
                  return;
                }
              }
              fs$9.stat("/sys/class/thermal/thermal_zone0/temp", function(err) {
                if (err === null) {
                  fs$9.readFile("/sys/class/thermal/thermal_zone0/temp", function(error3, stdout3) {
                    if (!error3) {
                      let lines2 = stdout3.toString().split("\n");
                      if (lines2.length > 0) {
                        result.main = parseFloat(lines2[0]) / 1e3;
                        result.max = result.main;
                      }
                    }
                    if (callback) {
                      callback(result);
                    }
                    resolve(result);
                  });
                } else {
                  exec$d("/opt/vc/bin/vcgencmd measure_temp", function(error3, stdout3) {
                    if (!error3) {
                      let lines2 = stdout3.toString().split("\n");
                      if (lines2.length > 0 && lines2[0].indexOf("=")) {
                        result.main = parseFloat(lines2[0].split("=")[1]);
                        result.max = result.main;
                      }
                    }
                    if (callback) {
                      callback(result);
                    }
                    resolve(result);
                  });
                }
              });
            });
          });
        } catch (er) {
          if (callback) {
            callback(result);
          }
          resolve(result);
        }
      }
      if (_freebsd$c || _openbsd$c || _netbsd$c) {
        exec$d("sysctl dev.cpu | grep temp", function(error, stdout) {
          if (!error) {
            let lines = stdout.toString().split("\n");
            let sum = 0;
            lines.forEach(function(line) {
              const parts = line.split(":");
              if (parts.length > 1) {
                const temp = parseFloat(parts[1].replace(",", "."));
                if (temp > result.max) {
                  result.max = temp;
                }
                sum = sum + temp;
                result.cores.push(temp);
              }
            });
            if (result.cores.length) {
              result.main = Math.round(sum / result.cores.length * 100) / 100;
            }
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_darwin$d) {
        let osxTemp = null;
        try {
          osxTemp = require("osx-temperature-sensor");
        } catch (er) {
          osxTemp = null;
        }
        if (osxTemp) {
          result = osxTemp.cpuTemperature();
          if (result.main) {
            result.main = Math.round(result.main * 100) / 100;
          }
          if (result.max) {
            result.max = Math.round(result.max * 100) / 100;
          }
          if (result.cores && result.cores.length) {
            for (let i = 0; i < result.cores.length; i++) {
              result.cores[i] = Math.round(result.cores[i] * 100) / 100;
            }
          }
        }
        if (callback) {
          callback(result);
        }
        resolve(result);
      }
      if (_sunos$c) {
        if (callback) {
          callback(result);
        }
        resolve(result);
      }
      if (_windows$e) {
        try {
          util$f.powerShell('Get-CimInstance MSAcpi_ThermalZoneTemperature -Namespace "root/wmi" | Select CurrentTemperature').then((stdout, error) => {
            if (!error) {
              let sum = 0;
              let lines = stdout.split("\r\n").filter((line) => line.trim() !== "").filter((line, idx) => idx > 0);
              lines.forEach(function(line) {
                let value = (parseInt(line, 10) - 2732) / 10;
                if (!isNaN(value)) {
                  sum = sum + value;
                  if (value > result.max) {
                    result.max = value;
                  }
                  result.cores.push(value);
                }
              });
              if (result.cores.length) {
                result.main = sum / result.cores.length;
              }
            }
            if (callback) {
              callback(result);
            }
            resolve(result);
          });
        } catch (e) {
          if (callback) {
            callback(result);
          }
          resolve(result);
        }
      }
    });
  });
}
cpu$1.cpuTemperature = cpuTemperature;
function cpuFlags(callback) {
  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = "";
      if (_windows$e) {
        try {
          exec$d('reg query "HKEY_LOCAL_MACHINE\\HARDWARE\\DESCRIPTION\\System\\CentralProcessor\\0" /v FeatureSet', util$f.execOptsWin, function(error, stdout) {
            if (!error) {
              let flag_hex = stdout.split("0x").pop().trim();
              let flag_bin_unpadded = parseInt(flag_hex, 16).toString(2);
              let flag_bin = "0".repeat(32 - flag_bin_unpadded.length) + flag_bin_unpadded;
              let all_flags = [
                "fpu",
                "vme",
                "de",
                "pse",
                "tsc",
                "msr",
                "pae",
                "mce",
                "cx8",
                "apic",
                "",
                "sep",
                "mtrr",
                "pge",
                "mca",
                "cmov",
                "pat",
                "pse-36",
                "psn",
                "clfsh",
                "",
                "ds",
                "acpi",
                "mmx",
                "fxsr",
                "sse",
                "sse2",
                "ss",
                "htt",
                "tm",
                "ia64",
                "pbe"
              ];
              for (let f = 0; f < all_flags.length; f++) {
                if (flag_bin[f] === "1" && all_flags[f] !== "") {
                  result += " " + all_flags[f];
                }
              }
              result = result.trim().toLowerCase();
            }
            if (callback) {
              callback(result);
            }
            resolve(result);
          });
        } catch (e) {
          if (callback) {
            callback(result);
          }
          resolve(result);
        }
      }
      if (_linux$d) {
        try {
          exec$d("export LC_ALL=C; lscpu; unset LC_ALL", function(error, stdout) {
            if (!error) {
              let lines = stdout.toString().split("\n");
              lines.forEach(function(line) {
                if (line.split(":")[0].toUpperCase().indexOf("FLAGS") !== -1) {
                  result = line.split(":")[1].trim().toLowerCase();
                }
              });
            }
            if (!result) {
              fs$9.readFile("/proc/cpuinfo", function(error2, stdout2) {
                if (!error2) {
                  let lines = stdout2.toString().split("\n");
                  result = util$f.getValue(lines, "features", ":", true).toLowerCase();
                }
                if (callback) {
                  callback(result);
                }
                resolve(result);
              });
            } else {
              if (callback) {
                callback(result);
              }
              resolve(result);
            }
          });
        } catch (e) {
          if (callback) {
            callback(result);
          }
          resolve(result);
        }
      }
      if (_freebsd$c || _openbsd$c || _netbsd$c) {
        exec$d("export LC_ALL=C; dmidecode -t 4 2>/dev/null; unset LC_ALL", function(error, stdout) {
          let flags = [];
          if (!error) {
            let parts = stdout.toString().split("	Flags:");
            const lines = parts.length > 1 ? parts[1].split("	Version:")[0].split("\n") : [];
            lines.forEach(function(line) {
              let flag = (line.indexOf("(") ? line.split("(")[0].toLowerCase() : "").trim().replace(/\t/g, "");
              if (flag) {
                flags.push(flag);
              }
            });
          }
          result = flags.join(" ").trim().toLowerCase();
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_darwin$d) {
        exec$d("sysctl machdep.cpu.features", function(error, stdout) {
          if (!error) {
            let lines = stdout.toString().split("\n");
            if (lines.length > 0 && lines[0].indexOf("machdep.cpu.features:") !== -1) {
              result = lines[0].split(":")[1].trim().toLowerCase();
            }
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_sunos$c) {
        if (callback) {
          callback(result);
        }
        resolve(result);
      }
    });
  });
}
cpu$1.cpuFlags = cpuFlags;
function cpuCache(callback) {
  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = {
        l1d: null,
        l1i: null,
        l2: null,
        l3: null
      };
      if (_linux$d) {
        try {
          exec$d("export LC_ALL=C; lscpu; unset LC_ALL", function(error, stdout) {
            if (!error) {
              let lines = stdout.toString().split("\n");
              lines.forEach(function(line) {
                let parts = line.split(":");
                if (parts[0].toUpperCase().indexOf("L1D CACHE") !== -1) {
                  result.l1d = parseInt(parts[1].trim()) * (parts[1].indexOf("M") !== -1 ? 1024 * 1024 : parts[1].indexOf("K") !== -1 ? 1024 : 1);
                }
                if (parts[0].toUpperCase().indexOf("L1I CACHE") !== -1) {
                  result.l1i = parseInt(parts[1].trim()) * (parts[1].indexOf("M") !== -1 ? 1024 * 1024 : parts[1].indexOf("K") !== -1 ? 1024 : 1);
                }
                if (parts[0].toUpperCase().indexOf("L2 CACHE") !== -1) {
                  result.l2 = parseInt(parts[1].trim()) * (parts[1].indexOf("M") !== -1 ? 1024 * 1024 : parts[1].indexOf("K") !== -1 ? 1024 : 1);
                }
                if (parts[0].toUpperCase().indexOf("L3 CACHE") !== -1) {
                  result.l3 = parseInt(parts[1].trim()) * (parts[1].indexOf("M") !== -1 ? 1024 * 1024 : parts[1].indexOf("K") !== -1 ? 1024 : 1);
                }
              });
            }
            if (callback) {
              callback(result);
            }
            resolve(result);
          });
        } catch (e) {
          if (callback) {
            callback(result);
          }
          resolve(result);
        }
      }
      if (_freebsd$c || _openbsd$c || _netbsd$c) {
        exec$d("export LC_ALL=C; dmidecode -t 7 2>/dev/null; unset LC_ALL", function(error, stdout) {
          let cache = [];
          if (!error) {
            const data = stdout.toString();
            cache = data.split("Cache Information");
            cache.shift();
          }
          for (let i = 0; i < cache.length; i++) {
            const lines = cache[i].split("\n");
            let cacheType = util$f.getValue(lines, "Socket Designation").toLowerCase().replace(" ", "-").split("-");
            cacheType = cacheType.length ? cacheType[0] : "";
            const sizeParts = util$f.getValue(lines, "Installed Size").split(" ");
            let size = parseInt(sizeParts[0], 10);
            const unit = sizeParts.length > 1 ? sizeParts[1] : "kb";
            size = size * (unit === "kb" ? 1024 : unit === "mb" ? 1024 * 1024 : unit === "gb" ? 1024 * 1024 * 1024 : 1);
            if (cacheType) {
              if (cacheType === "l1") {
                result.cache[cacheType + "d"] = size / 2;
                result.cache[cacheType + "i"] = size / 2;
              } else {
                result.cache[cacheType] = size;
              }
            }
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_darwin$d) {
        exec$d("sysctl hw.l1icachesize hw.l1dcachesize hw.l2cachesize hw.l3cachesize", function(error, stdout) {
          if (!error) {
            let lines = stdout.toString().split("\n");
            lines.forEach(function(line) {
              let parts = line.split(":");
              if (parts[0].toLowerCase().indexOf("hw.l1icachesize") !== -1) {
                result.l1d = parseInt(parts[1].trim()) * (parts[1].indexOf("K") !== -1 ? 1024 : 1);
              }
              if (parts[0].toLowerCase().indexOf("hw.l1dcachesize") !== -1) {
                result.l1i = parseInt(parts[1].trim()) * (parts[1].indexOf("K") !== -1 ? 1024 : 1);
              }
              if (parts[0].toLowerCase().indexOf("hw.l2cachesize") !== -1) {
                result.l2 = parseInt(parts[1].trim()) * (parts[1].indexOf("K") !== -1 ? 1024 : 1);
              }
              if (parts[0].toLowerCase().indexOf("hw.l3cachesize") !== -1) {
                result.l3 = parseInt(parts[1].trim()) * (parts[1].indexOf("K") !== -1 ? 1024 : 1);
              }
            });
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_sunos$c) {
        if (callback) {
          callback(result);
        }
        resolve(result);
      }
      if (_windows$e) {
        try {
          const workload = [];
          workload.push(util$f.powerShell("Get-CimInstance Win32_processor | select L2CacheSize, L3CacheSize | fl"));
          workload.push(util$f.powerShell("Get-CimInstance Win32_CacheMemory | select CacheType,InstalledSize,Level | fl"));
          Promise.all(
            workload
          ).then((data) => {
            result = parseWinCache(data[0], data[1]);
            if (callback) {
              callback(result);
            }
            resolve(result);
          });
        } catch (e) {
          if (callback) {
            callback(result);
          }
          resolve(result);
        }
      }
    });
  });
}
function parseWinCache(linesProc, linesCache) {
  let result = {
    l1d: null,
    l1i: null,
    l2: null,
    l3: null
  };
  let lines = linesProc.split("\r\n");
  result.l1d = 0;
  result.l1i = 0;
  result.l2 = util$f.getValue(lines, "l2cachesize", ":");
  result.l3 = util$f.getValue(lines, "l3cachesize", ":");
  if (result.l2) {
    result.l2 = parseInt(result.l2, 10) * 1024;
  } else {
    result.l2 = 0;
  }
  if (result.l3) {
    result.l3 = parseInt(result.l3, 10) * 1024;
  } else {
    result.l3 = 0;
  }
  const parts = linesCache.split(/\n\s*\n/);
  let l1i = 0;
  let l1d = 0;
  let l2 = 0;
  parts.forEach(function(part) {
    const lines2 = part.split("\r\n");
    const cacheType = util$f.getValue(lines2, "CacheType");
    const level = util$f.getValue(lines2, "Level");
    const installedSize = util$f.getValue(lines2, "InstalledSize");
    if (level === "3" && cacheType === "3") {
      result.l1i = result.l1i + parseInt(installedSize, 10) * 1024;
    }
    if (level === "3" && cacheType === "4") {
      result.l1d = result.l1d + parseInt(installedSize, 10) * 1024;
    }
    if (level === "3" && cacheType === "5") {
      l1i = parseInt(installedSize, 10) / 2;
      l1d = parseInt(installedSize, 10) / 2;
    }
    if (level === "4" && cacheType === "5") {
      l2 = l2 + parseInt(installedSize, 10) * 1024;
    }
  });
  if (!result.l1i && !result.l1d) {
    result.l1i = l1i;
    result.l1d = l1d;
  }
  if (l2) {
    result.l2 = l2;
  }
  return result;
}
cpu$1.cpuCache = cpuCache;
function getLoad() {
  return new Promise((resolve) => {
    process.nextTick(() => {
      let loads = os$5.loadavg().map(function(x) {
        return x / util$f.cores();
      });
      let avgLoad = parseFloat(Math.max.apply(Math, loads).toFixed(2));
      let result = {};
      let now = Date.now() - _current_cpu.ms;
      if (now >= 200) {
        _current_cpu.ms = Date.now();
        const cpus = os$5.cpus().map(function(cpu2) {
          cpu2.times.steal = 0;
          cpu2.times.guest = 0;
          return cpu2;
        });
        let totalUser = 0;
        let totalSystem = 0;
        let totalNice = 0;
        let totalIrq = 0;
        let totalIdle = 0;
        let totalSteal = 0;
        let totalGuest = 0;
        let cores2 = [];
        _corecount = cpus && cpus.length ? cpus.length : 0;
        if (_linux$d) {
          try {
            const lines = execSync$8("cat /proc/stat 2>/dev/null | grep cpu", { encoding: "utf8" }).toString().split("\n");
            if (lines.length > 1) {
              lines.shift();
              if (lines.length === cpus.length) {
                for (let i = 0; i < lines.length; i++) {
                  let parts = lines[i].split(" ");
                  if (parts.length >= 10) {
                    const steal = parseFloat(parts[8]) || 0;
                    const guest = parseFloat(parts[9]) || 0;
                    cpus[i].times.steal = steal;
                    cpus[i].times.guest = guest;
                  }
                }
              }
            }
          } catch (e) {
            util$f.noop();
          }
        }
        for (let i = 0; i < _corecount; i++) {
          const cpu2 = cpus[i].times;
          totalUser += cpu2.user;
          totalSystem += cpu2.sys;
          totalNice += cpu2.nice;
          totalIdle += cpu2.idle;
          totalIrq += cpu2.irq;
          totalSteal += cpu2.steal || 0;
          totalGuest += cpu2.guest || 0;
          let tmpTick = _cpus && _cpus[i] && _cpus[i].totalTick ? _cpus[i].totalTick : 0;
          let tmpLoad = _cpus && _cpus[i] && _cpus[i].totalLoad ? _cpus[i].totalLoad : 0;
          let tmpUser = _cpus && _cpus[i] && _cpus[i].user ? _cpus[i].user : 0;
          let tmpSystem = _cpus && _cpus[i] && _cpus[i].sys ? _cpus[i].sys : 0;
          let tmpNice = _cpus && _cpus[i] && _cpus[i].nice ? _cpus[i].nice : 0;
          let tmpIdle = _cpus && _cpus[i] && _cpus[i].idle ? _cpus[i].idle : 0;
          let tmpIrq = _cpus && _cpus[i] && _cpus[i].irq ? _cpus[i].irq : 0;
          let tmpSteal = _cpus && _cpus[i] && _cpus[i].steal ? _cpus[i].steal : 0;
          let tmpGuest = _cpus && _cpus[i] && _cpus[i].guest ? _cpus[i].guest : 0;
          _cpus[i] = cpu2;
          _cpus[i].totalTick = _cpus[i].user + _cpus[i].sys + _cpus[i].nice + _cpus[i].irq + _cpus[i].steal + _cpus[i].guest + _cpus[i].idle;
          _cpus[i].totalLoad = _cpus[i].user + _cpus[i].sys + _cpus[i].nice + _cpus[i].irq + _cpus[i].steal + _cpus[i].guest;
          _cpus[i].currentTick = _cpus[i].totalTick - tmpTick;
          _cpus[i].load = _cpus[i].totalLoad - tmpLoad;
          _cpus[i].loadUser = _cpus[i].user - tmpUser;
          _cpus[i].loadSystem = _cpus[i].sys - tmpSystem;
          _cpus[i].loadNice = _cpus[i].nice - tmpNice;
          _cpus[i].loadIdle = _cpus[i].idle - tmpIdle;
          _cpus[i].loadIrq = _cpus[i].irq - tmpIrq;
          _cpus[i].loadSteal = _cpus[i].steal - tmpSteal;
          _cpus[i].loadGuest = _cpus[i].guest - tmpGuest;
          cores2[i] = {};
          cores2[i].load = _cpus[i].load / _cpus[i].currentTick * 100;
          cores2[i].loadUser = _cpus[i].loadUser / _cpus[i].currentTick * 100;
          cores2[i].loadSystem = _cpus[i].loadSystem / _cpus[i].currentTick * 100;
          cores2[i].loadNice = _cpus[i].loadNice / _cpus[i].currentTick * 100;
          cores2[i].loadIdle = _cpus[i].loadIdle / _cpus[i].currentTick * 100;
          cores2[i].loadIrq = _cpus[i].loadIrq / _cpus[i].currentTick * 100;
          cores2[i].loadSteal = _cpus[i].loadSteal / _cpus[i].currentTick * 100;
          cores2[i].loadGuest = _cpus[i].loadGuest / _cpus[i].currentTick * 100;
          cores2[i].rawLoad = _cpus[i].load;
          cores2[i].rawLoadUser = _cpus[i].loadUser;
          cores2[i].rawLoadSystem = _cpus[i].loadSystem;
          cores2[i].rawLoadNice = _cpus[i].loadNice;
          cores2[i].rawLoadIdle = _cpus[i].loadIdle;
          cores2[i].rawLoadIrq = _cpus[i].loadIrq;
          cores2[i].rawLoadSteal = _cpus[i].loadSteal;
          cores2[i].rawLoadGuest = _cpus[i].loadGuest;
        }
        let totalTick = totalUser + totalSystem + totalNice + totalIrq + totalSteal + totalGuest + totalIdle;
        let totalLoad = totalUser + totalSystem + totalNice + totalIrq + totalSteal + totalGuest;
        let currentTick = totalTick - _current_cpu.tick;
        result = {
          avgLoad,
          currentLoad: (totalLoad - _current_cpu.load) / currentTick * 100,
          currentLoadUser: (totalUser - _current_cpu.user) / currentTick * 100,
          currentLoadSystem: (totalSystem - _current_cpu.system) / currentTick * 100,
          currentLoadNice: (totalNice - _current_cpu.nice) / currentTick * 100,
          currentLoadIdle: (totalIdle - _current_cpu.idle) / currentTick * 100,
          currentLoadIrq: (totalIrq - _current_cpu.irq) / currentTick * 100,
          currentLoadSteal: (totalSteal - _current_cpu.steal) / currentTick * 100,
          currentLoadGuest: (totalGuest - _current_cpu.guest) / currentTick * 100,
          rawCurrentLoad: totalLoad - _current_cpu.load,
          rawCurrentLoadUser: totalUser - _current_cpu.user,
          rawCurrentLoadSystem: totalSystem - _current_cpu.system,
          rawCurrentLoadNice: totalNice - _current_cpu.nice,
          rawCurrentLoadIdle: totalIdle - _current_cpu.idle,
          rawCurrentLoadIrq: totalIrq - _current_cpu.irq,
          rawCurrentLoadSteal: totalSteal - _current_cpu.steal,
          rawCurrentLoadGuest: totalGuest - _current_cpu.guest,
          cpus: cores2
        };
        _current_cpu = {
          user: totalUser,
          nice: totalNice,
          system: totalSystem,
          idle: totalIdle,
          irq: totalIrq,
          steal: totalSteal,
          guest: totalGuest,
          tick: totalTick,
          load: totalLoad,
          ms: _current_cpu.ms,
          currentLoad: result.currentLoad,
          currentLoadUser: result.currentLoadUser,
          currentLoadSystem: result.currentLoadSystem,
          currentLoadNice: result.currentLoadNice,
          currentLoadIdle: result.currentLoadIdle,
          currentLoadIrq: result.currentLoadIrq,
          currentLoadSteal: result.currentLoadSteal,
          currentLoadGuest: result.currentLoadGuest,
          rawCurrentLoad: result.rawCurrentLoad,
          rawCurrentLoadUser: result.rawCurrentLoadUser,
          rawCurrentLoadSystem: result.rawCurrentLoadSystem,
          rawCurrentLoadNice: result.rawCurrentLoadNice,
          rawCurrentLoadIdle: result.rawCurrentLoadIdle,
          rawCurrentLoadIrq: result.rawCurrentLoadIrq,
          rawCurrentLoadSteal: result.rawCurrentLoadSteal,
          rawCurrentLoadGuest: result.rawCurrentLoadGuest
        };
      } else {
        let cores2 = [];
        for (let i = 0; i < _corecount; i++) {
          cores2[i] = {};
          cores2[i].load = _cpus[i].load / _cpus[i].currentTick * 100;
          cores2[i].loadUser = _cpus[i].loadUser / _cpus[i].currentTick * 100;
          cores2[i].loadSystem = _cpus[i].loadSystem / _cpus[i].currentTick * 100;
          cores2[i].loadNice = _cpus[i].loadNice / _cpus[i].currentTick * 100;
          cores2[i].loadIdle = _cpus[i].loadIdle / _cpus[i].currentTick * 100;
          cores2[i].loadIrq = _cpus[i].loadIrq / _cpus[i].currentTick * 100;
          cores2[i].rawLoad = _cpus[i].load;
          cores2[i].rawLoadUser = _cpus[i].loadUser;
          cores2[i].rawLoadSystem = _cpus[i].loadSystem;
          cores2[i].rawLoadNice = _cpus[i].loadNice;
          cores2[i].rawLoadIdle = _cpus[i].loadIdle;
          cores2[i].rawLoadIrq = _cpus[i].loadIrq;
          cores2[i].rawLoadSteal = _cpus[i].loadSteal;
          cores2[i].rawLoadGuest = _cpus[i].loadGuest;
        }
        result = {
          avgLoad,
          currentLoad: _current_cpu.currentLoad,
          currentLoadUser: _current_cpu.currentLoadUser,
          currentLoadSystem: _current_cpu.currentLoadSystem,
          currentLoadNice: _current_cpu.currentLoadNice,
          currentLoadIdle: _current_cpu.currentLoadIdle,
          currentLoadIrq: _current_cpu.currentLoadIrq,
          currentLoadSteal: _current_cpu.currentLoadSteal,
          currentLoadGuest: _current_cpu.currentLoadGuest,
          rawCurrentLoad: _current_cpu.rawCurrentLoad,
          rawCurrentLoadUser: _current_cpu.rawCurrentLoadUser,
          rawCurrentLoadSystem: _current_cpu.rawCurrentLoadSystem,
          rawCurrentLoadNice: _current_cpu.rawCurrentLoadNice,
          rawCurrentLoadIdle: _current_cpu.rawCurrentLoadIdle,
          rawCurrentLoadIrq: _current_cpu.rawCurrentLoadIrq,
          rawCurrentLoadSteal: _current_cpu.rawCurrentLoadSteal,
          rawCurrentLoadGuest: _current_cpu.rawCurrentLoadGuest,
          cpus: cores2
        };
      }
      resolve(result);
    });
  });
}
function currentLoad(callback) {
  return new Promise((resolve) => {
    process.nextTick(() => {
      getLoad().then((result) => {
        if (callback) {
          callback(result);
        }
        resolve(result);
      });
    });
  });
}
cpu$1.currentLoad = currentLoad;
function getFullLoad() {
  return new Promise((resolve) => {
    process.nextTick(() => {
      const cpus = os$5.cpus();
      let totalUser = 0;
      let totalSystem = 0;
      let totalNice = 0;
      let totalIrq = 0;
      let totalIdle = 0;
      let result = 0;
      if (cpus && cpus.length) {
        for (let i = 0, len = cpus.length; i < len; i++) {
          const cpu2 = cpus[i].times;
          totalUser += cpu2.user;
          totalSystem += cpu2.sys;
          totalNice += cpu2.nice;
          totalIrq += cpu2.irq;
          totalIdle += cpu2.idle;
        }
        let totalTicks = totalIdle + totalIrq + totalNice + totalSystem + totalUser;
        result = (totalTicks - totalIdle) / totalTicks * 100;
      }
      resolve(result);
    });
  });
}
function fullLoad(callback) {
  return new Promise((resolve) => {
    process.nextTick(() => {
      getFullLoad().then((result) => {
        if (callback) {
          callback(result);
        }
        resolve(result);
      });
    });
  });
}
cpu$1.fullLoad = fullLoad;
var memory = {};
const os$4 = require$$0$1;
const exec$c = require$$1.exec;
const execSync$7 = require$$1.execSync;
const util$e = util$j;
const fs$8 = require$$1$1;
let _platform$d = process.platform;
const _linux$c = _platform$d === "linux" || _platform$d === "android";
const _darwin$c = _platform$d === "darwin";
const _windows$d = _platform$d === "win32";
const _freebsd$b = _platform$d === "freebsd";
const _openbsd$b = _platform$d === "openbsd";
const _netbsd$b = _platform$d === "netbsd";
const _sunos$b = _platform$d === "sunos";
const OSX_RAM_manufacturers = {
  "0x014F": "Transcend Information",
  "0x2C00": "Micron Technology Inc.",
  "0x802C": "Micron Technology Inc.",
  "0x80AD": "Hynix Semiconductor Inc.",
  "0x80CE": "Samsung Electronics Inc.",
  "0xAD00": "Hynix Semiconductor Inc.",
  "0xCE00": "Samsung Electronics Inc.",
  "0x02FE": "Elpida",
  "0x5105": "Qimonda AG i. In.",
  "0x8551": "Qimonda AG i. In.",
  "0x859B": "Crucial",
  "0x04CD": "G-Skill"
};
const LINUX_RAM_manufacturers = {
  "017A": "Apacer",
  "0198": "HyperX",
  "029E": "Corsair",
  "04CB": "A-DATA",
  "04CD": "G-Skill",
  "059B": "Crucial",
  "00CE": "Samsung",
  "1315": "Crutial",
  "014F": "Transcend Information",
  "2C00": "Micron Technology Inc.",
  "802C": "Micron Technology Inc.",
  "80AD": "Hynix Semiconductor Inc.",
  "80CE": "Samsung Electronics Inc.",
  "AD00": "Hynix Semiconductor Inc.",
  "CE00": "Samsung Electronics Inc.",
  "02FE": "Elpida",
  "5105": "Qimonda AG i. In.",
  "8551": "Qimonda AG i. In.",
  "859B": "Crucial"
};
function mem(callback) {
  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = {
        total: os$4.totalmem(),
        free: os$4.freemem(),
        used: os$4.totalmem() - os$4.freemem(),
        active: os$4.totalmem() - os$4.freemem(),
        // temporarily (fallback)
        available: os$4.freemem(),
        // temporarily (fallback)
        buffers: 0,
        cached: 0,
        slab: 0,
        buffcache: 0,
        swaptotal: 0,
        swapused: 0,
        swapfree: 0,
        writeback: null,
        dirty: null
      };
      if (_linux$c) {
        try {
          fs$8.readFile("/proc/meminfo", function(error, stdout) {
            if (!error) {
              const lines = stdout.toString().split("\n");
              result.total = parseInt(util$e.getValue(lines, "memtotal"), 10);
              result.total = result.total ? result.total * 1024 : os$4.totalmem();
              result.free = parseInt(util$e.getValue(lines, "memfree"), 10);
              result.free = result.free ? result.free * 1024 : os$4.freemem();
              result.used = result.total - result.free;
              result.buffers = parseInt(util$e.getValue(lines, "buffers"), 10);
              result.buffers = result.buffers ? result.buffers * 1024 : 0;
              result.cached = parseInt(util$e.getValue(lines, "cached"), 10);
              result.cached = result.cached ? result.cached * 1024 : 0;
              result.slab = parseInt(util$e.getValue(lines, "slab"), 10);
              result.slab = result.slab ? result.slab * 1024 : 0;
              result.buffcache = result.buffers + result.cached + result.slab;
              let available = parseInt(util$e.getValue(lines, "memavailable"), 10);
              result.available = available ? available * 1024 : result.free + result.buffcache;
              result.active = result.total - result.available;
              result.swaptotal = parseInt(util$e.getValue(lines, "swaptotal"), 10);
              result.swaptotal = result.swaptotal ? result.swaptotal * 1024 : 0;
              result.swapfree = parseInt(util$e.getValue(lines, "swapfree"), 10);
              result.swapfree = result.swapfree ? result.swapfree * 1024 : 0;
              result.swapused = result.swaptotal - result.swapfree;
              result.writeback = parseInt(util$e.getValue(lines, "writeback"), 10);
              result.writeback = result.writeback ? result.writeback * 1024 : 0;
              result.dirty = parseInt(util$e.getValue(lines, "dirty"), 10);
              result.dirty = result.dirty ? result.dirty * 1024 : 0;
            }
            if (callback) {
              callback(result);
            }
            resolve(result);
          });
        } catch (e) {
          if (callback) {
            callback(result);
          }
          resolve(result);
        }
      }
      if (_freebsd$b || _openbsd$b || _netbsd$b) {
        try {
          exec$c("/sbin/sysctl hw.realmem hw.physmem vm.stats.vm.v_page_count vm.stats.vm.v_wire_count vm.stats.vm.v_active_count vm.stats.vm.v_inactive_count vm.stats.vm.v_cache_count vm.stats.vm.v_free_count vm.stats.vm.v_page_size", function(error, stdout) {
            if (!error) {
              let lines = stdout.toString().split("\n");
              const pagesize = parseInt(util$e.getValue(lines, "vm.stats.vm.v_page_size"), 10);
              const inactive = parseInt(util$e.getValue(lines, "vm.stats.vm.v_inactive_count"), 10) * pagesize;
              const cache = parseInt(util$e.getValue(lines, "vm.stats.vm.v_cache_count"), 10) * pagesize;
              result.total = parseInt(util$e.getValue(lines, "hw.realmem"), 10);
              if (isNaN(result.total)) {
                result.total = parseInt(util$e.getValue(lines, "hw.physmem"), 10);
              }
              result.free = parseInt(util$e.getValue(lines, "vm.stats.vm.v_free_count"), 10) * pagesize;
              result.buffcache = inactive + cache;
              result.available = result.buffcache + result.free;
              result.active = result.total - result.free - result.buffcache;
              result.swaptotal = 0;
              result.swapfree = 0;
              result.swapused = 0;
            }
            if (callback) {
              callback(result);
            }
            resolve(result);
          });
        } catch (e) {
          if (callback) {
            callback(result);
          }
          resolve(result);
        }
      }
      if (_sunos$b) {
        if (callback) {
          callback(result);
        }
        resolve(result);
      }
      if (_darwin$c) {
        let pageSize = 4096;
        try {
          let sysPpageSize = util$e.toInt(execSync$7("sysctl -n vm.pagesize").toString());
          pageSize = sysPpageSize || pageSize;
        } catch (e) {
          util$e.noop();
        }
        try {
          exec$c('vm_stat 2>/dev/null | grep "Pages active"', function(error, stdout) {
            if (!error) {
              let lines = stdout.toString().split("\n");
              result.active = parseInt(lines[0].split(":")[1], 10) * pageSize;
              result.buffcache = result.used - result.active;
              result.available = result.free + result.buffcache;
            }
            exec$c("sysctl -n vm.swapusage 2>/dev/null", function(error2, stdout2) {
              if (!error2) {
                let lines = stdout2.toString().split("\n");
                if (lines.length > 0) {
                  let firstline = lines[0].replace(/,/g, ".").replace(/M/g, "");
                  let lineArray = firstline.trim().split("  ");
                  lineArray.forEach((line) => {
                    if (line.toLowerCase().indexOf("total") !== -1) {
                      result.swaptotal = parseFloat(line.split("=")[1].trim()) * 1024 * 1024;
                    }
                    if (line.toLowerCase().indexOf("used") !== -1) {
                      result.swapused = parseFloat(line.split("=")[1].trim()) * 1024 * 1024;
                    }
                    if (line.toLowerCase().indexOf("free") !== -1) {
                      result.swapfree = parseFloat(line.split("=")[1].trim()) * 1024 * 1024;
                    }
                  });
                }
              }
              if (callback) {
                callback(result);
              }
              resolve(result);
            });
          });
        } catch (e) {
          if (callback) {
            callback(result);
          }
          resolve(result);
        }
      }
      if (_windows$d) {
        let swaptotal = 0;
        let swapused = 0;
        try {
          util$e.powerShell("Get-CimInstance Win32_PageFileUsage | Select AllocatedBaseSize, CurrentUsage").then((stdout, error) => {
            if (!error) {
              let lines = stdout.split("\r\n").filter((line) => line.trim() !== "").filter((line, idx) => idx > 0);
              lines.forEach(function(line) {
                if (line !== "") {
                  line = line.trim().split(/\s\s+/);
                  swaptotal = swaptotal + (parseInt(line[0], 10) || 0);
                  swapused = swapused + (parseInt(line[1], 10) || 0);
                }
              });
            }
            result.swaptotal = swaptotal * 1024 * 1024;
            result.swapused = swapused * 1024 * 1024;
            result.swapfree = result.swaptotal - result.swapused;
            if (callback) {
              callback(result);
            }
            resolve(result);
          });
        } catch (e) {
          if (callback) {
            callback(result);
          }
          resolve(result);
        }
      }
    });
  });
}
memory.mem = mem;
function memLayout(callback) {
  function getManufacturerDarwin(manId) {
    if ({}.hasOwnProperty.call(OSX_RAM_manufacturers, manId)) {
      return OSX_RAM_manufacturers[manId];
    }
    return manId;
  }
  function getManufacturerLinux(manId) {
    const manIdSearch = manId.replace("0x", "").toUpperCase();
    if (manIdSearch.length === 4 && {}.hasOwnProperty.call(LINUX_RAM_manufacturers, manIdSearch)) {
      return LINUX_RAM_manufacturers[manIdSearch];
    }
    return manId;
  }
  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = [];
      if (_linux$c || _freebsd$b || _openbsd$b || _netbsd$b) {
        exec$c('export LC_ALL=C; dmidecode -t memory 2>/dev/null | grep -iE "Size:|Type|Speed|Manufacturer|Form Factor|Locator|Memory Device|Serial Number|Voltage|Part Number"; unset LC_ALL', function(error, stdout) {
          if (!error) {
            let devices = stdout.toString().split("Memory Device");
            devices.shift();
            devices.forEach(function(device) {
              let lines = device.split("\n");
              const sizeString = util$e.getValue(lines, "Size");
              const size = sizeString.indexOf("GB") >= 0 ? parseInt(sizeString, 10) * 1024 * 1024 * 1024 : parseInt(sizeString, 10) * 1024 * 1024;
              let bank = util$e.getValue(lines, "Bank Locator");
              if (bank.toLowerCase().indexOf("bad") >= 0) {
                bank = "";
              }
              if (parseInt(util$e.getValue(lines, "Size"), 10) > 0) {
                const totalWidth = util$e.toInt(util$e.getValue(lines, "Total Width"));
                const dataWidth = util$e.toInt(util$e.getValue(lines, "Data Width"));
                result.push({
                  size,
                  bank,
                  type: util$e.getValue(lines, "Type:"),
                  ecc: dataWidth && totalWidth ? totalWidth > dataWidth : false,
                  clockSpeed: util$e.getValue(lines, "Configured Clock Speed:") ? parseInt(util$e.getValue(lines, "Configured Clock Speed:"), 10) : util$e.getValue(lines, "Speed:") ? parseInt(util$e.getValue(lines, "Speed:"), 10) : null,
                  formFactor: util$e.getValue(lines, "Form Factor:"),
                  manufacturer: getManufacturerLinux(util$e.getValue(lines, "Manufacturer:")),
                  partNum: util$e.getValue(lines, "Part Number:"),
                  serialNum: util$e.getValue(lines, "Serial Number:"),
                  voltageConfigured: parseFloat(util$e.getValue(lines, "Configured Voltage:")) || null,
                  voltageMin: parseFloat(util$e.getValue(lines, "Minimum Voltage:")) || null,
                  voltageMax: parseFloat(util$e.getValue(lines, "Maximum Voltage:")) || null
                });
              } else {
                result.push({
                  size: 0,
                  bank,
                  type: "Empty",
                  ecc: null,
                  clockSpeed: 0,
                  formFactor: util$e.getValue(lines, "Form Factor:"),
                  partNum: "",
                  serialNum: "",
                  voltageConfigured: null,
                  voltageMin: null,
                  voltageMax: null
                });
              }
            });
          }
          if (!result.length) {
            result.push({
              size: os$4.totalmem(),
              bank: "",
              type: "",
              ecc: null,
              clockSpeed: 0,
              formFactor: "",
              partNum: "",
              serialNum: "",
              voltageConfigured: null,
              voltageMin: null,
              voltageMax: null
            });
            try {
              let stdout2 = execSync$7("cat /proc/cpuinfo 2>/dev/null");
              let lines = stdout2.toString().split("\n");
              let model = util$e.getValue(lines, "hardware", ":", true).toUpperCase();
              let version2 = util$e.getValue(lines, "revision", ":", true).toLowerCase();
              if (model === "BCM2835" || model === "BCM2708" || model === "BCM2709" || model === "BCM2835" || model === "BCM2837") {
                const clockSpeed = {
                  "0": 400,
                  "1": 450,
                  "2": 450,
                  "3": 3200
                };
                result[0].type = "LPDDR2";
                result[0].type = version2 && version2[2] && version2[2] === "3" ? "LPDDR4" : result[0].type;
                result[0].ecc = false;
                result[0].clockSpeed = version2 && version2[2] && clockSpeed[version2[2]] || 400;
                result[0].clockSpeed = version2 && version2[4] && version2[4] === "d" ? 500 : result[0].clockSpeed;
                result[0].formFactor = "SoC";
                stdout2 = execSync$7("vcgencmd get_config sdram_freq 2>/dev/null");
                lines = stdout2.toString().split("\n");
                let freq = parseInt(util$e.getValue(lines, "sdram_freq", "=", true), 10) || 0;
                if (freq) {
                  result[0].clockSpeed = freq;
                }
                stdout2 = execSync$7("vcgencmd measure_volts sdram_p 2>/dev/null");
                lines = stdout2.toString().split("\n");
                let voltage = parseFloat(util$e.getValue(lines, "volt", "=", true)) || 0;
                if (voltage) {
                  result[0].voltageConfigured = voltage;
                  result[0].voltageMin = voltage;
                  result[0].voltageMax = voltage;
                }
              }
            } catch (e) {
              util$e.noop();
            }
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_darwin$c) {
        exec$c("system_profiler SPMemoryDataType", function(error, stdout) {
          if (!error) {
            const allLines = stdout.toString().split("\n");
            const eccStatus = util$e.getValue(allLines, "ecc", ":", true).toLowerCase();
            let devices = stdout.toString().split("        BANK ");
            let hasBank = true;
            if (devices.length === 1) {
              devices = stdout.toString().split("        DIMM");
              hasBank = false;
            }
            devices.shift();
            devices.forEach(function(device) {
              let lines = device.split("\n");
              const bank = (hasBank ? "BANK " : "DIMM") + lines[0].trim().split("/")[0];
              const size = parseInt(util$e.getValue(lines, "          Size"));
              if (size) {
                result.push({
                  size: size * 1024 * 1024 * 1024,
                  bank,
                  type: util$e.getValue(lines, "          Type:"),
                  ecc: eccStatus ? eccStatus === "enabled" : null,
                  clockSpeed: parseInt(util$e.getValue(lines, "          Speed:"), 10),
                  formFactor: "",
                  manufacturer: getManufacturerDarwin(util$e.getValue(lines, "          Manufacturer:")),
                  partNum: util$e.getValue(lines, "          Part Number:"),
                  serialNum: util$e.getValue(lines, "          Serial Number:"),
                  voltageConfigured: null,
                  voltageMin: null,
                  voltageMax: null
                });
              } else {
                result.push({
                  size: 0,
                  bank,
                  type: "Empty",
                  ecc: null,
                  clockSpeed: 0,
                  formFactor: "",
                  manufacturer: "",
                  partNum: "",
                  serialNum: "",
                  voltageConfigured: null,
                  voltageMin: null,
                  voltageMax: null
                });
              }
            });
          }
          if (!result.length) {
            const lines = stdout.toString().split("\n");
            const size = parseInt(util$e.getValue(lines, "      Memory:"));
            const type = util$e.getValue(lines, "      Type:");
            if (size && type) {
              result.push({
                size: size * 1024 * 1024 * 1024,
                bank: "0",
                type,
                ecc: false,
                clockSpeed: 0,
                formFactor: "",
                manufacturer: "Apple",
                partNum: "",
                serialNum: "",
                voltageConfigured: null,
                voltageMin: null,
                voltageMax: null
              });
            }
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_sunos$b) {
        if (callback) {
          callback(result);
        }
        resolve(result);
      }
      if (_windows$d) {
        const memoryTypes = "Unknown|Other|DRAM|Synchronous DRAM|Cache DRAM|EDO|EDRAM|VRAM|SRAM|RAM|ROM|FLASH|EEPROM|FEPROM|EPROM|CDRAM|3DRAM|SDRAM|SGRAM|RDRAM|DDR|DDR2|DDR2 FB-DIMM|Reserved|DDR3|FBD2|DDR4|LPDDR|LPDDR2|LPDDR3|LPDDR4|Logical non-volatile device|HBM|HBM2|DDR5|LPDDR5".split("|");
        const FormFactors = "Unknown|Other|SIP|DIP|ZIP|SOJ|Proprietary|SIMM|DIMM|TSOP|PGA|RIMM|SODIMM|SRIMM|SMD|SSMP|QFP|TQFP|SOIC|LCC|PLCC|BGA|FPBGA|LGA".split("|");
        try {
          util$e.powerShell("Get-CimInstance Win32_PhysicalMemory | select DataWidth,TotalWidth,Capacity,BankLabel,MemoryType,SMBIOSMemoryType,ConfiguredClockSpeed,FormFactor,Manufacturer,PartNumber,SerialNumber,ConfiguredVoltage,MinVoltage,MaxVoltage,Tag | fl").then((stdout, error) => {
            if (!error) {
              let devices = stdout.toString().split(/\n\s*\n/);
              devices.shift();
              devices.forEach(function(device) {
                let lines = device.split("\r\n");
                const dataWidth = util$e.toInt(util$e.getValue(lines, "DataWidth", ":"));
                const totalWidth = util$e.toInt(util$e.getValue(lines, "TotalWidth", ":"));
                const size = parseInt(util$e.getValue(lines, "Capacity", ":"), 10) || 0;
                const tag = util$e.getValue(lines, "Tag", ":");
                const tagInt = util$e.splitByNumber(tag);
                if (size) {
                  result.push({
                    size,
                    bank: util$e.getValue(lines, "BankLabel", ":") + (tagInt[1] ? "/" + tagInt[1] : ""),
                    // BankLabel
                    type: memoryTypes[parseInt(util$e.getValue(lines, "MemoryType", ":"), 10) || parseInt(util$e.getValue(lines, "SMBIOSMemoryType", ":"), 10)],
                    ecc: dataWidth && totalWidth ? totalWidth > dataWidth : false,
                    clockSpeed: parseInt(util$e.getValue(lines, "ConfiguredClockSpeed", ":"), 10) || parseInt(util$e.getValue(lines, "Speed", ":"), 10) || 0,
                    formFactor: FormFactors[parseInt(util$e.getValue(lines, "FormFactor", ":"), 10) || 0],
                    manufacturer: util$e.getValue(lines, "Manufacturer", ":"),
                    partNum: util$e.getValue(lines, "PartNumber", ":"),
                    serialNum: util$e.getValue(lines, "SerialNumber", ":"),
                    voltageConfigured: (parseInt(util$e.getValue(lines, "ConfiguredVoltage", ":"), 10) || 0) / 1e3,
                    voltageMin: (parseInt(util$e.getValue(lines, "MinVoltage", ":"), 10) || 0) / 1e3,
                    voltageMax: (parseInt(util$e.getValue(lines, "MaxVoltage", ":"), 10) || 0) / 1e3
                  });
                }
              });
            }
            if (callback) {
              callback(result);
            }
            resolve(result);
          });
        } catch (e) {
          if (callback) {
            callback(result);
          }
          resolve(result);
        }
      }
    });
  });
}
memory.memLayout = memLayout;
const exec$b = require$$1.exec;
const fs$7 = require$$1$1;
const util$d = util$j;
let _platform$c = process.platform;
const _linux$b = _platform$c === "linux" || _platform$c === "android";
const _darwin$b = _platform$c === "darwin";
const _windows$c = _platform$c === "win32";
const _freebsd$a = _platform$c === "freebsd";
const _openbsd$a = _platform$c === "openbsd";
const _netbsd$a = _platform$c === "netbsd";
const _sunos$a = _platform$c === "sunos";
function parseWinBatteryPart(lines, designedCapacity, fullChargeCapacity) {
  const result = {};
  let status = util$d.getValue(lines, "BatteryStatus", ":").trim();
  if (status >= 0) {
    const statusValue = status ? parseInt(status) : 0;
    result.status = statusValue;
    result.hasBattery = true;
    result.maxCapacity = fullChargeCapacity || parseInt(util$d.getValue(lines, "DesignCapacity", ":") || 0);
    result.designedCapacity = parseInt(util$d.getValue(lines, "DesignCapacity", ":") || designedCapacity);
    result.voltage = parseInt(util$d.getValue(lines, "DesignVoltage", ":") || 0) / 1e3;
    result.capacityUnit = "mWh";
    result.percent = parseInt(util$d.getValue(lines, "EstimatedChargeRemaining", ":") || 0);
    result.currentCapacity = parseInt(result.maxCapacity * result.percent / 100);
    result.isCharging = statusValue >= 6 && statusValue <= 9 || statusValue === 11 || statusValue !== 3 && statusValue !== 1 && result.percent < 100;
    result.acConnected = result.isCharging || statusValue === 2;
    result.model = util$d.getValue(lines, "DeviceID", ":");
  } else {
    result.status = -1;
  }
  return result;
}
var battery = function(callback) {
  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = {
        hasBattery: false,
        cycleCount: 0,
        isCharging: false,
        designedCapacity: 0,
        maxCapacity: 0,
        currentCapacity: 0,
        voltage: 0,
        capacityUnit: "",
        percent: 0,
        timeRemaining: null,
        acConnected: true,
        type: "",
        model: "",
        manufacturer: "",
        serial: ""
      };
      if (_linux$b) {
        let battery_path = "";
        if (fs$7.existsSync("/sys/class/power_supply/BAT1/uevent")) {
          battery_path = "/sys/class/power_supply/BAT1/";
        } else if (fs$7.existsSync("/sys/class/power_supply/BAT0/uevent")) {
          battery_path = "/sys/class/power_supply/BAT0/";
        }
        let acConnected = false;
        let acPath = "";
        if (fs$7.existsSync("/sys/class/power_supply/AC/online")) {
          acPath = "/sys/class/power_supply/AC/online";
        } else if (fs$7.existsSync("/sys/class/power_supply/AC0/online")) {
          acPath = "/sys/class/power_supply/AC0/online";
        }
        if (acPath) {
          const file = fs$7.readFileSync(acPath);
          acConnected = file.toString().trim() === "1";
        }
        if (battery_path) {
          fs$7.readFile(battery_path + "uevent", function(error, stdout) {
            if (!error) {
              let lines = stdout.toString().split("\n");
              result.isCharging = util$d.getValue(lines, "POWER_SUPPLY_STATUS", "=").toLowerCase() === "charging";
              result.acConnected = acConnected || result.isCharging;
              result.voltage = parseInt("0" + util$d.getValue(lines, "POWER_SUPPLY_VOLTAGE_NOW", "="), 10) / 1e6;
              result.capacityUnit = result.voltage ? "mWh" : "mAh";
              result.cycleCount = parseInt("0" + util$d.getValue(lines, "POWER_SUPPLY_CYCLE_COUNT", "="), 10);
              result.maxCapacity = Math.round(parseInt("0" + util$d.getValue(lines, "POWER_SUPPLY_CHARGE_FULL", "=", true, true), 10) / 1e3 * (result.voltage || 1));
              const desingedMinVoltage = parseInt("0" + util$d.getValue(lines, "POWER_SUPPLY_VOLTAGE_MIN_DESIGN", "="), 10) / 1e6;
              result.designedCapacity = Math.round(parseInt("0" + util$d.getValue(lines, "POWER_SUPPLY_CHARGE_FULL_DESIGN", "=", true, true), 10) / 1e3 * (desingedMinVoltage || result.voltage || 1));
              result.currentCapacity = Math.round(parseInt("0" + util$d.getValue(lines, "POWER_SUPPLY_CHARGE_NOW", "="), 10) / 1e3 * (result.voltage || 1));
              if (!result.maxCapacity) {
                result.maxCapacity = parseInt("0" + util$d.getValue(lines, "POWER_SUPPLY_ENERGY_FULL", "=", true, true), 10) / 1e3;
                result.designedCapacity = parseInt("0" + util$d.getValue(lines, "POWER_SUPPLY_ENERGY_FULL_DESIGN", "=", true, true), 10) / 1e3 | result.maxCapacity;
                result.currentCapacity = parseInt("0" + util$d.getValue(lines, "POWER_SUPPLY_ENERGY_NOW", "="), 10) / 1e3;
              }
              const percent = util$d.getValue(lines, "POWER_SUPPLY_CAPACITY", "=");
              const energy = parseInt("0" + util$d.getValue(lines, "POWER_SUPPLY_ENERGY_NOW", "="), 10);
              const power = parseInt("0" + util$d.getValue(lines, "POWER_SUPPLY_POWER_NOW", "="), 10);
              const current = parseInt("0" + util$d.getValue(lines, "POWER_SUPPLY_CURRENT_NOW", "="), 10);
              const charge = parseInt("0" + util$d.getValue(lines, "POWER_SUPPLY_CHARGE_NOW", "="), 10);
              result.percent = parseInt("0" + percent, 10);
              if (result.maxCapacity && result.currentCapacity) {
                result.hasBattery = true;
                if (!percent) {
                  result.percent = 100 * result.currentCapacity / result.maxCapacity;
                }
              }
              if (result.isCharging) {
                result.hasBattery = true;
              }
              if (energy && power) {
                result.timeRemaining = Math.floor(energy / power * 60);
              } else if (current && charge) {
                result.timeRemaining = Math.floor(charge / current * 60);
              } else if (current && result.currentCapacity) {
                result.timeRemaining = Math.floor(result.currentCapacity / current * 60);
              }
              result.type = util$d.getValue(lines, "POWER_SUPPLY_TECHNOLOGY", "=");
              result.model = util$d.getValue(lines, "POWER_SUPPLY_MODEL_NAME", "=");
              result.manufacturer = util$d.getValue(lines, "POWER_SUPPLY_MANUFACTURER", "=");
              result.serial = util$d.getValue(lines, "POWER_SUPPLY_SERIAL_NUMBER", "=");
              if (callback) {
                callback(result);
              }
              resolve(result);
            } else {
              if (callback) {
                callback(result);
              }
              resolve(result);
            }
          });
        } else {
          if (callback) {
            callback(result);
          }
          resolve(result);
        }
      }
      if (_freebsd$a || _openbsd$a || _netbsd$a) {
        exec$b("sysctl -i hw.acpi.battery hw.acpi.acline", function(error, stdout) {
          let lines = stdout.toString().split("\n");
          const batteries = parseInt("0" + util$d.getValue(lines, "hw.acpi.battery.units"), 10);
          const percent = parseInt("0" + util$d.getValue(lines, "hw.acpi.battery.life"), 10);
          result.hasBattery = batteries > 0;
          result.cycleCount = null;
          result.isCharging = util$d.getValue(lines, "hw.acpi.acline") !== "1";
          result.acConnected = result.isCharging;
          result.maxCapacity = null;
          result.currentCapacity = null;
          result.capacityUnit = "unknown";
          result.percent = batteries ? percent : null;
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_darwin$b) {
        exec$b('ioreg -n AppleSmartBattery -r | egrep "CycleCount|IsCharging|DesignCapacity|MaxCapacity|CurrentCapacity|BatterySerialNumber|TimeRemaining|Voltage"; pmset -g batt | grep %', function(error, stdout) {
          if (stdout) {
            let lines = stdout.toString().replace(/ +/g, "").replace(/"+/g, "").replace(/-/g, "").split("\n");
            result.cycleCount = parseInt("0" + util$d.getValue(lines, "cyclecount", "="), 10);
            result.voltage = parseInt("0" + util$d.getValue(lines, "voltage", "="), 10) / 1e3;
            result.capacityUnit = result.voltage ? "mWh" : "mAh";
            result.maxCapacity = Math.round(parseInt("0" + util$d.getValue(lines, "applerawmaxcapacity", "="), 10) * (result.voltage || 1));
            result.currentCapacity = Math.round(parseInt("0" + util$d.getValue(lines, "applerawcurrentcapacity", "="), 10) * (result.voltage || 1));
            result.designedCapacity = Math.round(parseInt("0" + util$d.getValue(lines, "DesignCapacity", "="), 10) * (result.voltage || 1));
            result.manufacturer = "Apple";
            result.serial = util$d.getValue(lines, "BatterySerialNumber", "=");
            let percent = null;
            const line = util$d.getValue(lines, "internal", "Battery");
            let parts = line.split(";");
            if (parts && parts[0]) {
              let parts2 = parts[0].split("	");
              if (parts2 && parts2[1]) {
                percent = parseFloat(parts2[1].trim().replace(/%/g, ""));
              }
            }
            if (parts && parts[1]) {
              result.isCharging = parts[1].trim() === "charging";
              result.acConnected = parts[1].trim() !== "discharging";
            } else {
              result.isCharging = util$d.getValue(lines, "ischarging", "=").toLowerCase() === "yes";
              result.acConnected = result.isCharging;
            }
            if (result.maxCapacity && result.currentCapacity) {
              result.hasBattery = true;
              result.type = "Li-ion";
              result.percent = percent !== null ? percent : Math.round(100 * result.currentCapacity / result.maxCapacity);
              if (!result.isCharging) {
                result.timeRemaining = parseInt("0" + util$d.getValue(lines, "TimeRemaining", "="), 10);
              }
            }
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_sunos$a) {
        if (callback) {
          callback(result);
        }
        resolve(result);
      }
      if (_windows$c) {
        try {
          const workload = [];
          workload.push(util$d.powerShell("Get-CimInstance Win32_Battery | select BatteryStatus, DesignCapacity, DesignVoltage, EstimatedChargeRemaining, DeviceID | fl"));
          workload.push(util$d.powerShell("(Get-WmiObject -Class BatteryStaticData -Namespace ROOT/WMI).DesignedCapacity"));
          workload.push(util$d.powerShell("(Get-CimInstance -Class BatteryFullChargedCapacity -Namespace ROOT/WMI).FullChargedCapacity"));
          util$d.promiseAll(
            workload
          ).then((data) => {
            if (data) {
              let parts = data.results[0].split(/\n\s*\n/);
              let batteries = [];
              const hasValue = (value) => /\S/.test(value);
              for (let i = 0; i < parts.length; i++) {
                if (hasValue(parts[i]) && (!batteries.length || !hasValue(parts[i - 1]))) {
                  batteries.push([]);
                }
                if (hasValue(parts[i])) {
                  batteries[batteries.length - 1].push(parts[i]);
                }
              }
              let designCapacities = data.results[1].split("\r\n").filter((e) => e);
              let fullChargeCapacities = data.results[2].split("\r\n").filter((e) => e);
              if (batteries.length) {
                let first = false;
                let additionalBatteries = [];
                for (let i = 0; i < batteries.length; i++) {
                  let lines = batteries[i][0].split("\r\n");
                  const designedCapacity = designCapacities && designCapacities.length >= i + 1 && designCapacities[i] ? util$d.toInt(designCapacities[i]) : 0;
                  const fullChargeCapacity = fullChargeCapacities && fullChargeCapacities.length >= i + 1 && fullChargeCapacities[i] ? util$d.toInt(fullChargeCapacities[i]) : 0;
                  const parsed = parseWinBatteryPart(lines, designedCapacity, fullChargeCapacity);
                  if (!first && parsed.status > 0 && parsed.status !== 10) {
                    result.hasBattery = parsed.hasBattery;
                    result.maxCapacity = parsed.maxCapacity;
                    result.designedCapacity = parsed.designedCapacity;
                    result.voltage = parsed.voltage;
                    result.capacityUnit = parsed.capacityUnit;
                    result.percent = parsed.percent;
                    result.currentCapacity = parsed.currentCapacity;
                    result.isCharging = parsed.isCharging;
                    result.acConnected = parsed.acConnected;
                    result.model = parsed.model;
                    first = true;
                  } else if (parsed.status !== -1) {
                    additionalBatteries.push(
                      {
                        hasBattery: parsed.hasBattery,
                        maxCapacity: parsed.maxCapacity,
                        designedCapacity: parsed.designedCapacity,
                        voltage: parsed.voltage,
                        capacityUnit: parsed.capacityUnit,
                        percent: parsed.percent,
                        currentCapacity: parsed.currentCapacity,
                        isCharging: parsed.isCharging,
                        timeRemaining: null,
                        acConnected: parsed.acConnected,
                        model: parsed.model,
                        type: "",
                        manufacturer: "",
                        serial: ""
                      }
                    );
                  }
                }
                if (!first && additionalBatteries.length) {
                  result = additionalBatteries[0];
                  additionalBatteries.shift();
                }
                if (additionalBatteries.length) {
                  result.additionalBatteries = additionalBatteries;
                }
              }
            }
            if (callback) {
              callback(result);
            }
            resolve(result);
          });
        } catch (e) {
          if (callback) {
            callback(result);
          }
          resolve(result);
        }
      }
    });
  });
};
var graphics$1 = {};
const fs$6 = require$$1$1;
const exec$a = require$$1.exec;
const execSync$6 = require$$1.execSync;
const util$c = util$j;
let _platform$b = process.platform;
let _nvidiaSmiPath = "";
const _linux$a = _platform$b === "linux" || _platform$b === "android";
const _darwin$a = _platform$b === "darwin";
const _windows$b = _platform$b === "win32";
const _freebsd$9 = _platform$b === "freebsd";
const _openbsd$9 = _platform$b === "openbsd";
const _netbsd$9 = _platform$b === "netbsd";
const _sunos$9 = _platform$b === "sunos";
let _resolutionX = 0;
let _resolutionY = 0;
let _pixelDepth = 0;
let _refreshRate = 0;
const videoTypes = {
  "-2": "UNINITIALIZED",
  "-1": "OTHER",
  "0": "HD15",
  "1": "SVIDEO",
  "2": "Composite video",
  "3": "Component video",
  "4": "DVI",
  "5": "HDMI",
  "6": "LVDS",
  "8": "D_JPN",
  "9": "SDI",
  "10": "DP",
  "11": "DP embedded",
  "12": "UDI",
  "13": "UDI embedded",
  "14": "SDTVDONGLE",
  "15": "MIRACAST",
  "2147483648": "INTERNAL"
};
function getVendorFromModel(model) {
  const manufacturers = [
    { pattern: "^LG.+", manufacturer: "LG" },
    { pattern: "^BENQ.+", manufacturer: "BenQ" },
    { pattern: "^ASUS.+", manufacturer: "Asus" },
    { pattern: "^DELL.+", manufacturer: "Dell" },
    { pattern: "^SAMSUNG.+", manufacturer: "Samsung" },
    { pattern: "^VIEWSON.+", manufacturer: "ViewSonic" },
    { pattern: "^SONY.+", manufacturer: "Sony" },
    { pattern: "^ACER.+", manufacturer: "Acer" },
    { pattern: "^AOC.+", manufacturer: "AOC Monitors" },
    { pattern: "^HP.+", manufacturer: "HP" },
    { pattern: "^EIZO.?", manufacturer: "Eizo" },
    { pattern: "^PHILIPS.?", manufacturer: "Philips" },
    { pattern: "^IIYAMA.?", manufacturer: "Iiyama" },
    { pattern: "^SHARP.?", manufacturer: "Sharp" },
    { pattern: "^NEC.?", manufacturer: "NEC" },
    { pattern: "^LENOVO.?", manufacturer: "Lenovo" },
    { pattern: "COMPAQ.?", manufacturer: "Compaq" },
    { pattern: "APPLE.?", manufacturer: "Apple" },
    { pattern: "INTEL.?", manufacturer: "Intel" },
    { pattern: "AMD.?", manufacturer: "AMD" },
    { pattern: "NVIDIA.?", manufacturer: "NVDIA" }
  ];
  let result = "";
  if (model) {
    model = model.toUpperCase();
    manufacturers.forEach((manufacturer) => {
      const re = RegExp(manufacturer.pattern);
      if (re.test(model)) {
        result = manufacturer.manufacturer;
      }
    });
  }
  return result;
}
function getVendorFromId(id) {
  const vendors = {
    "610": "Apple",
    "1e6d": "LG",
    "10ac": "DELL",
    "4dd9": "Sony",
    "38a3": "NEC"
  };
  return vendors[id] || "";
}
function vendorToId(str) {
  let result = "";
  str = (str || "").toLowerCase();
  if (str.indexOf("apple") >= 0) {
    result = "0x05ac";
  } else if (str.indexOf("nvidia") >= 0) {
    result = "0x10de";
  } else if (str.indexOf("intel") >= 0) {
    result = "0x8086";
  } else if (str.indexOf("ati") >= 0 || str.indexOf("amd") >= 0) {
    result = "0x1002";
  }
  return result;
}
function getMetalVersion(id) {
  const families = {
    "spdisplays_mtlgpufamilymac1": "mac1",
    "spdisplays_mtlgpufamilymac2": "mac2",
    "spdisplays_mtlgpufamilyapple1": "apple1",
    "spdisplays_mtlgpufamilyapple2": "apple2",
    "spdisplays_mtlgpufamilyapple3": "apple3",
    "spdisplays_mtlgpufamilyapple4": "apple4",
    "spdisplays_mtlgpufamilyapple5": "apple5",
    "spdisplays_mtlgpufamilyapple6": "apple6",
    "spdisplays_mtlgpufamilyapple7": "apple7",
    "spdisplays_metalfeaturesetfamily11": "family1_v1",
    "spdisplays_metalfeaturesetfamily12": "family1_v2",
    "spdisplays_metalfeaturesetfamily13": "family1_v3",
    "spdisplays_metalfeaturesetfamily14": "family1_v4",
    "spdisplays_metalfeaturesetfamily21": "family2_v1"
  };
  return families[id] || "";
}
function graphics(callback) {
  function parseLinesDarwin(graphicsArr) {
    const res = {
      controllers: [],
      displays: []
    };
    try {
      graphicsArr.forEach(function(item) {
        const bus = (item.sppci_bus || "").indexOf("builtin") > -1 ? "Built-In" : (item.sppci_bus || "").indexOf("pcie") > -1 ? "PCIe" : "";
        const vram = (parseInt(item.spdisplays_vram || "", 10) || 0) * ((item.spdisplays_vram || "").indexOf("GB") > -1 ? 1024 : 1);
        const vramDyn = (parseInt(item.spdisplays_vram_shared || "", 10) || 0) * ((item.spdisplays_vram_shared || "").indexOf("GB") > -1 ? 1024 : 1);
        let metalVersion = getMetalVersion(item.spdisplays_metal || item.spdisplays_metalfamily || "");
        res.controllers.push({
          vendor: getVendorFromModel(item.spdisplays_vendor || "") || item.spdisplays_vendor || "",
          model: item.sppci_model || "",
          bus,
          vramDynamic: bus === "Built-In",
          vram: vram || vramDyn || null,
          deviceId: item["spdisplays_device-id"] || "",
          vendorId: item["spdisplays_vendor-id"] || vendorToId((item["spdisplays_vendor"] || "") + (item.sppci_model || "")),
          external: item.sppci_device_type === "spdisplays_egpu",
          cores: item["sppci_cores"] || null,
          metalVersion
        });
        if (item.spdisplays_ndrvs && item.spdisplays_ndrvs.length) {
          item.spdisplays_ndrvs.forEach(function(displayItem) {
            const connectionType = displayItem["spdisplays_connection_type"] || "";
            const currentResolutionParts = (displayItem["_spdisplays_resolution"] || "").split("@");
            const currentResolution = currentResolutionParts[0].split("x");
            const pixelParts = (displayItem["_spdisplays_pixels"] || "").split("x");
            const pixelDepthString = displayItem["spdisplays_depth"] || "";
            const serial = displayItem["_spdisplays_display-serial-number"] || displayItem["_spdisplays_display-serial-number2"] || null;
            res.displays.push({
              vendor: getVendorFromId(displayItem["_spdisplays_display-vendor-id"] || "") || getVendorFromModel(displayItem["_name"] || ""),
              vendorId: displayItem["_spdisplays_display-vendor-id"] || "",
              model: displayItem["_name"] || "",
              productionYear: displayItem["_spdisplays_display-year"] || null,
              serial: serial !== "0" ? serial : null,
              displayId: displayItem["_spdisplays_displayID"] || null,
              main: displayItem["spdisplays_main"] ? displayItem["spdisplays_main"] === "spdisplays_yes" : false,
              builtin: (displayItem["spdisplays_display_type"] || "").indexOf("built-in") > -1,
              connection: connectionType.indexOf("_internal") > -1 ? "Internal" : connectionType.indexOf("_displayport") > -1 ? "Display Port" : connectionType.indexOf("_hdmi") > -1 ? "HDMI" : null,
              sizeX: null,
              sizeY: null,
              pixelDepth: pixelDepthString === "CGSThirtyBitColor" ? 30 : pixelDepthString === "CGSThirtytwoBitColor" ? 32 : pixelDepthString === "CGSTwentyfourBitColor" ? 24 : null,
              resolutionX: pixelParts.length > 1 ? parseInt(pixelParts[0], 10) : null,
              resolutionY: pixelParts.length > 1 ? parseInt(pixelParts[1], 10) : null,
              currentResX: currentResolution.length > 1 ? parseInt(currentResolution[0], 10) : null,
              currentResY: currentResolution.length > 1 ? parseInt(currentResolution[1], 10) : null,
              positionX: 0,
              positionY: 0,
              currentRefreshRate: currentResolutionParts.length > 1 ? parseInt(currentResolutionParts[1], 10) : null
            });
          });
        }
      });
      return res;
    } catch (e) {
      return res;
    }
  }
  function parseLinesLinuxControllers(lines) {
    let controllers = [];
    let currentController = {
      vendor: "",
      subVendor: "",
      model: "",
      bus: "",
      busAddress: "",
      vram: null,
      vramDynamic: false,
      pciID: ""
    };
    let isGraphicsController = false;
    let pciIDs = [];
    try {
      pciIDs = execSync$6('export LC_ALL=C; dmidecode -t 9 2>/dev/null; unset LC_ALL | grep "Bus Address: "').toString().split("\n");
      for (let i2 = 0; i2 < pciIDs.length; i2++) {
        pciIDs[i2] = pciIDs[i2].replace("Bus Address:", "").replace("0000:", "").trim();
      }
      pciIDs = pciIDs.filter(function(el) {
        return el != null && el;
      });
    } catch (e) {
      util$c.noop();
    }
    let i = 1;
    lines.forEach((line) => {
      let subsystem = "";
      if (i < lines.length && lines[i]) {
        subsystem = lines[i];
        if (subsystem.indexOf(":") > 0) {
          subsystem = subsystem.split(":")[1];
        }
      }
      if ("" !== line.trim()) {
        if (" " !== line[0] && "	" !== line[0]) {
          let isExternal = pciIDs.indexOf(line.split(" ")[0]) >= 0;
          let vgapos = line.toLowerCase().indexOf(" vga ");
          let _3dcontrollerpos = line.toLowerCase().indexOf("3d controller");
          if (vgapos !== -1 || _3dcontrollerpos !== -1) {
            if (_3dcontrollerpos !== -1 && vgapos === -1) {
              vgapos = _3dcontrollerpos;
            }
            if (currentController.vendor || currentController.model || currentController.bus || currentController.vram !== null || currentController.vramDynamic) {
              controllers.push(currentController);
              currentController = {
                vendor: "",
                model: "",
                bus: "",
                busAddress: "",
                vram: null,
                vramDynamic: false
              };
            }
            const pciIDCandidate = line.split(" ")[0];
            if (/[\da-fA-F]{2}:[\da-fA-F]{2}\.[\da-fA-F]/.test(pciIDCandidate)) {
              currentController.busAddress = pciIDCandidate;
            }
            isGraphicsController = true;
            let endpos = line.search(/\[[0-9a-f]{4}:[0-9a-f]{4}]|$/);
            let parts = line.substr(vgapos, endpos - vgapos).split(":");
            currentController.busAddress = line.substr(0, vgapos).trim();
            if (parts.length > 1) {
              parts[1] = parts[1].trim();
              if (parts[1].toLowerCase().indexOf("corporation") >= 0) {
                currentController.vendor = parts[1].substr(0, parts[1].toLowerCase().indexOf("corporation") + 11).trim();
                currentController.model = parts[1].substr(parts[1].toLowerCase().indexOf("corporation") + 11, 200).split("(")[0].trim();
                currentController.bus = pciIDs.length > 0 && isExternal ? "PCIe" : "Onboard";
                currentController.vram = null;
                currentController.vramDynamic = false;
              } else if (parts[1].toLowerCase().indexOf(" inc.") >= 0) {
                if ((parts[1].match(/]/g) || []).length > 1) {
                  currentController.vendor = parts[1].substr(0, parts[1].toLowerCase().indexOf("]") + 1).trim();
                  currentController.model = parts[1].substr(parts[1].toLowerCase().indexOf("]") + 1, 200).trim().split("(")[0].trim();
                } else {
                  currentController.vendor = parts[1].substr(0, parts[1].toLowerCase().indexOf(" inc.") + 5).trim();
                  currentController.model = parts[1].substr(parts[1].toLowerCase().indexOf(" inc.") + 5, 200).trim().split("(")[0].trim();
                }
                currentController.bus = pciIDs.length > 0 && isExternal ? "PCIe" : "Onboard";
                currentController.vram = null;
                currentController.vramDynamic = false;
              } else if (parts[1].toLowerCase().indexOf(" ltd.") >= 0) {
                if ((parts[1].match(/]/g) || []).length > 1) {
                  currentController.vendor = parts[1].substr(0, parts[1].toLowerCase().indexOf("]") + 1).trim();
                  currentController.model = parts[1].substr(parts[1].toLowerCase().indexOf("]") + 1, 200).trim().split("(")[0].trim();
                } else {
                  currentController.vendor = parts[1].substr(0, parts[1].toLowerCase().indexOf(" ltd.") + 5).trim();
                  currentController.model = parts[1].substr(parts[1].toLowerCase().indexOf(" ltd.") + 5, 200).trim().split("(")[0].trim();
                }
              }
              if (currentController.model && subsystem.indexOf(currentController.model) !== -1) {
                const subVendor = subsystem.split(currentController.model)[0].trim();
                if (subVendor) {
                  currentController.subVendor = subVendor;
                }
              }
            }
          } else {
            isGraphicsController = false;
          }
        }
        if (isGraphicsController) {
          let parts = line.split(":");
          if (parts.length > 1 && parts[0].replace(/ +/g, "").toLowerCase().indexOf("devicename") !== -1 && parts[1].toLowerCase().indexOf("onboard") !== -1) {
            currentController.bus = "Onboard";
          }
          if (parts.length > 1 && parts[0].replace(/ +/g, "").toLowerCase().indexOf("region") !== -1 && parts[1].toLowerCase().indexOf("memory") !== -1) {
            let memparts = parts[1].split("=");
            if (memparts.length > 1) {
              currentController.vram = parseInt(memparts[1]);
            }
          }
        }
      }
      i++;
    });
    if (currentController.vendor || currentController.model || currentController.bus || currentController.busAddress || currentController.vram !== null || currentController.vramDynamic) {
      controllers.push(currentController);
    }
    return controllers;
  }
  function parseLinesLinuxClinfo(controllers, lines) {
    const fieldPattern = /\[([^\]]+)\]\s+(\w+)\s+(.*)/;
    const devices = lines.reduce((devices2, line) => {
      const field = fieldPattern.exec(line.trim());
      if (field) {
        if (!devices2[field[1]]) {
          devices2[field[1]] = {};
        }
        devices2[field[1]][field[2]] = field[3];
      }
      return devices2;
    }, {});
    for (let deviceId in devices) {
      const device = devices[deviceId];
      if (device["CL_DEVICE_TYPE"] === "CL_DEVICE_TYPE_GPU") {
        let busAddress;
        if (device["CL_DEVICE_TOPOLOGY_AMD"]) {
          const bdf = device["CL_DEVICE_TOPOLOGY_AMD"].match(/[a-zA-Z0-9]+:\d+\.\d+/);
          if (bdf) {
            busAddress = bdf[0];
          }
        } else if (device["CL_DEVICE_PCI_BUS_ID_NV"] && device["CL_DEVICE_PCI_SLOT_ID_NV"]) {
          const bus = parseInt(device["CL_DEVICE_PCI_BUS_ID_NV"]);
          const slot = parseInt(device["CL_DEVICE_PCI_SLOT_ID_NV"]);
          if (!isNaN(bus) && !isNaN(slot)) {
            const b = bus & 255;
            const d = slot >> 3 & 255;
            const f = slot & 7;
            busAddress = `${b.toString().padStart(2, "0")}:${d.toString().padStart(2, "0")}.${f}`;
          }
        }
        if (busAddress) {
          let controller = controllers.find((controller2) => controller2.busAddress === busAddress);
          if (!controller) {
            controller = {
              vendor: "",
              model: "",
              bus: "",
              busAddress,
              vram: null,
              vramDynamic: false
            };
            controllers.push(controller);
          }
          controller.vendor = device["CL_DEVICE_VENDOR"];
          if (device["CL_DEVICE_BOARD_NAME_AMD"]) {
            controller.model = device["CL_DEVICE_BOARD_NAME_AMD"];
          } else {
            controller.model = device["CL_DEVICE_NAME"];
          }
          const memory2 = parseInt(device["CL_DEVICE_GLOBAL_MEM_SIZE"]);
          if (!isNaN(memory2)) {
            controller.vram = Math.round(memory2 / 1024 / 1024);
          }
        }
      }
    }
    return controllers;
  }
  function getNvidiaSmi() {
    if (_nvidiaSmiPath) {
      return _nvidiaSmiPath;
    }
    if (_windows$b) {
      try {
        const basePath = util$c.WINDIR + "\\System32\\DriverStore\\FileRepository";
        const candidateDirs = fs$6.readdirSync(basePath).filter((dir) => {
          return fs$6.readdirSync([basePath, dir].join("/")).includes("nvidia-smi.exe");
        });
        const targetDir = candidateDirs.reduce((prevDir, currentDir) => {
          const previousNvidiaSmi = fs$6.statSync([basePath, prevDir, "nvidia-smi.exe"].join("/"));
          const currentNvidiaSmi = fs$6.statSync([basePath, currentDir, "nvidia-smi.exe"].join("/"));
          return previousNvidiaSmi.ctimeMs > currentNvidiaSmi.ctimeMs ? prevDir : currentDir;
        });
        if (targetDir) {
          _nvidiaSmiPath = [basePath, targetDir, "nvidia-smi.exe"].join("/");
        }
      } catch (e) {
        util$c.noop();
      }
    } else if (_linux$a) {
      _nvidiaSmiPath = "nvidia-smi";
    }
    return _nvidiaSmiPath;
  }
  function nvidiaSmi(options) {
    const nvidiaSmiExe = getNvidiaSmi();
    options = options || util$c.execOptsWin;
    if (nvidiaSmiExe) {
      const nvidiaSmiOpts = "--query-gpu=driver_version,pci.sub_device_id,name,pci.bus_id,fan.speed,memory.total,memory.used,memory.free,utilization.gpu,utilization.memory,temperature.gpu,temperature.memory,power.draw,power.limit,clocks.gr,clocks.mem --format=csv,noheader,nounits";
      const cmd = nvidiaSmiExe + " " + nvidiaSmiOpts + (_linux$a ? "  2>/dev/null" : "");
      try {
        const res = execSync$6(cmd, options).toString();
        return res;
      } catch (e) {
        util$c.noop();
      }
    }
    return "";
  }
  function nvidiaDevices() {
    function safeParseNumber(value) {
      if ([null, void 0].includes(value)) {
        return value;
      }
      return parseFloat(value);
    }
    const stdout = nvidiaSmi();
    if (!stdout) {
      return [];
    }
    const gpus = stdout.split("\n").filter(Boolean);
    let results = gpus.map((gpu) => {
      const splittedData = gpu.split(", ").map((value) => value.includes("N/A") ? void 0 : value);
      if (splittedData.length === 16) {
        return {
          driverVersion: splittedData[0],
          subDeviceId: splittedData[1],
          name: splittedData[2],
          pciBus: splittedData[3],
          fanSpeed: safeParseNumber(splittedData[4]),
          memoryTotal: safeParseNumber(splittedData[5]),
          memoryUsed: safeParseNumber(splittedData[6]),
          memoryFree: safeParseNumber(splittedData[7]),
          utilizationGpu: safeParseNumber(splittedData[8]),
          utilizationMemory: safeParseNumber(splittedData[9]),
          temperatureGpu: safeParseNumber(splittedData[10]),
          temperatureMemory: safeParseNumber(splittedData[11]),
          powerDraw: safeParseNumber(splittedData[12]),
          powerLimit: safeParseNumber(splittedData[13]),
          clockCore: safeParseNumber(splittedData[14]),
          clockMemory: safeParseNumber(splittedData[15])
        };
      } else {
        return {};
      }
    });
    results = results.filter((item) => {
      return "pciBus" in item;
    });
    return results;
  }
  function mergeControllerNvidia(controller, nvidia) {
    if (nvidia.driverVersion) {
      controller.driverVersion = nvidia.driverVersion;
    }
    if (nvidia.subDeviceId) {
      controller.subDeviceId = nvidia.subDeviceId;
    }
    if (nvidia.name) {
      controller.name = nvidia.name;
    }
    if (nvidia.pciBus) {
      controller.pciBus = nvidia.pciBus;
    }
    if (nvidia.fanSpeed) {
      controller.fanSpeed = nvidia.fanSpeed;
    }
    if (nvidia.memoryTotal) {
      controller.memoryTotal = nvidia.memoryTotal;
      controller.vram = nvidia.memoryTotal;
      controller.vramDynamic = false;
    }
    if (nvidia.memoryUsed) {
      controller.memoryUsed = nvidia.memoryUsed;
    }
    if (nvidia.memoryFree) {
      controller.memoryFree = nvidia.memoryFree;
    }
    if (nvidia.utilizationGpu) {
      controller.utilizationGpu = nvidia.utilizationGpu;
    }
    if (nvidia.utilizationMemory) {
      controller.utilizationMemory = nvidia.utilizationMemory;
    }
    if (nvidia.temperatureGpu) {
      controller.temperatureGpu = nvidia.temperatureGpu;
    }
    if (nvidia.temperatureMemory) {
      controller.temperatureMemory = nvidia.temperatureMemory;
    }
    if (nvidia.powerDraw) {
      controller.powerDraw = nvidia.powerDraw;
    }
    if (nvidia.powerLimit) {
      controller.powerLimit = nvidia.powerLimit;
    }
    if (nvidia.clockCore) {
      controller.clockCore = nvidia.clockCore;
    }
    if (nvidia.clockMemory) {
      controller.clockMemory = nvidia.clockMemory;
    }
    return controller;
  }
  function parseLinesLinuxEdid(edid) {
    let result = {
      vendor: "",
      model: "",
      deviceName: "",
      main: false,
      builtin: false,
      connection: "",
      sizeX: null,
      sizeY: null,
      pixelDepth: null,
      resolutionX: null,
      resolutionY: null,
      currentResX: null,
      currentResY: null,
      positionX: 0,
      positionY: 0,
      currentRefreshRate: null
    };
    let start = 108;
    if (edid.substr(start, 6) === "000000") {
      start += 36;
    }
    if (edid.substr(start, 6) === "000000") {
      start += 36;
    }
    if (edid.substr(start, 6) === "000000") {
      start += 36;
    }
    if (edid.substr(start, 6) === "000000") {
      start += 36;
    }
    result.resolutionX = parseInt("0x0" + edid.substr(start + 8, 1) + edid.substr(start + 4, 2));
    result.resolutionY = parseInt("0x0" + edid.substr(start + 14, 1) + edid.substr(start + 10, 2));
    result.sizeX = parseInt("0x0" + edid.substr(start + 28, 1) + edid.substr(start + 24, 2));
    result.sizeY = parseInt("0x0" + edid.substr(start + 29, 1) + edid.substr(start + 26, 2));
    start = edid.indexOf("000000fc00");
    if (start >= 0) {
      let model_raw = edid.substr(start + 10, 26);
      if (model_raw.indexOf("0a") !== -1) {
        model_raw = model_raw.substr(0, model_raw.indexOf("0a"));
      }
      try {
        if (model_raw.length > 2) {
          result.model = model_raw.match(/.{1,2}/g).map(function(v) {
            return String.fromCharCode(parseInt(v, 16));
          }).join("");
        }
      } catch (e) {
        util$c.noop();
      }
    } else {
      result.model = "";
    }
    return result;
  }
  function parseLinesLinuxDisplays(lines, depth) {
    let displays = [];
    let currentDisplay = {
      vendor: "",
      model: "",
      deviceName: "",
      main: false,
      builtin: false,
      connection: "",
      sizeX: null,
      sizeY: null,
      pixelDepth: null,
      resolutionX: null,
      resolutionY: null,
      currentResX: null,
      currentResY: null,
      positionX: 0,
      positionY: 0,
      currentRefreshRate: null
    };
    let is_edid = false;
    let is_current = false;
    let edid_raw = "";
    let start = 0;
    for (let i = 1; i < lines.length; i++) {
      if ("" !== lines[i].trim()) {
        if (" " !== lines[i][0] && "	" !== lines[i][0] && lines[i].toLowerCase().indexOf(" connected ") !== -1) {
          if (currentDisplay.model || currentDisplay.main || currentDisplay.builtin || currentDisplay.connection || currentDisplay.sizeX !== null || currentDisplay.pixelDepth !== null || currentDisplay.resolutionX !== null) {
            displays.push(currentDisplay);
            currentDisplay = {
              vendor: "",
              model: "",
              main: false,
              builtin: false,
              connection: "",
              sizeX: null,
              sizeY: null,
              pixelDepth: null,
              resolutionX: null,
              resolutionY: null,
              currentResX: null,
              currentResY: null,
              positionX: 0,
              positionY: 0,
              currentRefreshRate: null
            };
          }
          let parts = lines[i].split(" ");
          currentDisplay.connection = parts[0];
          currentDisplay.main = lines[i].toLowerCase().indexOf(" primary ") >= 0;
          currentDisplay.builtin = parts[0].toLowerCase().indexOf("edp") >= 0;
        }
        if (is_edid) {
          if (lines[i].search(/\S|$/) > start) {
            edid_raw += lines[i].toLowerCase().trim();
          } else {
            let edid_decoded = parseLinesLinuxEdid(edid_raw);
            currentDisplay.vendor = edid_decoded.vendor;
            currentDisplay.model = edid_decoded.model;
            currentDisplay.resolutionX = edid_decoded.resolutionX;
            currentDisplay.resolutionY = edid_decoded.resolutionY;
            currentDisplay.sizeX = edid_decoded.sizeX;
            currentDisplay.sizeY = edid_decoded.sizeY;
            currentDisplay.pixelDepth = depth;
            is_edid = false;
          }
        }
        if (lines[i].toLowerCase().indexOf("edid:") >= 0) {
          is_edid = true;
          start = lines[i].search(/\S|$/);
        }
        if (lines[i].toLowerCase().indexOf("*current") >= 0) {
          const parts1 = lines[i].split("(");
          if (parts1 && parts1.length > 1 && parts1[0].indexOf("x") >= 0) {
            const resParts = parts1[0].trim().split("x");
            currentDisplay.currentResX = util$c.toInt(resParts[0]);
            currentDisplay.currentResY = util$c.toInt(resParts[1]);
          }
          is_current = true;
        }
        if (is_current && lines[i].toLowerCase().indexOf("clock") >= 0 && lines[i].toLowerCase().indexOf("hz") >= 0 && lines[i].toLowerCase().indexOf("v: height") >= 0) {
          const parts1 = lines[i].split("clock");
          if (parts1 && parts1.length > 1 && parts1[1].toLowerCase().indexOf("hz") >= 0) {
            currentDisplay.currentRefreshRate = util$c.toInt(parts1[1]);
          }
          is_current = false;
        }
      }
    }
    if (currentDisplay.model || currentDisplay.main || currentDisplay.builtin || currentDisplay.connection || currentDisplay.sizeX !== null || currentDisplay.pixelDepth !== null || currentDisplay.resolutionX !== null) {
      displays.push(currentDisplay);
    }
    return displays;
  }
  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = {
        controllers: [],
        displays: []
      };
      if (_darwin$a) {
        let cmd = "system_profiler -xml -detailLevel full SPDisplaysDataType";
        exec$a(cmd, function(error, stdout) {
          if (!error) {
            try {
              const output = stdout.toString();
              result = parseLinesDarwin(util$c.plistParser(output)[0]._items);
            } catch (e) {
              util$c.noop();
            }
            try {
              stdout = execSync$6('defaults read /Library/Preferences/com.apple.windowserver.plist 2>/dev/null;defaults read /Library/Preferences/com.apple.windowserver.displays.plist 2>/dev/null; echo ""', { maxBuffer: 1024 * 2e4 });
              const output = (stdout || "").toString();
              const obj = util$c.plistReader(output);
              if (obj["DisplayAnyUserSets"] && obj["DisplayAnyUserSets"]["Configs"] && obj["DisplayAnyUserSets"]["Configs"][0] && obj["DisplayAnyUserSets"]["Configs"][0]["DisplayConfig"]) {
                const current = obj["DisplayAnyUserSets"]["Configs"][0]["DisplayConfig"];
                let i = 0;
                current.forEach((o) => {
                  if (o["CurrentInfo"] && o["CurrentInfo"]["OriginX"] !== void 0 && result.displays && result.displays[i]) {
                    result.displays[i].positionX = o["CurrentInfo"]["OriginX"];
                  }
                  if (o["CurrentInfo"] && o["CurrentInfo"]["OriginY"] !== void 0 && result.displays && result.displays[i]) {
                    result.displays[i].positionY = o["CurrentInfo"]["OriginY"];
                  }
                  i++;
                });
              }
              if (obj["DisplayAnyUserSets"] && obj["DisplayAnyUserSets"].length > 0 && obj["DisplayAnyUserSets"][0].length > 0 && obj["DisplayAnyUserSets"][0][0]["DisplayID"]) {
                const current = obj["DisplayAnyUserSets"][0];
                let i = 0;
                current.forEach((o) => {
                  if ("OriginX" in o && result.displays && result.displays[i]) {
                    result.displays[i].positionX = o["OriginX"];
                  }
                  if ("OriginY" in o && result.displays && result.displays[i]) {
                    result.displays[i].positionY = o["OriginY"];
                  }
                  if (o["Mode"] && o["Mode"]["BitsPerPixel"] !== void 0 && result.displays && result.displays[i]) {
                    result.displays[i].pixelDepth = o["Mode"]["BitsPerPixel"];
                  }
                  i++;
                });
              }
            } catch (e) {
              util$c.noop();
            }
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_linux$a) {
        if (util$c.isRaspberry() && util$c.isRaspbian()) {
          let cmd = `fbset -s | grep 'mode "'; vcgencmd get_mem gpu; tvservice -s; tvservice -n;`;
          exec$a(cmd, function(error, stdout) {
            let lines = stdout.toString().split("\n");
            if (lines.length > 3 && lines[0].indexOf('mode "') >= -1 && lines[2].indexOf("0x12000a") > -1) {
              const parts = lines[0].replace("mode", "").replace(/"/g, "").trim().split("x");
              if (parts.length === 2) {
                result.displays.push({
                  vendor: "",
                  model: util$c.getValue(lines, "device_name", "="),
                  main: true,
                  builtin: false,
                  connection: "HDMI",
                  sizeX: null,
                  sizeY: null,
                  pixelDepth: null,
                  resolutionX: parseInt(parts[0], 10),
                  resolutionY: parseInt(parts[1], 10),
                  currentResX: null,
                  currentResY: null,
                  positionX: 0,
                  positionY: 0,
                  currentRefreshRate: null
                });
              }
            }
            if (lines.length > 1 && stdout.toString().indexOf("gpu=") >= -1) {
              result.controllers.push({
                vendor: "Broadcom",
                model: util$c.getRpiGpu(),
                bus: "",
                vram: util$c.getValue(lines, "gpu", "=").replace("M", ""),
                vramDynamic: true
              });
            }
            if (callback) {
              callback(result);
            }
            resolve(result);
          });
        } else {
          let cmd = "lspci -vvv  2>/dev/null";
          exec$a(cmd, function(error, stdout) {
            if (!error) {
              let lines = stdout.toString().split("\n");
              result.controllers = parseLinesLinuxControllers(lines);
              const nvidiaData = nvidiaDevices();
              result.controllers = result.controllers.map((controller) => {
                return mergeControllerNvidia(controller, nvidiaData.find((contr) => contr.pciBus.toLowerCase().endsWith(controller.busAddress.toLowerCase())) || {});
              });
            }
            let cmd2 = "clinfo --raw";
            exec$a(cmd2, function(error2, stdout2) {
              if (!error2) {
                let lines = stdout2.toString().split("\n");
                result.controllers = parseLinesLinuxClinfo(result.controllers, lines);
              }
              let cmd3 = "xdpyinfo 2>/dev/null | grep 'depth of root window' | awk '{ print $5 }'";
              exec$a(cmd3, function(error3, stdout3) {
                let depth = 0;
                if (!error3) {
                  let lines = stdout3.toString().split("\n");
                  depth = parseInt(lines[0]) || 0;
                }
                let cmd4 = "xrandr --verbose 2>/dev/null";
                exec$a(cmd4, function(error4, stdout4) {
                  if (!error4) {
                    let lines = stdout4.toString().split("\n");
                    result.displays = parseLinesLinuxDisplays(lines, depth);
                  }
                  if (callback) {
                    callback(result);
                  }
                  resolve(result);
                });
              });
            });
          });
        }
      }
      if (_freebsd$9 || _openbsd$9 || _netbsd$9) {
        if (callback) {
          callback(null);
        }
        resolve(null);
      }
      if (_sunos$9) {
        if (callback) {
          callback(null);
        }
        resolve(null);
      }
      if (_windows$b) {
        try {
          const workload = [];
          workload.push(util$c.powerShell("Get-CimInstance win32_VideoController | fl *"));
          workload.push(util$c.powerShell('gp "HKLM:\\SYSTEM\\ControlSet001\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}\\*" -ErrorAction SilentlyContinue | where MatchingDeviceId $null -NE | select MatchingDeviceId,HardwareInformation.qwMemorySize | fl'));
          workload.push(util$c.powerShell("Get-CimInstance win32_desktopmonitor | fl *"));
          workload.push(util$c.powerShell("Get-CimInstance -Namespace root\\wmi -ClassName WmiMonitorBasicDisplayParams | fl"));
          workload.push(util$c.powerShell("Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Screen]::AllScreens"));
          workload.push(util$c.powerShell("Get-CimInstance -Namespace root\\wmi -ClassName WmiMonitorConnectionParams | fl"));
          workload.push(util$c.powerShell('gwmi WmiMonitorID -Namespace root\\wmi | ForEach-Object {(($_.ManufacturerName -notmatch 0 | foreach {[char]$_}) -join "") + "|" + (($_.ProductCodeID -notmatch 0 | foreach {[char]$_}) -join "") + "|" + (($_.UserFriendlyName -notmatch 0 | foreach {[char]$_}) -join "") + "|" + (($_.SerialNumberID -notmatch 0 | foreach {[char]$_}) -join "") + "|" + $_.InstanceName}'));
          const nvidiaData = nvidiaDevices();
          Promise.all(
            workload
          ).then((data) => {
            let csections = data[0].replace(/\r/g, "").split(/\n\s*\n/);
            let vsections = data[1].replace(/\r/g, "").split(/\n\s*\n/);
            result.controllers = parseLinesWindowsControllers(csections, vsections);
            result.controllers = result.controllers.map((controller) => {
              if (controller.vendor.toLowerCase() === "nvidia") {
                return mergeControllerNvidia(controller, nvidiaData.find((device) => {
                  let windowsSubDeviceId = (controller.subDeviceId || "").toLowerCase();
                  const nvidiaSubDeviceIdParts = device.subDeviceId.split("x");
                  let nvidiaSubDeviceId = nvidiaSubDeviceIdParts.length > 1 ? nvidiaSubDeviceIdParts[1].toLowerCase() : nvidiaSubDeviceIdParts[0].toLowerCase();
                  const lengthDifference = Math.abs(windowsSubDeviceId.length - nvidiaSubDeviceId.length);
                  if (windowsSubDeviceId.length > nvidiaSubDeviceId.length) {
                    for (let i = 0; i < lengthDifference; i++) {
                      nvidiaSubDeviceId = "0" + nvidiaSubDeviceId;
                    }
                  } else if (windowsSubDeviceId.length < nvidiaSubDeviceId.length) {
                    for (let i = 0; i < lengthDifference; i++) {
                      windowsSubDeviceId = "0" + windowsSubDeviceId;
                    }
                  }
                  return windowsSubDeviceId === nvidiaSubDeviceId;
                }) || {});
              } else {
                return controller;
              }
            });
            let dsections = data[2].replace(/\r/g, "").split(/\n\s*\n/);
            if (dsections[0].trim() === "") {
              dsections.shift();
            }
            if (dsections.length && dsections[dsections.length - 1].trim() === "") {
              dsections.pop();
            }
            let msections = data[3].replace(/\r/g, "").split("Active ");
            msections.shift();
            let ssections = data[4].replace(/\r/g, "").split("BitsPerPixel ");
            ssections.shift();
            let tsections = data[5].replace(/\r/g, "").split(/\n\s*\n/);
            tsections.shift();
            const res = data[6].replace(/\r/g, "").split(/\n/);
            let isections = [];
            res.forEach((element) => {
              const parts = element.split("|");
              if (parts.length === 5) {
                isections.push({
                  vendor: parts[0],
                  code: parts[1],
                  model: parts[2],
                  serial: parts[3],
                  instanceId: parts[4]
                });
              }
            });
            result.displays = parseLinesWindowsDisplaysPowershell(ssections, msections, dsections, tsections, isections);
            if (result.displays.length === 1) {
              if (_resolutionX) {
                result.displays[0].resolutionX = _resolutionX;
                if (!result.displays[0].currentResX) {
                  result.displays[0].currentResX = _resolutionX;
                }
              }
              if (_resolutionY) {
                result.displays[0].resolutionY = _resolutionY;
                if (result.displays[0].currentResY === 0) {
                  result.displays[0].currentResY = _resolutionY;
                }
              }
              if (_pixelDepth) {
                result.displays[0].pixelDepth = _pixelDepth;
              }
            }
            result.displays = result.displays.map((element) => {
              if (_refreshRate && !element.currentRefreshRate) {
                element.currentRefreshRate = _refreshRate;
              }
              return element;
            });
            if (callback) {
              callback(result);
            }
            resolve(result);
          }).catch(() => {
            if (callback) {
              callback(result);
            }
            resolve(result);
          });
        } catch (e) {
          if (callback) {
            callback(result);
          }
          resolve(result);
        }
      }
    });
  });
  function parseLinesWindowsControllers(sections, vections) {
    const memorySizes = {};
    for (const i in vections) {
      if ({}.hasOwnProperty.call(vections, i)) {
        if (vections[i].trim() !== "") {
          const lines = vections[i].trim().split("\n");
          const matchingDeviceId = util$c.getValue(lines, "MatchingDeviceId").match(/PCI\\(VEN_[0-9A-F]{4})&(DEV_[0-9A-F]{4})(?:&(SUBSYS_[0-9A-F]{8}))?(?:&(REV_[0-9A-F]{2}))?/i);
          if (matchingDeviceId) {
            const quadWordmemorySize = parseInt(util$c.getValue(lines, "HardwareInformation.qwMemorySize"));
            if (!isNaN(quadWordmemorySize)) {
              let deviceId = matchingDeviceId[1].toUpperCase() + "&" + matchingDeviceId[2].toUpperCase();
              if (matchingDeviceId[3]) {
                deviceId += "&" + matchingDeviceId[3].toUpperCase();
              }
              if (matchingDeviceId[4]) {
                deviceId += "&" + matchingDeviceId[4].toUpperCase();
              }
              memorySizes[deviceId] = quadWordmemorySize;
            }
          }
        }
      }
    }
    let controllers = [];
    for (let i in sections) {
      if ({}.hasOwnProperty.call(sections, i)) {
        if (sections[i].trim() !== "") {
          let lines = sections[i].trim().split("\n");
          let pnpDeviceId = util$c.getValue(lines, "PNPDeviceID", ":").match(/PCI\\(VEN_[0-9A-F]{4})&(DEV_[0-9A-F]{4})(?:&(SUBSYS_[0-9A-F]{8}))?(?:&(REV_[0-9A-F]{2}))?/i);
          let subDeviceId = null;
          let memorySize = null;
          if (pnpDeviceId) {
            subDeviceId = pnpDeviceId[3] || "";
            if (subDeviceId) {
              subDeviceId = subDeviceId.split("_")[1];
            }
            if (memorySize == null && pnpDeviceId[3] && pnpDeviceId[4]) {
              const deviceId = pnpDeviceId[1].toUpperCase() + "&" + pnpDeviceId[2].toUpperCase() + "&" + pnpDeviceId[3].toUpperCase() + "&" + pnpDeviceId[4].toUpperCase();
              if ({}.hasOwnProperty.call(memorySizes, deviceId)) {
                memorySize = memorySizes[deviceId];
              }
            }
            if (memorySize == null && pnpDeviceId[3]) {
              const deviceId = pnpDeviceId[1].toUpperCase() + "&" + pnpDeviceId[2].toUpperCase() + "&" + pnpDeviceId[3].toUpperCase();
              if ({}.hasOwnProperty.call(memorySizes, deviceId)) {
                memorySize = memorySizes[deviceId];
              }
            }
            if (memorySize == null && pnpDeviceId[4]) {
              const deviceId = pnpDeviceId[1].toUpperCase() + "&" + pnpDeviceId[2].toUpperCase() + "&" + pnpDeviceId[4].toUpperCase();
              if ({}.hasOwnProperty.call(memorySizes, deviceId)) {
                memorySize = memorySizes[deviceId];
              }
            }
            if (memorySize == null) {
              const deviceId = pnpDeviceId[1].toUpperCase() + "&" + pnpDeviceId[2].toUpperCase();
              if ({}.hasOwnProperty.call(memorySizes, deviceId)) {
                memorySize = memorySizes[deviceId];
              }
            }
          }
          controllers.push({
            vendor: util$c.getValue(lines, "AdapterCompatibility", ":"),
            model: util$c.getValue(lines, "name", ":"),
            bus: util$c.getValue(lines, "PNPDeviceID", ":").startsWith("PCI") ? "PCI" : "",
            vram: (memorySize == null ? util$c.toInt(util$c.getValue(lines, "AdapterRAM", ":")) : memorySize) / 1024 / 1024,
            vramDynamic: util$c.getValue(lines, "VideoMemoryType", ":") === "2",
            subDeviceId
          });
          _resolutionX = util$c.toInt(util$c.getValue(lines, "CurrentHorizontalResolution", ":")) || _resolutionX;
          _resolutionY = util$c.toInt(util$c.getValue(lines, "CurrentVerticalResolution", ":")) || _resolutionY;
          _refreshRate = util$c.toInt(util$c.getValue(lines, "CurrentRefreshRate", ":")) || _refreshRate;
          _pixelDepth = util$c.toInt(util$c.getValue(lines, "CurrentBitsPerPixel", ":")) || _pixelDepth;
        }
      }
    }
    return controllers;
  }
  function parseLinesWindowsDisplaysPowershell(ssections, msections, dsections, tsections, isections) {
    let displays = [];
    let vendor = "";
    let model = "";
    let deviceID = "";
    let resolutionX = 0;
    let resolutionY = 0;
    if (dsections && dsections.length) {
      let linesDisplay = dsections[0].split("\n");
      vendor = util$c.getValue(linesDisplay, "MonitorManufacturer", ":");
      model = util$c.getValue(linesDisplay, "Name", ":");
      deviceID = util$c.getValue(linesDisplay, "PNPDeviceID", ":").replace(/&amp;/g, "&").toLowerCase();
      resolutionX = util$c.toInt(util$c.getValue(linesDisplay, "ScreenWidth", ":"));
      resolutionY = util$c.toInt(util$c.getValue(linesDisplay, "ScreenHeight", ":"));
    }
    for (let i = 0; i < ssections.length; i++) {
      if (ssections[i].trim() !== "") {
        ssections[i] = "BitsPerPixel " + ssections[i];
        msections[i] = "Active " + msections[i];
        if (tsections.length === 0 || tsections[i] === void 0) {
          tsections[i] = "Unknown";
        }
        let linesScreen = ssections[i].split("\n");
        let linesMonitor = msections[i].split("\n");
        let linesConnection = tsections[i].split("\n");
        const bitsPerPixel = util$c.getValue(linesScreen, "BitsPerPixel");
        const bounds = util$c.getValue(linesScreen, "Bounds").replace("{", "").replace("}", "").replace(/=/g, ":").split(",");
        const primary = util$c.getValue(linesScreen, "Primary");
        const sizeX = util$c.getValue(linesMonitor, "MaxHorizontalImageSize");
        const sizeY = util$c.getValue(linesMonitor, "MaxVerticalImageSize");
        const instanceName = util$c.getValue(linesMonitor, "InstanceName").toLowerCase();
        const videoOutputTechnology = util$c.getValue(linesConnection, "VideoOutputTechnology");
        const deviceName = util$c.getValue(linesScreen, "DeviceName");
        let displayVendor = "";
        let displayModel = "";
        isections.forEach((element) => {
          if (element.instanceId.toLowerCase().startsWith(instanceName) && vendor.startsWith("(") && model.startsWith("PnP")) {
            displayVendor = element.vendor;
            displayModel = element.model;
          }
        });
        displays.push({
          vendor: instanceName.startsWith(deviceID) && displayVendor === "" ? vendor : displayVendor,
          model: instanceName.startsWith(deviceID) && displayModel === "" ? model : displayModel,
          deviceName,
          main: primary.toLowerCase() === "true",
          builtin: videoOutputTechnology === "2147483648",
          connection: videoOutputTechnology && videoTypes[videoOutputTechnology] ? videoTypes[videoOutputTechnology] : "",
          resolutionX: util$c.toInt(util$c.getValue(bounds, "Width", ":")),
          resolutionY: util$c.toInt(util$c.getValue(bounds, "Height", ":")),
          sizeX: sizeX ? parseInt(sizeX, 10) : null,
          sizeY: sizeY ? parseInt(sizeY, 10) : null,
          pixelDepth: bitsPerPixel,
          currentResX: util$c.toInt(util$c.getValue(bounds, "Width", ":")),
          currentResY: util$c.toInt(util$c.getValue(bounds, "Height", ":")),
          positionX: util$c.toInt(util$c.getValue(bounds, "X", ":")),
          positionY: util$c.toInt(util$c.getValue(bounds, "Y", ":"))
        });
      }
    }
    if (ssections.length === 0) {
      displays.push({
        vendor,
        model,
        main: true,
        sizeX: null,
        sizeY: null,
        resolutionX,
        resolutionY,
        pixelDepth: null,
        currentResX: resolutionX,
        currentResY: resolutionY,
        positionX: 0,
        positionY: 0
      });
    }
    return displays;
  }
}
graphics$1.graphics = graphics;
var filesystem = {};
const util$b = util$j;
const fs$5 = require$$1$1;
const exec$9 = require$$1.exec;
const execSync$5 = require$$1.execSync;
const execPromiseSave = util$b.promisifySave(require$$1.exec);
let _platform$a = process.platform;
const _linux$9 = _platform$a === "linux" || _platform$a === "android";
const _darwin$9 = _platform$a === "darwin";
const _windows$a = _platform$a === "win32";
const _freebsd$8 = _platform$a === "freebsd";
const _openbsd$8 = _platform$a === "openbsd";
const _netbsd$8 = _platform$a === "netbsd";
const _sunos$8 = _platform$a === "sunos";
let _fs_speed = {};
let _disk_io = {};
function fsSize(drive, callback) {
  if (util$b.isFunction(drive)) {
    callback = drive;
    drive = "";
  }
  let macOsDisks = [];
  let osMounts = [];
  function getmacOsFsType(fs2) {
    if (!fs2.startsWith("/")) {
      return "NFS";
    }
    const parts = fs2.split("/");
    const fsShort = parts[parts.length - 1];
    const macOsDisksSingle = macOsDisks.filter((item) => item.indexOf(fsShort) >= 0);
    if (macOsDisksSingle.length === 1 && macOsDisksSingle[0].indexOf("APFS") >= 0) {
      return "APFS";
    }
    return "HFS";
  }
  function isLinuxTmpFs(fs2) {
    const linuxTmpFileSystems = ["rootfs", "unionfs", "squashfs", "cramfs", "initrd", "initramfs", "devtmpfs", "tmpfs", "udev", "devfs", "specfs", "type", "appimaged"];
    let result = false;
    linuxTmpFileSystems.forEach((linuxFs) => {
      if (fs2.toLowerCase().indexOf(linuxFs) >= 0) {
        result = true;
      }
    });
    return result;
  }
  function filterLines(stdout) {
    let lines = stdout.toString().split("\n");
    lines.shift();
    if (stdout.toString().toLowerCase().indexOf("filesystem")) {
      let removeLines = 0;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i] && lines[i].toLowerCase().startsWith("filesystem")) {
          removeLines = i;
        }
      }
      for (let i = 0; i < removeLines; i++) {
        lines.shift();
      }
    }
    return lines;
  }
  function parseDf(lines) {
    let data = [];
    lines.forEach(function(line) {
      if (line !== "") {
        line = line.replace(/ +/g, " ").split(" ");
        if (line && (line[0].startsWith("/") || line[6] && line[6] === "/" || line[0].indexOf("/") > 0 || line[0].indexOf(":") === 1 || !_darwin$9 && !isLinuxTmpFs(line[1]))) {
          const fs2 = line[0];
          const fsType = _linux$9 || _freebsd$8 || _openbsd$8 || _netbsd$8 ? line[1] : getmacOsFsType(line[0]);
          const size = parseInt(_linux$9 || _freebsd$8 || _openbsd$8 || _netbsd$8 ? line[2] : line[1]) * 1024;
          const used = parseInt(_linux$9 || _freebsd$8 || _openbsd$8 || _netbsd$8 ? line[3] : line[2]) * 1024;
          const available = parseInt(_linux$9 || _freebsd$8 || _openbsd$8 || _netbsd$8 ? line[4] : line[3]) * 1024;
          const use = parseFloat((100 * (used / (used + available))).toFixed(2));
          let rw = osMounts && Object.keys(osMounts).length > 0 ? osMounts[fs2] || false : null;
          line.splice(0, _linux$9 || _freebsd$8 || _openbsd$8 || _netbsd$8 ? 6 : 5);
          const mount = line.join(" ");
          if (!data.find((el) => el.fs === fs2 && el.type === fsType)) {
            data.push({
              fs: fs2,
              type: fsType,
              size,
              used,
              available,
              use,
              mount,
              rw
            });
          }
        }
      }
    });
    return data;
  }
  return new Promise((resolve) => {
    process.nextTick(() => {
      let data = [];
      if (_linux$9 || _freebsd$8 || _openbsd$8 || _netbsd$8 || _darwin$9) {
        let cmd = "";
        macOsDisks = [];
        osMounts = {};
        if (_darwin$9) {
          cmd = "df -kP";
          try {
            macOsDisks = execSync$5("diskutil list").toString().split("\n").filter((line) => {
              return !line.startsWith("/") && line.indexOf(":") > 0;
            });
            execSync$5("mount").toString().split("\n").filter((line) => {
              return line.startsWith("/");
            }).forEach((line) => {
              osMounts[line.split(" ")[0]] = line.toLowerCase().indexOf("read-only") === -1;
            });
          } catch (e) {
            util$b.noop();
          }
        }
        if (_linux$9) {
          try {
            cmd = "export LC_ALL=C; df -lkPTx squashfs; unset LC_ALL";
            execSync$5("cat /proc/mounts 2>/dev/null").toString().split("\n").filter((line) => {
              return line.startsWith("/");
            }).forEach((line) => {
              osMounts[line.split(" ")[0]] = osMounts[line.split(" ")[0]] || false;
              if (line.toLowerCase().indexOf("/snap/") === -1) {
                osMounts[line.split(" ")[0]] = line.toLowerCase().indexOf("rw,") >= 0 || line.toLowerCase().indexOf(" rw ") >= 0;
              }
            });
          } catch (e) {
            util$b.noop();
          }
        }
        if (_freebsd$8 || _openbsd$8 || _netbsd$8) {
          try {
            cmd = "df -lkPT";
            execSync$5("mount").toString().split("\n").forEach((line) => {
              osMounts[line.split(" ")[0]] = line.toLowerCase().indexOf("read-only") === -1;
            });
          } catch (e) {
            util$b.noop();
          }
        }
        exec$9(cmd, { maxBuffer: 1024 * 1024 }, function(error, stdout) {
          let lines = filterLines(stdout);
          data = parseDf(lines);
          if (drive) {
            data = data.filter((item) => {
              return item.fs.toLowerCase().indexOf(drive.toLowerCase()) >= 0 || item.mount.toLowerCase().indexOf(drive.toLowerCase()) >= 0;
            });
          }
          if ((!error || data.length) && stdout.toString().trim() !== "") {
            if (callback) {
              callback(data);
            }
            resolve(data);
          } else {
            exec$9("df -kPT", { maxBuffer: 1024 * 1024 }, function(error2, stdout2) {
              if (!error2) {
                let lines2 = filterLines(stdout2);
                data = parseDf(lines2);
              }
              if (callback) {
                callback(data);
              }
              resolve(data);
            });
          }
        });
      }
      if (_sunos$8) {
        if (callback) {
          callback(data);
        }
        resolve(data);
      }
      if (_windows$a) {
        try {
          const cmd = `Get-WmiObject Win32_logicaldisk | select Access,Caption,FileSystem,FreeSpace,Size ${drive ? "| where -property Caption -eq " + drive : ""} | fl`;
          util$b.powerShell(cmd).then((stdout, error) => {
            if (!error) {
              let devices = stdout.toString().split(/\n\s*\n/);
              devices.forEach(function(device) {
                let lines = device.split("\r\n");
                const size = util$b.toInt(util$b.getValue(lines, "size", ":"));
                const free = util$b.toInt(util$b.getValue(lines, "freespace", ":"));
                const caption = util$b.getValue(lines, "caption", ":");
                const rwValue = util$b.getValue(lines, "access", ":");
                const rw = rwValue ? util$b.toInt(rwValue) !== 1 : null;
                if (size) {
                  data.push({
                    fs: caption,
                    type: util$b.getValue(lines, "filesystem", ":"),
                    size,
                    used: size - free,
                    available: free,
                    use: parseFloat((100 * (size - free) / size).toFixed(2)),
                    mount: caption,
                    rw
                  });
                }
              });
            }
            if (callback) {
              callback(data);
            }
            resolve(data);
          });
        } catch (e) {
          if (callback) {
            callback(data);
          }
          resolve(data);
        }
      }
    });
  });
}
filesystem.fsSize = fsSize;
function fsOpenFiles(callback) {
  return new Promise((resolve) => {
    process.nextTick(() => {
      const result = {
        max: null,
        allocated: null,
        available: null
      };
      if (_freebsd$8 || _openbsd$8 || _netbsd$8 || _darwin$9) {
        let cmd = "sysctl -i kern.maxfiles kern.num_files kern.open_files";
        exec$9(cmd, { maxBuffer: 1024 * 1024 }, function(error, stdout) {
          if (!error) {
            let lines = stdout.toString().split("\n");
            result.max = parseInt(util$b.getValue(lines, "kern.maxfiles", ":"), 10);
            result.allocated = parseInt(util$b.getValue(lines, "kern.num_files", ":"), 10) || parseInt(util$b.getValue(lines, "kern.open_files", ":"), 10);
            result.available = result.max - result.allocated;
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_linux$9) {
        fs$5.readFile("/proc/sys/fs/file-nr", function(error, stdout) {
          if (!error) {
            let lines = stdout.toString().split("\n");
            if (lines[0]) {
              const parts = lines[0].replace(/\s+/g, " ").split(" ");
              if (parts.length === 3) {
                result.allocated = parseInt(parts[0], 10);
                result.available = parseInt(parts[1], 10);
                result.max = parseInt(parts[2], 10);
                if (!result.available) {
                  result.available = result.max - result.allocated;
                }
              }
            }
            if (callback) {
              callback(result);
            }
            resolve(result);
          } else {
            fs$5.readFile("/proc/sys/fs/file-max", function(error2, stdout2) {
              if (!error2) {
                let lines = stdout2.toString().split("\n");
                if (lines[0]) {
                  result.max = parseInt(lines[0], 10);
                }
              }
              if (callback) {
                callback(result);
              }
              resolve(result);
            });
          }
        });
      }
      if (_sunos$8) {
        if (callback) {
          callback(null);
        }
        resolve(null);
      }
      if (_windows$a) {
        if (callback) {
          callback(null);
        }
        resolve(null);
      }
    });
  });
}
filesystem.fsOpenFiles = fsOpenFiles;
function parseBytes(s) {
  return parseInt(s.substr(s.indexOf(" (") + 2, s.indexOf(" Bytes)") - 10));
}
function parseDevices(lines) {
  let devices = [];
  let i = 0;
  lines.forEach((line) => {
    if (line.length > 0) {
      if (line[0] === "*") {
        i++;
      } else {
        let parts = line.split(":");
        if (parts.length > 1) {
          if (!devices[i]) {
            devices[i] = {
              name: "",
              identifier: "",
              type: "disk",
              fsType: "",
              mount: "",
              size: 0,
              physical: "HDD",
              uuid: "",
              label: "",
              model: "",
              serial: "",
              removable: false,
              protocol: "",
              group: "",
              device: ""
            };
          }
          parts[0] = parts[0].trim().toUpperCase().replace(/ +/g, "");
          parts[1] = parts[1].trim();
          if ("DEVICEIDENTIFIER" === parts[0]) {
            devices[i].identifier = parts[1];
          }
          if ("DEVICENODE" === parts[0]) {
            devices[i].name = parts[1];
          }
          if ("VOLUMENAME" === parts[0]) {
            if (parts[1].indexOf("Not applicable") === -1) {
              devices[i].label = parts[1];
            }
          }
          if ("PROTOCOL" === parts[0]) {
            devices[i].protocol = parts[1];
          }
          if ("DISKSIZE" === parts[0]) {
            devices[i].size = parseBytes(parts[1]);
          }
          if ("FILESYSTEMPERSONALITY" === parts[0]) {
            devices[i].fsType = parts[1];
          }
          if ("MOUNTPOINT" === parts[0]) {
            devices[i].mount = parts[1];
          }
          if ("VOLUMEUUID" === parts[0]) {
            devices[i].uuid = parts[1];
          }
          if ("READ-ONLYMEDIA" === parts[0] && parts[1] === "Yes") {
            devices[i].physical = "CD/DVD";
          }
          if ("SOLIDSTATE" === parts[0] && parts[1] === "Yes") {
            devices[i].physical = "SSD";
          }
          if ("VIRTUAL" === parts[0]) {
            devices[i].type = "virtual";
          }
          if ("REMOVABLEMEDIA" === parts[0]) {
            devices[i].removable = parts[1] === "Removable";
          }
          if ("PARTITIONTYPE" === parts[0]) {
            devices[i].type = "part";
          }
          if ("DEVICE/MEDIANAME" === parts[0]) {
            devices[i].model = parts[1];
          }
        }
      }
    }
  });
  return devices;
}
function parseBlk(lines) {
  let data = [];
  lines.filter((line) => line !== "").forEach((line) => {
    try {
      line = decodeURIComponent(line.replace(/\\x/g, "%"));
      line = line.replace(/\\/g, "\\\\");
      let disk = JSON.parse(line);
      data.push({
        "name": disk.name,
        "type": disk.type,
        "fsType": disk.fsType,
        "mount": disk.mountpoint,
        "size": parseInt(disk.size),
        "physical": disk.type === "disk" ? disk.rota === "0" ? "SSD" : "HDD" : disk.type === "rom" ? "CD/DVD" : "",
        "uuid": disk.uuid,
        "label": disk.label,
        "model": (disk.model || "").trim(),
        "serial": disk.serial,
        "removable": disk.rm === "1",
        "protocol": disk.tran,
        "group": disk.group || ""
      });
    } catch (e) {
      util$b.noop();
    }
  });
  data = util$b.unique(data);
  data = util$b.sortByKey(data, ["type", "name"]);
  return data;
}
function decodeMdabmData(lines) {
  const raid = util$b.getValue(lines, "md_level", "=");
  const label = util$b.getValue(lines, "md_name", "=");
  const uuid2 = util$b.getValue(lines, "md_uuid", "=");
  const members = [];
  lines.forEach((line) => {
    if (line.toLowerCase().startsWith("md_device_dev") && line.toLowerCase().indexOf("/dev/") > 0) {
      members.push(line.split("/dev/")[1]);
    }
  });
  return {
    raid,
    label,
    uuid: uuid2,
    members
  };
}
function raidMatchLinux(data) {
  let result = data;
  try {
    data.forEach((element) => {
      if (element.type.startsWith("raid")) {
        const lines = execSync$5(`mdadm --export --detail /dev/${element.name}`).toString().split("\n");
        const mdData = decodeMdabmData(lines);
        element.label = mdData.label;
        element.uuid = mdData.uuid;
        if (mdData.members && mdData.members.length && mdData.raid === element.type) {
          result = result.map((blockdevice) => {
            if (blockdevice.fsType === "linux_raid_member" && mdData.members.indexOf(blockdevice.name) >= 0) {
              blockdevice.group = element.name;
            }
            return blockdevice;
          });
        }
      }
    });
  } catch (e) {
    util$b.noop();
  }
  return result;
}
function getDevicesLinux(data) {
  const result = [];
  data.forEach((element) => {
    if (element.type.startsWith("disk")) {
      result.push(element.name);
    }
  });
  return result;
}
function matchDevicesLinux(data) {
  let result = data;
  try {
    const devices = getDevicesLinux(data);
    result = result.map((blockdevice) => {
      if (blockdevice.type.startsWith("part") || blockdevice.type.startsWith("disk")) {
        devices.forEach((element) => {
          if (blockdevice.name.startsWith(element)) {
            blockdevice.device = "/dev/" + element;
          }
        });
      }
      return blockdevice;
    });
  } catch (e) {
    util$b.noop();
  }
  return result;
}
function getDevicesMac(data) {
  const result = [];
  data.forEach((element) => {
    if (element.type.startsWith("disk")) {
      result.push({ name: element.name, model: element.model, device: element.name });
    }
    if (element.type.startsWith("virtual")) {
      let device = "";
      result.forEach((e) => {
        if (e.model === element.model) {
          device = e.device;
        }
      });
      if (device) {
        result.push({ name: element.name, model: element.model, device });
      }
    }
  });
  return result;
}
function matchDevicesMac(data) {
  let result = data;
  try {
    const devices = getDevicesMac(data);
    result = result.map((blockdevice) => {
      if (blockdevice.type.startsWith("part") || blockdevice.type.startsWith("disk") || blockdevice.type.startsWith("virtual")) {
        devices.forEach((element) => {
          if (blockdevice.name.startsWith(element.name)) {
            blockdevice.device = element.device;
          }
        });
      }
      return blockdevice;
    });
  } catch (e) {
    util$b.noop();
  }
  return result;
}
function getDevicesWin(diskDrives) {
  const result = [];
  diskDrives.forEach((element) => {
    const lines = element.split("\r\n");
    const device = util$b.getValue(lines, "DeviceID", ":");
    let partitions = element.split("@{DeviceID=");
    if (partitions.length > 1) {
      partitions = partitions.slice(1);
      partitions.forEach((partition) => {
        result.push({ name: partition.split(";")[0].toUpperCase(), device });
      });
    }
  });
  return result;
}
function matchDevicesWin(data, diskDrives) {
  const devices = getDevicesWin(diskDrives);
  data.map((element) => {
    const filteresDevices = devices.filter((e) => {
      return e.name === element.name.toUpperCase();
    });
    if (filteresDevices.length > 0) {
      element.device = filteresDevices[0].device;
    }
    return element;
  });
  return data;
}
function blkStdoutToObject(stdout) {
  return stdout.toString().replace(/NAME=/g, '{"name":').replace(/FSTYPE=/g, ',"fsType":').replace(/TYPE=/g, ',"type":').replace(/SIZE=/g, ',"size":').replace(/MOUNTPOINT=/g, ',"mountpoint":').replace(/UUID=/g, ',"uuid":').replace(/ROTA=/g, ',"rota":').replace(/RO=/g, ',"ro":').replace(/RM=/g, ',"rm":').replace(/TRAN=/g, ',"tran":').replace(/SERIAL=/g, ',"serial":').replace(/LABEL=/g, ',"label":').replace(/MODEL=/g, ',"model":').replace(/OWNER=/g, ',"owner":').replace(/GROUP=/g, ',"group":').replace(/\n/g, "}\n");
}
function blockDevices(callback) {
  return new Promise((resolve) => {
    process.nextTick(() => {
      let data = [];
      if (_linux$9) {
        exec$9("lsblk -bPo NAME,TYPE,SIZE,FSTYPE,MOUNTPOINT,UUID,ROTA,RO,RM,TRAN,SERIAL,LABEL,MODEL,OWNER 2>/dev/null", { maxBuffer: 1024 * 1024 }, function(error, stdout) {
          if (!error) {
            let lines = blkStdoutToObject(stdout).split("\n");
            data = parseBlk(lines);
            data = raidMatchLinux(data);
            data = matchDevicesLinux(data);
            if (callback) {
              callback(data);
            }
            resolve(data);
          } else {
            exec$9("lsblk -bPo NAME,TYPE,SIZE,FSTYPE,MOUNTPOINT,UUID,ROTA,RO,RM,LABEL,MODEL,OWNER 2>/dev/null", { maxBuffer: 1024 * 1024 }, function(error2, stdout2) {
              if (!error2) {
                let lines = blkStdoutToObject(stdout2).split("\n");
                data = parseBlk(lines);
                data = raidMatchLinux(data);
              }
              if (callback) {
                callback(data);
              }
              resolve(data);
            });
          }
        });
      }
      if (_darwin$9) {
        exec$9("diskutil info -all", { maxBuffer: 1024 * 1024 }, function(error, stdout) {
          if (!error) {
            let lines = stdout.toString().split("\n");
            data = parseDevices(lines);
            data = matchDevicesMac(data);
          }
          if (callback) {
            callback(data);
          }
          resolve(data);
        });
      }
      if (_sunos$8) {
        if (callback) {
          callback(data);
        }
        resolve(data);
      }
      if (_windows$a) {
        let drivetypes = ["Unknown", "NoRoot", "Removable", "Local", "Network", "CD/DVD", "RAM"];
        try {
          const workload = [];
          workload.push(util$b.powerShell("Get-CimInstance -ClassName Win32_LogicalDisk | select Caption,DriveType,Name,FileSystem,Size,VolumeSerialNumber,VolumeName | fl"));
          workload.push(util$b.powerShell("Get-WmiObject -Class Win32_diskdrive | Select-Object -Property PNPDeviceId,DeviceID, Model, Size, @{L='Partitions'; E={$_.GetRelated('Win32_DiskPartition').GetRelated('Win32_LogicalDisk') | Select-Object -Property DeviceID, VolumeName, Size, FreeSpace}} | fl"));
          util$b.promiseAll(
            workload
          ).then((res) => {
            let logicalDisks = res.results[0].toString().split(/\n\s*\n/);
            let diskDrives = res.results[1].toString().split(/\n\s*\n/);
            logicalDisks.forEach(function(device) {
              let lines = device.split("\r\n");
              let drivetype = util$b.getValue(lines, "drivetype", ":");
              if (drivetype) {
                data.push({
                  name: util$b.getValue(lines, "name", ":"),
                  identifier: util$b.getValue(lines, "caption", ":"),
                  type: "disk",
                  fsType: util$b.getValue(lines, "filesystem", ":").toLowerCase(),
                  mount: util$b.getValue(lines, "caption", ":"),
                  size: util$b.getValue(lines, "size", ":"),
                  physical: drivetype >= 0 && drivetype <= 6 ? drivetypes[drivetype] : drivetypes[0],
                  uuid: util$b.getValue(lines, "volumeserialnumber", ":"),
                  label: util$b.getValue(lines, "volumename", ":"),
                  model: "",
                  serial: util$b.getValue(lines, "volumeserialnumber", ":"),
                  removable: drivetype === "2",
                  protocol: "",
                  group: "",
                  device: ""
                });
              }
            });
            data = matchDevicesWin(data, diskDrives);
            if (callback) {
              callback(data);
            }
            resolve(data);
          });
        } catch (e) {
          if (callback) {
            callback(data);
          }
          resolve(data);
        }
      }
      if (_freebsd$8 || _openbsd$8 || _netbsd$8) {
        if (callback) {
          callback(null);
        }
        resolve(null);
      }
    });
  });
}
filesystem.blockDevices = blockDevices;
function calcFsSpeed(rx, wx) {
  let result = {
    rx: 0,
    wx: 0,
    tx: 0,
    rx_sec: null,
    wx_sec: null,
    tx_sec: null,
    ms: 0
  };
  if (_fs_speed && _fs_speed.ms) {
    result.rx = rx;
    result.wx = wx;
    result.tx = result.rx + result.wx;
    result.ms = Date.now() - _fs_speed.ms;
    result.rx_sec = (result.rx - _fs_speed.bytes_read) / (result.ms / 1e3);
    result.wx_sec = (result.wx - _fs_speed.bytes_write) / (result.ms / 1e3);
    result.tx_sec = result.rx_sec + result.wx_sec;
    _fs_speed.rx_sec = result.rx_sec;
    _fs_speed.wx_sec = result.wx_sec;
    _fs_speed.tx_sec = result.tx_sec;
    _fs_speed.bytes_read = result.rx;
    _fs_speed.bytes_write = result.wx;
    _fs_speed.bytes_overall = result.rx + result.wx;
    _fs_speed.ms = Date.now();
    _fs_speed.last_ms = result.ms;
  } else {
    result.rx = rx;
    result.wx = wx;
    result.tx = result.rx + result.wx;
    _fs_speed.rx_sec = null;
    _fs_speed.wx_sec = null;
    _fs_speed.tx_sec = null;
    _fs_speed.bytes_read = result.rx;
    _fs_speed.bytes_write = result.wx;
    _fs_speed.bytes_overall = result.rx + result.wx;
    _fs_speed.ms = Date.now();
    _fs_speed.last_ms = 0;
  }
  return result;
}
function fsStats(callback) {
  return new Promise((resolve) => {
    process.nextTick(() => {
      if (_windows$a || _freebsd$8 || _openbsd$8 || _netbsd$8 || _sunos$8) {
        return resolve(null);
      }
      let result = {
        rx: 0,
        wx: 0,
        tx: 0,
        rx_sec: null,
        wx_sec: null,
        tx_sec: null,
        ms: 0
      };
      let rx = 0;
      let wx = 0;
      if (_fs_speed && !_fs_speed.ms || _fs_speed && _fs_speed.ms && Date.now() - _fs_speed.ms >= 500) {
        if (_linux$9) {
          exec$9("lsblk -r 2>/dev/null | grep /", { maxBuffer: 1024 * 1024 }, function(error, stdout) {
            if (!error) {
              let lines = stdout.toString().split("\n");
              let fs_filter = [];
              lines.forEach(function(line) {
                if (line !== "") {
                  line = line.trim().split(" ");
                  if (fs_filter.indexOf(line[0]) === -1) {
                    fs_filter.push(line[0]);
                  }
                }
              });
              let output = fs_filter.join("|");
              exec$9('cat /proc/diskstats | egrep "' + output + '"', { maxBuffer: 1024 * 1024 }, function(error2, stdout2) {
                if (!error2) {
                  let lines2 = stdout2.toString().split("\n");
                  lines2.forEach(function(line) {
                    line = line.trim();
                    if (line !== "") {
                      line = line.replace(/ +/g, " ").split(" ");
                      rx += parseInt(line[5]) * 512;
                      wx += parseInt(line[9]) * 512;
                    }
                  });
                  result = calcFsSpeed(rx, wx);
                }
                if (callback) {
                  callback(result);
                }
                resolve(result);
              });
            } else {
              if (callback) {
                callback(result);
              }
              resolve(result);
            }
          });
        }
        if (_darwin$9) {
          exec$9('ioreg -c IOBlockStorageDriver -k Statistics -r -w0 | sed -n "/IOBlockStorageDriver/,/Statistics/p" | grep "Statistics" | tr -cd "01234567890,\n"', { maxBuffer: 1024 * 1024 }, function(error, stdout) {
            if (!error) {
              let lines = stdout.toString().split("\n");
              lines.forEach(function(line) {
                line = line.trim();
                if (line !== "") {
                  line = line.split(",");
                  rx += parseInt(line[2]);
                  wx += parseInt(line[9]);
                }
              });
              result = calcFsSpeed(rx, wx);
            }
            if (callback) {
              callback(result);
            }
            resolve(result);
          });
        }
      } else {
        result.ms = _fs_speed.last_ms;
        result.rx = _fs_speed.bytes_read;
        result.wx = _fs_speed.bytes_write;
        result.tx = _fs_speed.bytes_read + _fs_speed.bytes_write;
        result.rx_sec = _fs_speed.rx_sec;
        result.wx_sec = _fs_speed.wx_sec;
        result.tx_sec = _fs_speed.tx_sec;
        if (callback) {
          callback(result);
        }
        resolve(result);
      }
    });
  });
}
filesystem.fsStats = fsStats;
function calcDiskIO(rIO, wIO, rWaitTime, wWaitTime, tWaitTime) {
  let result = {
    rIO: 0,
    wIO: 0,
    tIO: 0,
    rIO_sec: null,
    wIO_sec: null,
    tIO_sec: null,
    rWaitTime: 0,
    wWaitTime: 0,
    tWaitTime: 0,
    rWaitPercent: null,
    wWaitPercent: null,
    tWaitPercent: null,
    ms: 0
  };
  if (_disk_io && _disk_io.ms) {
    result.rIO = rIO;
    result.wIO = wIO;
    result.tIO = rIO + wIO;
    result.ms = Date.now() - _disk_io.ms;
    result.rIO_sec = (result.rIO - _disk_io.rIO) / (result.ms / 1e3);
    result.wIO_sec = (result.wIO - _disk_io.wIO) / (result.ms / 1e3);
    result.tIO_sec = result.rIO_sec + result.wIO_sec;
    result.rWaitTime = rWaitTime;
    result.wWaitTime = wWaitTime;
    result.tWaitTime = tWaitTime;
    result.rWaitPercent = (result.rWaitTime - _disk_io.rWaitTime) * 100 / result.ms;
    result.wWaitPercent = (result.wWaitTime - _disk_io.wWaitTime) * 100 / result.ms;
    result.tWaitPercent = (result.tWaitTime - _disk_io.tWaitTime) * 100 / result.ms;
    _disk_io.rIO = rIO;
    _disk_io.wIO = wIO;
    _disk_io.rIO_sec = result.rIO_sec;
    _disk_io.wIO_sec = result.wIO_sec;
    _disk_io.tIO_sec = result.tIO_sec;
    _disk_io.rWaitTime = rWaitTime;
    _disk_io.wWaitTime = wWaitTime;
    _disk_io.tWaitTime = tWaitTime;
    _disk_io.rWaitPercent = result.rWaitPercent;
    _disk_io.wWaitPercent = result.wWaitPercent;
    _disk_io.tWaitPercent = result.tWaitPercent;
    _disk_io.last_ms = result.ms;
    _disk_io.ms = Date.now();
  } else {
    result.rIO = rIO;
    result.wIO = wIO;
    result.tIO = rIO + wIO;
    result.rWaitTime = rWaitTime;
    result.wWaitTime = wWaitTime;
    result.tWaitTime = tWaitTime;
    _disk_io.rIO = rIO;
    _disk_io.wIO = wIO;
    _disk_io.rIO_sec = null;
    _disk_io.wIO_sec = null;
    _disk_io.tIO_sec = null;
    _disk_io.rWaitTime = rWaitTime;
    _disk_io.wWaitTime = wWaitTime;
    _disk_io.tWaitTime = tWaitTime;
    _disk_io.rWaitPercent = null;
    _disk_io.wWaitPercent = null;
    _disk_io.tWaitPercent = null;
    _disk_io.last_ms = 0;
    _disk_io.ms = Date.now();
  }
  return result;
}
function disksIO(callback) {
  return new Promise((resolve) => {
    process.nextTick(() => {
      if (_windows$a) {
        return resolve(null);
      }
      if (_sunos$8) {
        return resolve(null);
      }
      let result = {
        rIO: 0,
        wIO: 0,
        tIO: 0,
        rIO_sec: null,
        wIO_sec: null,
        tIO_sec: null,
        rWaitTime: 0,
        wWaitTime: 0,
        tWaitTime: 0,
        rWaitPercent: null,
        wWaitPercent: null,
        tWaitPercent: null,
        ms: 0
      };
      let rIO = 0;
      let wIO = 0;
      let rWaitTime = 0;
      let wWaitTime = 0;
      let tWaitTime = 0;
      if (_disk_io && !_disk_io.ms || _disk_io && _disk_io.ms && Date.now() - _disk_io.ms >= 500) {
        if (_linux$9 || _freebsd$8 || _openbsd$8 || _netbsd$8) {
          let cmd = 'for mount in `lsblk 2>/dev/null | grep " disk " | sed "s/[│└─├]//g" | awk \'{$1=$1};1\' | cut -d " " -f 1 | sort -u`; do cat /sys/block/$mount/stat | sed -r "s/ +/;/g" | sed -r "s/^;//"; done';
          exec$9(cmd, { maxBuffer: 1024 * 1024 }, function(error, stdout) {
            if (!error) {
              let lines = stdout.split("\n");
              lines.forEach(function(line) {
                if (!line) {
                  return;
                }
                let stats = line.split(";");
                rIO += parseInt(stats[0]);
                wIO += parseInt(stats[4]);
                rWaitTime += parseInt(stats[3]);
                wWaitTime += parseInt(stats[7]);
                tWaitTime += parseInt(stats[10]);
              });
              result = calcDiskIO(rIO, wIO, rWaitTime, wWaitTime, tWaitTime);
              if (callback) {
                callback(result);
              }
              resolve(result);
            } else {
              if (callback) {
                callback(result);
              }
              resolve(result);
            }
          });
        }
        if (_darwin$9) {
          exec$9('ioreg -c IOBlockStorageDriver -k Statistics -r -w0 | sed -n "/IOBlockStorageDriver/,/Statistics/p" | grep "Statistics" | tr -cd "01234567890,\n"', { maxBuffer: 1024 * 1024 }, function(error, stdout) {
            if (!error) {
              let lines = stdout.toString().split("\n");
              lines.forEach(function(line) {
                line = line.trim();
                if (line !== "") {
                  line = line.split(",");
                  rIO += parseInt(line[10]);
                  wIO += parseInt(line[0]);
                }
              });
              result = calcDiskIO(rIO, wIO, rWaitTime, wWaitTime, tWaitTime);
            }
            if (callback) {
              callback(result);
            }
            resolve(result);
          });
        }
      } else {
        result.rIO = _disk_io.rIO;
        result.wIO = _disk_io.wIO;
        result.tIO = _disk_io.rIO + _disk_io.wIO;
        result.ms = _disk_io.last_ms;
        result.rIO_sec = _disk_io.rIO_sec;
        result.wIO_sec = _disk_io.wIO_sec;
        result.tIO_sec = _disk_io.tIO_sec;
        result.rWaitTime = _disk_io.rWaitTime;
        result.wWaitTime = _disk_io.wWaitTime;
        result.tWaitTime = _disk_io.tWaitTime;
        result.rWaitPercent = _disk_io.rWaitPercent;
        result.wWaitPercent = _disk_io.wWaitPercent;
        result.tWaitPercent = _disk_io.tWaitPercent;
        if (callback) {
          callback(result);
        }
        resolve(result);
      }
    });
  });
}
filesystem.disksIO = disksIO;
function diskLayout(callback) {
  function getVendorFromModel2(model) {
    const diskManufacturers = [
      { pattern: "WESTERN.*", manufacturer: "Western Digital" },
      { pattern: "^WDC.*", manufacturer: "Western Digital" },
      { pattern: "WD.*", manufacturer: "Western Digital" },
      { pattern: "TOSHIBA.*", manufacturer: "Toshiba" },
      { pattern: "HITACHI.*", manufacturer: "Hitachi" },
      { pattern: "^IC.*", manufacturer: "Hitachi" },
      { pattern: "^HTS.*", manufacturer: "Hitachi" },
      { pattern: "SANDISK.*", manufacturer: "SanDisk" },
      { pattern: "KINGSTON.*", manufacturer: "Kingston Technology" },
      { pattern: "^SONY.*", manufacturer: "Sony" },
      { pattern: "TRANSCEND.*", manufacturer: "Transcend" },
      { pattern: "SAMSUNG.*", manufacturer: "Samsung" },
      { pattern: "^ST(?!I\\ ).*", manufacturer: "Seagate" },
      { pattern: "^STI\\ .*", manufacturer: "SimpleTech" },
      { pattern: "^D...-.*", manufacturer: "IBM" },
      { pattern: "^IBM.*", manufacturer: "IBM" },
      { pattern: "^FUJITSU.*", manufacturer: "Fujitsu" },
      { pattern: "^MP.*", manufacturer: "Fujitsu" },
      { pattern: "^MK.*", manufacturer: "Toshiba" },
      { pattern: "MAXTO.*", manufacturer: "Maxtor" },
      { pattern: "PIONEER.*", manufacturer: "Pioneer" },
      { pattern: "PHILIPS.*", manufacturer: "Philips" },
      { pattern: "QUANTUM.*", manufacturer: "Quantum Technology" },
      { pattern: "FIREBALL.*", manufacturer: "Quantum Technology" },
      { pattern: "^VBOX.*", manufacturer: "VirtualBox" },
      { pattern: "CORSAIR.*", manufacturer: "Corsair Components" },
      { pattern: "CRUCIAL.*", manufacturer: "Crucial" },
      { pattern: "ECM.*", manufacturer: "ECM" },
      { pattern: "INTEL.*", manufacturer: "INTEL" },
      { pattern: "EVO.*", manufacturer: "Samsung" },
      { pattern: "APPLE.*", manufacturer: "Apple" }
    ];
    let result = "";
    if (model) {
      model = model.toUpperCase();
      diskManufacturers.forEach((manufacturer) => {
        const re = RegExp(manufacturer.pattern);
        if (re.test(model)) {
          result = manufacturer.manufacturer;
        }
      });
    }
    return result;
  }
  return new Promise((resolve) => {
    process.nextTick(() => {
      const commitResult = (res) => {
        for (let i = 0; i < res.length; i++) {
          delete res[i].BSDName;
        }
        if (callback) {
          callback(res);
        }
        resolve(res);
      };
      let result = [];
      let cmd = "";
      if (_linux$9) {
        let cmdFullSmart = "";
        exec$9("export LC_ALL=C; lsblk -ablJO 2>/dev/null; unset LC_ALL", { maxBuffer: 1024 * 1024 }, function(error, stdout) {
          if (!error) {
            try {
              const out = stdout.toString().trim();
              let devices = [];
              try {
                const outJSON = JSON.parse(out);
                if (outJSON && {}.hasOwnProperty.call(outJSON, "blockdevices")) {
                  devices = outJSON.blockdevices.filter((item) => {
                    return item.type === "disk" && item.size > 0 && (item.model !== null || item.mountpoint === null && item.label === null && item.fstype === null && item.parttype === null && item.path && item.path.indexOf("/ram") !== 0 && item.path.indexOf("/loop") !== 0 && item["disc-max"] && item["disc-max"] !== 0);
                  });
                }
              } catch (e) {
                try {
                  const out2 = execSync$5("export LC_ALL=C; lsblk -bPo NAME,TYPE,SIZE,FSTYPE,MOUNTPOINT,UUID,ROTA,RO,RM,LABEL,MODEL,OWNER,GROUP 2>/dev/null; unset LC_ALL").toString();
                  let lines = blkStdoutToObject(out2).split("\n");
                  const data = parseBlk(lines);
                  devices = data.filter((item) => {
                    return item.type === "disk" && item.size > 0 && (item.model !== null && item.model !== "" || item.mount === "" && item.label === "" && item.fsType === "");
                  });
                } catch (e2) {
                  util$b.noop();
                }
              }
              devices.forEach((device) => {
                let mediumType = "";
                const BSDName = "/dev/" + device.name;
                const logical = device.name;
                try {
                  mediumType = execSync$5("cat /sys/block/" + logical + "/queue/rotational 2>/dev/null").toString().split("\n")[0];
                } catch (e) {
                  util$b.noop();
                }
                let interfaceType = device.tran ? device.tran.toUpperCase().trim() : "";
                if (interfaceType === "NVME") {
                  mediumType = "2";
                  interfaceType = "PCIe";
                }
                result.push({
                  device: BSDName,
                  type: mediumType === "0" ? "SSD" : mediumType === "1" ? "HD" : mediumType === "2" ? "NVMe" : device.model && device.model.indexOf("SSD") > -1 ? "SSD" : device.model && device.model.indexOf("NVM") > -1 ? "NVMe" : "HD",
                  name: device.model || "",
                  vendor: getVendorFromModel2(device.model) || (device.vendor ? device.vendor.trim() : ""),
                  size: device.size || 0,
                  bytesPerSector: null,
                  totalCylinders: null,
                  totalHeads: null,
                  totalSectors: null,
                  totalTracks: null,
                  tracksPerCylinder: null,
                  sectorsPerTrack: null,
                  firmwareRevision: device.rev ? device.rev.trim() : "",
                  serialNum: device.serial ? device.serial.trim() : "",
                  interfaceType,
                  smartStatus: "unknown",
                  temperature: null,
                  BSDName
                });
                cmd += `printf "
${BSDName}|"; smartctl -H ${BSDName} | grep overall;`;
                cmdFullSmart += `${cmdFullSmart ? 'printf ",";' : ""}smartctl -a -j ${BSDName};`;
              });
            } catch (e) {
              util$b.noop();
            }
          }
          if (cmdFullSmart) {
            exec$9(cmdFullSmart, { maxBuffer: 1024 * 1024 }, function(error2, stdout2) {
              try {
                const data = JSON.parse(`[${stdout2}]`);
                data.forEach((disk) => {
                  const diskBSDName = disk.smartctl.argv[disk.smartctl.argv.length - 1];
                  for (let i = 0; i < result.length; i++) {
                    if (result[i].BSDName === diskBSDName) {
                      result[i].smartStatus = disk.smart_status.passed ? "Ok" : disk.smart_status.passed === false ? "Predicted Failure" : "unknown";
                      if (disk.temperature && disk.temperature.current) {
                        result[i].temperature = disk.temperature.current;
                      }
                      result[i].smartData = disk;
                    }
                  }
                });
                commitResult(result);
              } catch (e) {
                if (cmd) {
                  cmd = cmd + 'printf "\n"';
                  exec$9(cmd, { maxBuffer: 1024 * 1024 }, function(error3, stdout3) {
                    let lines = stdout3.toString().split("\n");
                    lines.forEach((line) => {
                      if (line) {
                        let parts = line.split("|");
                        if (parts.length === 2) {
                          let BSDName = parts[0];
                          parts[1] = parts[1].trim();
                          let parts2 = parts[1].split(":");
                          if (parts2.length === 2) {
                            parts2[1] = parts2[1].trim();
                            let status = parts2[1].toLowerCase();
                            for (let i = 0; i < result.length; i++) {
                              if (result[i].BSDName === BSDName) {
                                result[i].smartStatus = status === "passed" ? "Ok" : status === "failed!" ? "Predicted Failure" : "unknown";
                              }
                            }
                          }
                        }
                      }
                    });
                    commitResult(result);
                  });
                } else {
                  commitResult(result);
                }
              }
            });
          } else {
            commitResult(result);
          }
        });
      }
      if (_freebsd$8 || _openbsd$8 || _netbsd$8) {
        if (callback) {
          callback(result);
        }
        resolve(result);
      }
      if (_sunos$8) {
        if (callback) {
          callback(result);
        }
        resolve(result);
      }
      if (_darwin$9) {
        exec$9("system_profiler SPSerialATADataType SPNVMeDataType SPUSBDataType", { maxBuffer: 1024 * 1024 }, function(error, stdout) {
          if (!error) {
            let lines = stdout.toString().split("\n");
            let linesSATA = [];
            let linesNVMe = [];
            let linesUSB = [];
            let dataType = "SATA";
            lines.forEach((line) => {
              if (line === "NVMExpress:") {
                dataType = "NVMe";
              } else if (line === "USB:") {
                dataType = "USB";
              } else if (line === "SATA/SATA Express:") {
                dataType = "SATA";
              } else if (dataType === "SATA") {
                linesSATA.push(line);
              } else if (dataType === "NVMe") {
                linesNVMe.push(line);
              } else if (dataType === "USB") {
                linesUSB.push(line);
              }
            });
            try {
              let devices = linesSATA.join("\n").split(" Physical Interconnect: ");
              devices.shift();
              devices.forEach(function(device) {
                device = "InterfaceType: " + device;
                let lines2 = device.split("\n");
                const mediumType = util$b.getValue(lines2, "Medium Type", ":", true).trim();
                const sizeStr = util$b.getValue(lines2, "capacity", ":", true).trim();
                const BSDName = util$b.getValue(lines2, "BSD Name", ":", true).trim();
                if (sizeStr) {
                  let sizeValue = 0;
                  if (sizeStr.indexOf("(") >= 0) {
                    sizeValue = parseInt(sizeStr.match(/\(([^)]+)\)/)[1].replace(/\./g, "").replace(/,/g, "").replace(/\s/g, ""));
                  }
                  if (!sizeValue) {
                    sizeValue = parseInt(sizeStr);
                  }
                  if (sizeValue) {
                    const smartStatusString = util$b.getValue(lines2, "S.M.A.R.T. status", ":", true).trim().toLowerCase();
                    result.push({
                      device: BSDName,
                      type: mediumType.startsWith("Solid") ? "SSD" : "HD",
                      name: util$b.getValue(lines2, "Model", ":", true).trim(),
                      vendor: getVendorFromModel2(util$b.getValue(lines2, "Model", ":", true).trim()) || util$b.getValue(lines2, "Manufacturer", ":", true),
                      size: sizeValue,
                      bytesPerSector: null,
                      totalCylinders: null,
                      totalHeads: null,
                      totalSectors: null,
                      totalTracks: null,
                      tracksPerCylinder: null,
                      sectorsPerTrack: null,
                      firmwareRevision: util$b.getValue(lines2, "Revision", ":", true).trim(),
                      serialNum: util$b.getValue(lines2, "Serial Number", ":", true).trim(),
                      interfaceType: util$b.getValue(lines2, "InterfaceType", ":", true).trim(),
                      smartStatus: smartStatusString === "verified" ? "OK" : smartStatusString || "unknown",
                      temperature: null,
                      BSDName
                    });
                    cmd = cmd + 'printf "\n' + BSDName + '|"; diskutil info /dev/' + BSDName + " | grep SMART;";
                  }
                }
              });
            } catch (e) {
              util$b.noop();
            }
            try {
              let devices = linesNVMe.join("\n").split("\n\n          Capacity:");
              devices.shift();
              devices.forEach(function(device) {
                device = "!Capacity: " + device;
                let lines2 = device.split("\n");
                const linkWidth = util$b.getValue(lines2, "link width", ":", true).trim();
                const sizeStr = util$b.getValue(lines2, "!capacity", ":", true).trim();
                const BSDName = util$b.getValue(lines2, "BSD Name", ":", true).trim();
                if (sizeStr) {
                  let sizeValue = 0;
                  if (sizeStr.indexOf("(") >= 0) {
                    sizeValue = parseInt(sizeStr.match(/\(([^)]+)\)/)[1].replace(/\./g, "").replace(/,/g, "").replace(/\s/g, ""));
                  }
                  if (!sizeValue) {
                    sizeValue = parseInt(sizeStr);
                  }
                  if (sizeValue) {
                    const smartStatusString = util$b.getValue(lines2, "S.M.A.R.T. status", ":", true).trim().toLowerCase();
                    result.push({
                      device: BSDName,
                      type: "NVMe",
                      name: util$b.getValue(lines2, "Model", ":", true).trim(),
                      vendor: getVendorFromModel2(util$b.getValue(lines2, "Model", ":", true).trim()),
                      size: sizeValue,
                      bytesPerSector: null,
                      totalCylinders: null,
                      totalHeads: null,
                      totalSectors: null,
                      totalTracks: null,
                      tracksPerCylinder: null,
                      sectorsPerTrack: null,
                      firmwareRevision: util$b.getValue(lines2, "Revision", ":", true).trim(),
                      serialNum: util$b.getValue(lines2, "Serial Number", ":", true).trim(),
                      interfaceType: ("PCIe " + linkWidth).trim(),
                      smartStatus: smartStatusString === "verified" ? "OK" : smartStatusString || "unknown",
                      temperature: null,
                      BSDName
                    });
                    cmd = cmd + 'printf "\n' + BSDName + '|"; diskutil info /dev/' + BSDName + " | grep SMART;";
                  }
                }
              });
            } catch (e) {
              util$b.noop();
            }
            try {
              let devices = linesUSB.join("\n").replaceAll("Media:\n ", "Model:").split("\n\n          Product ID:");
              devices.shift();
              devices.forEach(function(device) {
                let lines2 = device.split("\n");
                const sizeStr = util$b.getValue(lines2, "Capacity", ":", true).trim();
                const BSDName = util$b.getValue(lines2, "BSD Name", ":", true).trim();
                if (sizeStr) {
                  let sizeValue = 0;
                  if (sizeStr.indexOf("(") >= 0) {
                    sizeValue = parseInt(sizeStr.match(/\(([^)]+)\)/)[1].replace(/\./g, "").replace(/,/g, "").replace(/\s/g, ""));
                  }
                  if (!sizeValue) {
                    sizeValue = parseInt(sizeStr);
                  }
                  if (sizeValue) {
                    const smartStatusString = util$b.getValue(lines2, "S.M.A.R.T. status", ":", true).trim().toLowerCase();
                    result.push({
                      device: BSDName,
                      type: "USB",
                      name: util$b.getValue(lines2, "Model", ":", true).trim().replaceAll(":", ""),
                      vendor: getVendorFromModel2(util$b.getValue(lines2, "Model", ":", true).trim()),
                      size: sizeValue,
                      bytesPerSector: null,
                      totalCylinders: null,
                      totalHeads: null,
                      totalSectors: null,
                      totalTracks: null,
                      tracksPerCylinder: null,
                      sectorsPerTrack: null,
                      firmwareRevision: util$b.getValue(lines2, "Revision", ":", true).trim(),
                      serialNum: util$b.getValue(lines2, "Serial Number", ":", true).trim(),
                      interfaceType: "USB",
                      smartStatus: smartStatusString === "verified" ? "OK" : smartStatusString || "unknown",
                      temperature: null,
                      BSDName
                    });
                    cmd = cmd + 'printf "\n' + BSDName + '|"; diskutil info /dev/' + BSDName + " | grep SMART;";
                  }
                }
              });
            } catch (e) {
              util$b.noop();
            }
            if (cmd) {
              cmd = cmd + 'printf "\n"';
              exec$9(cmd, { maxBuffer: 1024 * 1024 }, function(error2, stdout2) {
                let lines2 = stdout2.toString().split("\n");
                lines2.forEach((line) => {
                  if (line) {
                    let parts = line.split("|");
                    if (parts.length === 2) {
                      let BSDName = parts[0];
                      parts[1] = parts[1].trim();
                      let parts2 = parts[1].split(":");
                      if (parts2.length === 2) {
                        parts2[1] = parts2[1].trim();
                        let status = parts2[1].toLowerCase();
                        for (let i = 0; i < result.length; i++) {
                          if (result[i].BSDName === BSDName) {
                            result[i].smartStatus = status === "not supported" ? "not supported" : status === "verified" ? "Ok" : status === "failing" ? "Predicted Failure" : "unknown";
                          }
                        }
                      }
                    }
                  }
                });
                for (let i = 0; i < result.length; i++) {
                  delete result[i].BSDName;
                }
                if (callback) {
                  callback(result);
                }
                resolve(result);
              });
            } else {
              for (let i = 0; i < result.length; i++) {
                delete result[i].BSDName;
              }
              if (callback) {
                callback(result);
              }
              resolve(result);
            }
          }
        });
      }
      if (_windows$a) {
        try {
          const workload = [];
          workload.push(util$b.powerShell("Get-CimInstance Win32_DiskDrive | select Caption,Size,Status,PNPDeviceId,DeviceId,BytesPerSector,TotalCylinders,TotalHeads,TotalSectors,TotalTracks,TracksPerCylinder,SectorsPerTrack,FirmwareRevision,SerialNumber,InterfaceType | fl"));
          workload.push(util$b.powerShell("Get-PhysicalDisk | select BusType,MediaType,FriendlyName,Model,SerialNumber,Size | fl"));
          if (util$b.smartMonToolsInstalled()) {
            try {
              const smartDev = JSON.parse(execSync$5("smartctl --scan -j").toString());
              if (smartDev && smartDev.devices && smartDev.devices.length > 0) {
                smartDev.devices.forEach((dev) => {
                  workload.push(execPromiseSave(`smartctl -j -a ${dev.name}`, util$b.execOptsWin));
                });
              }
            } catch (e) {
              util$b.noop();
            }
          }
          util$b.promiseAll(
            workload
          ).then((data) => {
            let devices = data.results[0].toString().split(/\n\s*\n/);
            devices.forEach(function(device) {
              let lines = device.split("\r\n");
              const size = util$b.getValue(lines, "Size", ":").trim();
              const status = util$b.getValue(lines, "Status", ":").trim().toLowerCase();
              if (size) {
                result.push({
                  device: util$b.getValue(lines, "DeviceId", ":"),
                  // changed from PNPDeviceId to DeviceID (be be able to match devices)
                  type: device.indexOf("SSD") > -1 ? "SSD" : "HD",
                  // just a starting point ... better: MSFT_PhysicalDisk - Media Type ... see below
                  name: util$b.getValue(lines, "Caption", ":"),
                  vendor: getVendorFromModel2(util$b.getValue(lines, "Caption", ":", true).trim()),
                  size: parseInt(size),
                  bytesPerSector: parseInt(util$b.getValue(lines, "BytesPerSector", ":")),
                  totalCylinders: parseInt(util$b.getValue(lines, "TotalCylinders", ":")),
                  totalHeads: parseInt(util$b.getValue(lines, "TotalHeads", ":")),
                  totalSectors: parseInt(util$b.getValue(lines, "TotalSectors", ":")),
                  totalTracks: parseInt(util$b.getValue(lines, "TotalTracks", ":")),
                  tracksPerCylinder: parseInt(util$b.getValue(lines, "TracksPerCylinder", ":")),
                  sectorsPerTrack: parseInt(util$b.getValue(lines, "SectorsPerTrack", ":")),
                  firmwareRevision: util$b.getValue(lines, "FirmwareRevision", ":").trim(),
                  serialNum: util$b.getValue(lines, "SerialNumber", ":").trim(),
                  interfaceType: util$b.getValue(lines, "InterfaceType", ":").trim(),
                  smartStatus: status === "ok" ? "Ok" : status === "degraded" ? "Degraded" : status === "pred fail" ? "Predicted Failure" : "Unknown",
                  temperature: null
                });
              }
            });
            devices = data.results[1].split(/\n\s*\n/);
            devices.forEach(function(device) {
              let lines = device.split("\r\n");
              const serialNum = util$b.getValue(lines, "SerialNumber", ":").trim();
              const name2 = util$b.getValue(lines, "FriendlyName", ":").trim().replace("Msft ", "Microsoft");
              const size = util$b.getValue(lines, "Size", ":").trim();
              const model = util$b.getValue(lines, "Model", ":").trim();
              const interfaceType = util$b.getValue(lines, "BusType", ":").trim();
              let mediaType = util$b.getValue(lines, "MediaType", ":").trim();
              if (mediaType === "3" || mediaType === "HDD") {
                mediaType = "HD";
              }
              if (mediaType === "4") {
                mediaType = "SSD";
              }
              if (mediaType === "5") {
                mediaType = "SCM";
              }
              if (mediaType === "Unspecified" && (model.toLowerCase().indexOf("virtual") > -1 || model.toLowerCase().indexOf("vbox") > -1)) {
                mediaType = "Virtual";
              }
              if (size) {
                let i = util$b.findObjectByKey(result, "serialNum", serialNum);
                if (i === -1 || serialNum === "") {
                  i = util$b.findObjectByKey(result, "name", name2);
                }
                if (i != -1) {
                  result[i].type = mediaType;
                  result[i].interfaceType = interfaceType;
                }
              }
            });
            data.results.shift();
            data.results.shift();
            if (data.results.length) {
              data.results.forEach((smartStr) => {
                try {
                  const smartData = JSON.parse(smartStr);
                  if (smartData.serial_number) {
                    const serialNum = smartData.serial_number;
                    let i = util$b.findObjectByKey(result, "serialNum", serialNum);
                    if (i != -1) {
                      result[i].smartStatus = smartData.smart_status && smartData.smart_status.passed ? "Ok" : smartData.smart_status && smartData.smart_status.passed === false ? "Predicted Failure" : "unknown";
                      if (smartData.temperature && smartData.temperature.current) {
                        result[i].temperature = smartData.temperature.current;
                      }
                      result[i].smartData = smartData;
                    }
                  }
                } catch (e) {
                  util$b.noop();
                }
              });
            }
            if (callback) {
              callback(result);
            }
            resolve(result);
          });
        } catch (e) {
          if (callback) {
            callback(result);
          }
          resolve(result);
        }
      }
    });
  });
}
filesystem.diskLayout = diskLayout;
var network = {};
const os$3 = require$$0$1;
const exec$8 = require$$1.exec;
const execSync$4 = require$$1.execSync;
const fs$4 = require$$1$1;
const util$a = util$j;
let _platform$9 = process.platform;
const _linux$8 = _platform$9 === "linux" || _platform$9 === "android";
const _darwin$8 = _platform$9 === "darwin";
const _windows$9 = _platform$9 === "win32";
const _freebsd$7 = _platform$9 === "freebsd";
const _openbsd$7 = _platform$9 === "openbsd";
const _netbsd$7 = _platform$9 === "netbsd";
const _sunos$7 = _platform$9 === "sunos";
let _network = {};
let _default_iface = "";
let _ifaces = {};
let _dhcpNics = [];
let _networkInterfaces = [];
let _mac = {};
let pathToIp;
function getDefaultNetworkInterface() {
  let ifacename = "";
  let ifacenameFirst = "";
  try {
    let ifaces = os$3.networkInterfaces();
    let scopeid = 9999;
    for (let dev in ifaces) {
      if ({}.hasOwnProperty.call(ifaces, dev)) {
        ifaces[dev].forEach(function(details) {
          if (details && details.internal === false) {
            ifacenameFirst = ifacenameFirst || dev;
            if (details.scopeid && details.scopeid < scopeid) {
              ifacename = dev;
              scopeid = details.scopeid;
            }
          }
        });
      }
    }
    ifacename = ifacename || ifacenameFirst || "";
    if (_windows$9) {
      let defaultIp = "";
      const cmd = "netstat -r";
      const result = execSync$4(cmd, util$a.execOptsWin);
      const lines = result.toString().split(os$3.EOL);
      lines.forEach((line) => {
        line = line.replace(/\s+/g, " ").trim();
        if (line.indexOf("0.0.0.0 0.0.0.0") > -1 && !/[a-zA-Z]/.test(line)) {
          const parts = line.split(" ");
          if (parts.length >= 5) {
            defaultIp = parts[parts.length - 2];
          }
        }
      });
      if (defaultIp) {
        for (let dev in ifaces) {
          if ({}.hasOwnProperty.call(ifaces, dev)) {
            ifaces[dev].forEach(function(details) {
              if (details && details.address && details.address === defaultIp) {
                ifacename = dev;
              }
            });
          }
        }
      }
    }
    if (_linux$8) {
      let cmd = "ip route 2> /dev/null | grep default";
      let result = execSync$4(cmd);
      let parts = result.toString().split("\n")[0].split(/\s+/);
      if (parts[0] === "none" && parts[5]) {
        ifacename = parts[5];
      } else if (parts[4]) {
        ifacename = parts[4];
      }
      if (ifacename.indexOf(":") > -1) {
        ifacename = ifacename.split(":")[1].trim();
      }
    }
    if (_darwin$8 || _freebsd$7 || _openbsd$7 || _netbsd$7 || _sunos$7) {
      let cmd = "";
      if (_linux$8) {
        cmd = "ip route 2> /dev/null | grep default | awk '{print $5}'";
      }
      if (_darwin$8) {
        cmd = "route -n get default 2>/dev/null | grep interface: | awk '{print $2}'";
      }
      if (_freebsd$7 || _openbsd$7 || _netbsd$7 || _sunos$7) {
        cmd = "route get 0.0.0.0 | grep interface:";
      }
      let result = execSync$4(cmd);
      ifacename = result.toString().split("\n")[0];
      if (ifacename.indexOf(":") > -1) {
        ifacename = ifacename.split(":")[1].trim();
      }
    }
  } catch (e) {
    util$a.noop();
  }
  if (ifacename) {
    _default_iface = ifacename;
  }
  return _default_iface;
}
network.getDefaultNetworkInterface = getDefaultNetworkInterface;
function getMacAddresses() {
  let iface = "";
  let mac = "";
  let result = {};
  if (_linux$8 || _freebsd$7 || _openbsd$7 || _netbsd$7) {
    if (typeof pathToIp === "undefined") {
      try {
        const lines = execSync$4("which ip").toString().split("\n");
        if (lines.length && lines[0].indexOf(":") === -1 && lines[0].indexOf("/") === 0) {
          pathToIp = lines[0];
        } else {
          pathToIp = "";
        }
      } catch (e) {
        pathToIp = "";
      }
    }
    try {
      const cmd = "export LC_ALL=C; " + (pathToIp ? pathToIp + " link show up" : "/sbin/ifconfig") + "; unset LC_ALL";
      let res = execSync$4(cmd);
      const lines = res.toString().split("\n");
      for (let i = 0; i < lines.length; i++) {
        if (lines[i] && lines[i][0] !== " ") {
          if (pathToIp) {
            let nextline = lines[i + 1].trim().split(" ");
            if (nextline[0] === "link/ether") {
              iface = lines[i].split(" ")[1];
              iface = iface.slice(0, iface.length - 1);
              mac = nextline[1];
            }
          } else {
            iface = lines[i].split(" ")[0];
            mac = lines[i].split("HWaddr ")[1];
          }
          if (iface && mac) {
            result[iface] = mac.trim();
            iface = "";
            mac = "";
          }
        }
      }
    } catch (e) {
      util$a.noop();
    }
  }
  if (_darwin$8) {
    try {
      const cmd = "/sbin/ifconfig";
      let res = execSync$4(cmd);
      const lines = res.toString().split("\n");
      for (let i = 0; i < lines.length; i++) {
        if (lines[i] && lines[i][0] !== "	" && lines[i].indexOf(":") > 0) {
          iface = lines[i].split(":")[0];
        } else if (lines[i].indexOf("	ether ") === 0) {
          mac = lines[i].split("	ether ")[1];
          if (iface && mac) {
            result[iface] = mac.trim();
            iface = "";
            mac = "";
          }
        }
      }
    } catch (e) {
      util$a.noop();
    }
  }
  return result;
}
function networkInterfaceDefault(callback) {
  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = getDefaultNetworkInterface();
      if (callback) {
        callback(result);
      }
      resolve(result);
    });
  });
}
network.networkInterfaceDefault = networkInterfaceDefault;
function parseLinesWindowsNics(sections, nconfigsections) {
  let nics = [];
  for (let i in sections) {
    if ({}.hasOwnProperty.call(sections, i)) {
      if (sections[i].trim() !== "") {
        let lines = sections[i].trim().split("\r\n");
        let linesNicConfig = nconfigsections && nconfigsections[i] ? nconfigsections[i].trim().split("\r\n") : [];
        let netEnabled = util$a.getValue(lines, "NetEnabled", ":");
        let adapterType = util$a.getValue(lines, "AdapterTypeID", ":") === "9" ? "wireless" : "wired";
        let ifacename = util$a.getValue(lines, "Name", ":").replace(/\]/g, ")").replace(/\[/g, "(");
        let iface = util$a.getValue(lines, "NetConnectionID", ":").replace(/\]/g, ")").replace(/\[/g, "(");
        if (ifacename.toLowerCase().indexOf("wi-fi") >= 0 || ifacename.toLowerCase().indexOf("wireless") >= 0) {
          adapterType = "wireless";
        }
        if (netEnabled !== "") {
          const speed = parseInt(util$a.getValue(lines, "speed", ":").trim(), 10) / 1e6;
          nics.push({
            mac: util$a.getValue(lines, "MACAddress", ":").toLowerCase(),
            dhcp: util$a.getValue(linesNicConfig, "dhcpEnabled", ":").toLowerCase() === "true",
            name: ifacename,
            iface,
            netEnabled: netEnabled === "TRUE",
            speed: isNaN(speed) ? null : speed,
            operstate: util$a.getValue(lines, "NetConnectionStatus", ":") === "2" ? "up" : "down",
            type: adapterType
          });
        }
      }
    }
  }
  return nics;
}
function getWindowsNics() {
  return new Promise((resolve) => {
    process.nextTick(() => {
      let cmd = "Get-CimInstance Win32_NetworkAdapter | fl *; echo '#-#-#-#';";
      cmd += "Get-CimInstance Win32_NetworkAdapterConfiguration | fl DHCPEnabled";
      try {
        util$a.powerShell(cmd).then((data) => {
          data = data.split("#-#-#-#");
          const nsections = (data[0] || "").split(/\n\s*\n/);
          const nconfigsections = (data[1] || "").split(/\n\s*\n/);
          resolve(parseLinesWindowsNics(nsections, nconfigsections));
        });
      } catch (e) {
        resolve([]);
      }
    });
  });
}
function getWindowsDNSsuffixes() {
  let iface = {};
  let dnsSuffixes = {
    primaryDNS: "",
    exitCode: 0,
    ifaces: []
  };
  try {
    const ipconfig = execSync$4("ipconfig /all", util$a.execOptsWin);
    const ipconfigArray = ipconfig.split("\r\n\r\n");
    ipconfigArray.forEach((element, index) => {
      if (index == 1) {
        const longPrimaryDNS = element.split("\r\n").filter((element2) => {
          return element2.toUpperCase().includes("DNS");
        });
        const primaryDNS = longPrimaryDNS[0].substring(longPrimaryDNS[0].lastIndexOf(":") + 1);
        dnsSuffixes.primaryDNS = primaryDNS.trim();
        if (!dnsSuffixes.primaryDNS) {
          dnsSuffixes.primaryDNS = "Not defined";
        }
      }
      if (index > 1) {
        if (index % 2 == 0) {
          const name2 = element.substring(element.lastIndexOf(" ") + 1).replace(":", "");
          iface.name = name2;
        } else {
          const connectionSpecificDNS = element.split("\r\n").filter((element2) => {
            return element2.toUpperCase().includes("DNS");
          });
          const dnsSuffix = connectionSpecificDNS[0].substring(connectionSpecificDNS[0].lastIndexOf(":") + 1);
          iface.dnsSuffix = dnsSuffix.trim();
          dnsSuffixes.ifaces.push(iface);
          iface = {};
        }
      }
    });
    return dnsSuffixes;
  } catch (error) {
    return {
      primaryDNS: "",
      exitCode: 0,
      ifaces: []
    };
  }
}
function getWindowsIfaceDNSsuffix(ifaces, ifacename) {
  let dnsSuffix = "";
  const interfaceName = ifacename + ".";
  try {
    const connectionDnsSuffix = ifaces.filter((iface) => {
      return interfaceName.includes(iface.name + ".");
    }).map((iface) => iface.dnsSuffix);
    if (connectionDnsSuffix[0]) {
      dnsSuffix = connectionDnsSuffix[0];
    }
    if (!dnsSuffix) {
      dnsSuffix = "";
    }
    return dnsSuffix;
  } catch (error) {
    return "Unknown";
  }
}
function getWindowsWiredProfilesInformation() {
  try {
    const result = execSync$4("netsh lan show profiles", util$a.execOptsWin);
    const profileList = result.split("\r\nProfile on interface");
    return profileList;
  } catch (error) {
    if (error.status === 1 && error.stdout.includes("AutoConfig")) {
      return "Disabled";
    }
    return [];
  }
}
function getWindowsWirelessIfaceSSID(interfaceName) {
  try {
    const result = execSync$4(`netsh wlan show  interface name="${interfaceName}" | findstr "SSID"`, util$a.execOptsWin);
    const SSID = result.split("\r\n").shift();
    const parseSSID = SSID.split(":").pop();
    return parseSSID;
  } catch (error) {
    return "Unknown";
  }
}
function getWindowsIEEE8021x(connectionType, iface, ifaces) {
  let i8021x = {
    state: "Unknown",
    protocol: "Unknown"
  };
  if (ifaces === "Disabled") {
    i8021x.state = "Disabled";
    i8021x.protocol = "Not defined";
    return i8021x;
  }
  if (connectionType == "wired" && ifaces.length > 0) {
    try {
      const iface8021xInfo = ifaces.find((element) => {
        return element.includes(iface + "\r\n");
      });
      const arrayIface8021xInfo = iface8021xInfo.split("\r\n");
      const state8021x = arrayIface8021xInfo.find((element) => {
        return element.includes("802.1x");
      });
      if (state8021x.includes("Disabled")) {
        i8021x.state = "Disabled";
        i8021x.protocol = "Not defined";
      } else if (state8021x.includes("Enabled")) {
        const protocol8021x = arrayIface8021xInfo.find((element) => {
          return element.includes("EAP");
        });
        i8021x.protocol = protocol8021x.split(":").pop();
        i8021x.state = "Enabled";
      }
    } catch (error) {
      return i8021x;
    }
  } else if (connectionType == "wireless") {
    let i8021xState = "";
    let i8021xProtocol = "";
    try {
      const SSID = getWindowsWirelessIfaceSSID(iface);
      if (SSID !== "Unknown") {
        i8021xState = execSync$4(`netsh wlan show profiles "${SSID}" | findstr "802.1X"`, util$a.execOptsWin);
        i8021xProtocol = execSync$4(`netsh wlan show profiles "${SSID}" | findstr "EAP"`, util$a.execOptsWin);
      }
      if (i8021xState.includes(":") && i8021xProtocol.includes(":")) {
        i8021x.state = i8021xState.split(":").pop();
        i8021x.protocol = i8021xProtocol.split(":").pop();
      }
    } catch (error) {
      if (error.status === 1 && error.stdout.includes("AutoConfig")) {
        i8021x.state = "Disabled";
        i8021x.protocol = "Not defined";
      }
      return i8021x;
    }
  }
  return i8021x;
}
function splitSectionsNics(lines) {
  const result = [];
  let section = [];
  lines.forEach(function(line) {
    if (!line.startsWith("	") && !line.startsWith(" ")) {
      if (section.length) {
        result.push(section);
        section = [];
      }
    }
    section.push(line);
  });
  if (section.length) {
    result.push(section);
  }
  return result;
}
function parseLinesDarwinNics(sections) {
  let nics = [];
  sections.forEach((section) => {
    let nic = {
      iface: "",
      mtu: null,
      mac: "",
      ip6: "",
      ip4: "",
      speed: null,
      type: "",
      operstate: "",
      duplex: "",
      internal: false
    };
    const first = section[0];
    nic.iface = first.split(":")[0].trim();
    let parts = first.split("> mtu");
    nic.mtu = parts.length > 1 ? parseInt(parts[1], 10) : null;
    if (isNaN(nic.mtu)) {
      nic.mtu = null;
    }
    nic.internal = parts[0].toLowerCase().indexOf("loopback") > -1;
    section.forEach((line) => {
      if (line.trim().startsWith("ether ")) {
        nic.mac = line.split("ether ")[1].toLowerCase().trim();
      }
      if (line.trim().startsWith("inet6 ") && !nic.ip6) {
        nic.ip6 = line.split("inet6 ")[1].toLowerCase().split("%")[0].split(" ")[0];
      }
      if (line.trim().startsWith("inet ") && !nic.ip4) {
        nic.ip4 = line.split("inet ")[1].toLowerCase().split(" ")[0];
      }
    });
    let speed = util$a.getValue(section, "link rate");
    nic.speed = speed ? parseFloat(speed) : null;
    if (nic.speed === null) {
      speed = util$a.getValue(section, "uplink rate");
      nic.speed = speed ? parseFloat(speed) : null;
      if (nic.speed !== null && speed.toLowerCase().indexOf("gbps") >= 0) {
        nic.speed = nic.speed * 1e3;
      }
    } else {
      if (speed.toLowerCase().indexOf("gbps") >= 0) {
        nic.speed = nic.speed * 1e3;
      }
    }
    nic.type = util$a.getValue(section, "type").toLowerCase().indexOf("wi-fi") > -1 ? "wireless" : "wired";
    const operstate = util$a.getValue(section, "status").toLowerCase();
    nic.operstate = operstate === "active" ? "up" : operstate === "inactive" ? "down" : "unknown";
    nic.duplex = util$a.getValue(section, "media").toLowerCase().indexOf("half-duplex") > -1 ? "half" : "full";
    if (nic.ip6 || nic.ip4 || nic.mac) {
      nics.push(nic);
    }
  });
  return nics;
}
function getDarwinNics() {
  const cmd = "/sbin/ifconfig -v";
  try {
    const lines = execSync$4(cmd, { maxBuffer: 1024 * 2e4 }).toString().split("\n");
    const nsections = splitSectionsNics(lines);
    return parseLinesDarwinNics(nsections);
  } catch (e) {
    return [];
  }
}
function getLinuxIfaceConnectionName(interfaceName) {
  const cmd = `nmcli device status 2>/dev/null | grep ${interfaceName}`;
  try {
    const result = execSync$4(cmd).toString();
    const resultFormat = result.replace(/\s+/g, " ").trim();
    const connectionNameLines = resultFormat.split(" ").slice(3);
    const connectionName = connectionNameLines.join(" ");
    return connectionName != "--" ? connectionName : "";
  } catch (e) {
    return "";
  }
}
function checkLinuxDCHPInterfaces(file) {
  let result = [];
  try {
    let cmd = `cat ${file} 2> /dev/null | grep 'iface\\|source'`;
    const lines = execSync$4(cmd, { maxBuffer: 1024 * 2e4 }).toString().split("\n");
    lines.forEach((line) => {
      const parts = line.replace(/\s+/g, " ").trim().split(" ");
      if (parts.length >= 4) {
        if (line.toLowerCase().indexOf(" inet ") >= 0 && line.toLowerCase().indexOf("dhcp") >= 0) {
          result.push(parts[1]);
        }
      }
      if (line.toLowerCase().includes("source")) {
        let file2 = line.split(" ")[1];
        result = result.concat(checkLinuxDCHPInterfaces(file2));
      }
    });
  } catch (e) {
    util$a.noop();
  }
  return result;
}
function getLinuxDHCPNics() {
  let cmd = "ip a 2> /dev/null";
  let result = [];
  try {
    const lines = execSync$4(cmd, { maxBuffer: 1024 * 2e4 }).toString().split("\n");
    const nsections = splitSectionsNics(lines);
    result = parseLinuxDHCPNics(nsections);
  } catch (e) {
    util$a.noop();
  }
  try {
    result = checkLinuxDCHPInterfaces("/etc/network/interfaces");
  } catch (e) {
    util$a.noop();
  }
  return result;
}
function parseLinuxDHCPNics(sections) {
  const result = [];
  if (sections && sections.length) {
    sections.forEach((lines) => {
      if (lines && lines.length) {
        const parts = lines[0].split(":");
        if (parts.length > 2) {
          for (let line of lines) {
            if (line.indexOf(" inet ") >= 0 && line.indexOf(" dynamic ") >= 0) {
              const parts2 = line.split(" ");
              const nic = parts2[parts2.length - 1].trim();
              result.push(nic);
              break;
            }
          }
        }
      }
    });
  }
  return result;
}
function getLinuxIfaceDHCPstatus(iface, connectionName, DHCPNics) {
  let result = false;
  if (connectionName) {
    const cmd = `nmcli connection show "${connectionName}" 2>/dev/null | grep ipv4.method;`;
    try {
      const lines = execSync$4(cmd).toString();
      const resultFormat = lines.replace(/\s+/g, " ").trim();
      let dhcStatus = resultFormat.split(" ").slice(1).toString();
      switch (dhcStatus) {
        case "auto":
          result = true;
          break;
        default:
          result = false;
          break;
      }
      return result;
    } catch (e) {
      return DHCPNics.indexOf(iface) >= 0;
    }
  } else {
    return DHCPNics.indexOf(iface) >= 0;
  }
}
function getDarwinIfaceDHCPstatus(iface) {
  let result = false;
  const cmd = `ipconfig getpacket "${iface}" 2>/dev/null | grep lease_time;`;
  try {
    const lines = execSync$4(cmd).toString().split("\n");
    if (lines.length && lines[0].startsWith("lease_time")) {
      result = true;
    }
  } catch (e) {
    util$a.noop();
  }
  return result;
}
function getLinuxIfaceDNSsuffix(connectionName) {
  if (connectionName) {
    const cmd = `nmcli connection show "${connectionName}" 2>/dev/null | grep ipv4.dns-search;`;
    try {
      const result = execSync$4(cmd).toString();
      const resultFormat = result.replace(/\s+/g, " ").trim();
      const dnsSuffix = resultFormat.split(" ").slice(1).toString();
      return dnsSuffix == "--" ? "Not defined" : dnsSuffix;
    } catch (e) {
      return "Unknown";
    }
  } else {
    return "Unknown";
  }
}
function getLinuxIfaceIEEE8021xAuth(connectionName) {
  if (connectionName) {
    const cmd = `nmcli connection show "${connectionName}" 2>/dev/null | grep 802-1x.eap;`;
    try {
      const result = execSync$4(cmd).toString();
      const resultFormat = result.replace(/\s+/g, " ").trim();
      const authenticationProtocol = resultFormat.split(" ").slice(1).toString();
      return authenticationProtocol == "--" ? "" : authenticationProtocol;
    } catch (e) {
      return "Not defined";
    }
  } else {
    return "Not defined";
  }
}
function getLinuxIfaceIEEE8021xState(authenticationProtocol) {
  if (authenticationProtocol) {
    if (authenticationProtocol == "Not defined") {
      return "Disabled";
    }
    return "Enabled";
  } else {
    return "Unknown";
  }
}
function testVirtualNic(iface, ifaceName, mac) {
  const virtualMacs = ["00:00:00:00:00:00", "00:03:FF", "00:05:69", "00:0C:29", "00:0F:4B", "00:13:07", "00:13:BE", "00:15:5d", "00:16:3E", "00:1C:42", "00:21:F6", "00:24:0B", "00:50:56", "00:A0:B1", "00:E0:C8", "08:00:27", "0A:00:27", "18:92:2C", "16:DF:49", "3C:F3:92", "54:52:00", "FC:15:97"];
  if (mac) {
    return virtualMacs.filter((item) => {
      return mac.toUpperCase().toUpperCase().startsWith(item.substring(0, mac.length));
    }).length > 0 || iface.toLowerCase().indexOf(" virtual ") > -1 || ifaceName.toLowerCase().indexOf(" virtual ") > -1 || iface.toLowerCase().indexOf("vethernet ") > -1 || ifaceName.toLowerCase().indexOf("vethernet ") > -1 || iface.toLowerCase().startsWith("veth") || ifaceName.toLowerCase().startsWith("veth") || iface.toLowerCase().startsWith("vboxnet") || ifaceName.toLowerCase().startsWith("vboxnet");
  } else {
    return false;
  }
}
function networkInterfaces(callback, rescan, defaultString) {
  if (typeof callback === "string") {
    defaultString = callback;
    rescan = true;
    callback = null;
  }
  if (typeof callback === "boolean") {
    rescan = callback;
    callback = null;
    defaultString = "";
  }
  if (typeof rescan === "undefined") {
    rescan = true;
  }
  defaultString = defaultString || "";
  defaultString = "" + defaultString;
  return new Promise((resolve) => {
    process.nextTick(() => {
      let ifaces = os$3.networkInterfaces();
      let result = [];
      let nics = [];
      let dnsSuffixes = [];
      let nics8021xInfo = [];
      if (_darwin$8 || _freebsd$7 || _openbsd$7 || _netbsd$7) {
        if (JSON.stringify(ifaces) === JSON.stringify(_ifaces) && !rescan) {
          result = _networkInterfaces;
          if (callback) {
            callback(result);
          }
          resolve(result);
        } else {
          const defaultInterface = getDefaultNetworkInterface();
          _ifaces = JSON.parse(JSON.stringify(ifaces));
          nics = getDarwinNics();
          nics.forEach((nic) => {
            if ({}.hasOwnProperty.call(ifaces, nic.iface)) {
              ifaces[nic.iface].forEach(function(details) {
                if (details.family === "IPv4" || details.family === 4) {
                  nic.ip4subnet = details.netmask;
                }
                if (details.family === "IPv6" || details.family === 6) {
                  nic.ip6subnet = details.netmask;
                }
              });
            }
            let ifaceSanitized = "";
            const s = util$a.isPrototypePolluted() ? "---" : util$a.sanitizeShellString(nic.iface);
            const l = util$a.mathMin(s.length, 2e3);
            for (let i = 0; i <= l; i++) {
              if (s[i] !== void 0) {
                ifaceSanitized = ifaceSanitized + s[i];
              }
            }
            result.push({
              iface: nic.iface,
              ifaceName: nic.iface,
              default: nic.iface === defaultInterface,
              ip4: nic.ip4,
              ip4subnet: nic.ip4subnet || "",
              ip6: nic.ip6,
              ip6subnet: nic.ip6subnet || "",
              mac: nic.mac,
              internal: nic.internal,
              virtual: nic.internal ? false : testVirtualNic(nic.iface, nic.iface, nic.mac),
              operstate: nic.operstate,
              type: nic.type,
              duplex: nic.duplex,
              mtu: nic.mtu,
              speed: nic.speed,
              dhcp: getDarwinIfaceDHCPstatus(ifaceSanitized),
              dnsSuffix: "",
              ieee8021xAuth: "",
              ieee8021xState: "",
              carrierChanges: 0
            });
          });
          _networkInterfaces = result;
          if (defaultString.toLowerCase().indexOf("default") >= 0) {
            result = result.filter((item) => item.default);
            if (result.length > 0) {
              result = result[0];
            } else {
              result = [];
            }
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        }
      }
      if (_linux$8) {
        if (JSON.stringify(ifaces) === JSON.stringify(_ifaces) && !rescan) {
          result = _networkInterfaces;
          if (callback) {
            callback(result);
          }
          resolve(result);
        } else {
          _ifaces = JSON.parse(JSON.stringify(ifaces));
          _dhcpNics = getLinuxDHCPNics();
          const defaultInterface = getDefaultNetworkInterface();
          for (let dev in ifaces) {
            let ip4 = "";
            let ip4subnet = "";
            let ip6 = "";
            let ip6subnet = "";
            let mac = "";
            let duplex = "";
            let mtu = "";
            let speed = null;
            let carrierChanges = 0;
            let dhcp = false;
            let dnsSuffix = "";
            let ieee8021xAuth = "";
            let ieee8021xState = "";
            let type = "";
            if ({}.hasOwnProperty.call(ifaces, dev)) {
              let ifaceName = dev;
              ifaces[dev].forEach(function(details) {
                if (details.family === "IPv4" || details.family === 4) {
                  ip4 = details.address;
                  ip4subnet = details.netmask;
                }
                if (details.family === "IPv6" || details.family === 6) {
                  if (!ip6 || ip6.match(/^fe80::/i)) {
                    ip6 = details.address;
                    ip6subnet = details.netmask;
                  }
                }
                mac = details.mac;
                const nodeMainVersion = parseInt(process.versions.node.split("."), 10);
                if (mac.indexOf("00:00:0") > -1 && (_linux$8 || _darwin$8) && !details.internal && nodeMainVersion >= 8 && nodeMainVersion <= 11) {
                  if (Object.keys(_mac).length === 0) {
                    _mac = getMacAddresses();
                  }
                  mac = _mac[dev] || "";
                }
              });
              let iface = dev.split(":")[0].trim().toLowerCase();
              let ifaceSanitized = "";
              const s = util$a.isPrototypePolluted() ? "---" : util$a.sanitizeShellString(iface);
              const l = util$a.mathMin(s.length, 2e3);
              for (let i = 0; i <= l; i++) {
                if (s[i] !== void 0) {
                  ifaceSanitized = ifaceSanitized + s[i];
                }
              }
              const cmd = `echo -n "addr_assign_type: "; cat /sys/class/net/${ifaceSanitized}/addr_assign_type 2>/dev/null; echo;
            echo -n "address: "; cat /sys/class/net/${ifaceSanitized}/address 2>/dev/null; echo;
            echo -n "addr_len: "; cat /sys/class/net/${ifaceSanitized}/addr_len 2>/dev/null; echo;
            echo -n "broadcast: "; cat /sys/class/net/${ifaceSanitized}/broadcast 2>/dev/null; echo;
            echo -n "carrier: "; cat /sys/class/net/${ifaceSanitized}/carrier 2>/dev/null; echo;
            echo -n "carrier_changes: "; cat /sys/class/net/${ifaceSanitized}/carrier_changes 2>/dev/null; echo;
            echo -n "dev_id: "; cat /sys/class/net/${ifaceSanitized}/dev_id 2>/dev/null; echo;
            echo -n "dev_port: "; cat /sys/class/net/${ifaceSanitized}/dev_port 2>/dev/null; echo;
            echo -n "dormant: "; cat /sys/class/net/${ifaceSanitized}/dormant 2>/dev/null; echo;
            echo -n "duplex: "; cat /sys/class/net/${ifaceSanitized}/duplex 2>/dev/null; echo;
            echo -n "flags: "; cat /sys/class/net/${ifaceSanitized}/flags 2>/dev/null; echo;
            echo -n "gro_flush_timeout: "; cat /sys/class/net/${ifaceSanitized}/gro_flush_timeout 2>/dev/null; echo;
            echo -n "ifalias: "; cat /sys/class/net/${ifaceSanitized}/ifalias 2>/dev/null; echo;
            echo -n "ifindex: "; cat /sys/class/net/${ifaceSanitized}/ifindex 2>/dev/null; echo;
            echo -n "iflink: "; cat /sys/class/net/${ifaceSanitized}/iflink 2>/dev/null; echo;
            echo -n "link_mode: "; cat /sys/class/net/${ifaceSanitized}/link_mode 2>/dev/null; echo;
            echo -n "mtu: "; cat /sys/class/net/${ifaceSanitized}/mtu 2>/dev/null; echo;
            echo -n "netdev_group: "; cat /sys/class/net/${ifaceSanitized}/netdev_group 2>/dev/null; echo;
            echo -n "operstate: "; cat /sys/class/net/${ifaceSanitized}/operstate 2>/dev/null; echo;
            echo -n "proto_down: "; cat /sys/class/net/${ifaceSanitized}/proto_down 2>/dev/null; echo;
            echo -n "speed: "; cat /sys/class/net/${ifaceSanitized}/speed 2>/dev/null; echo;
            echo -n "tx_queue_len: "; cat /sys/class/net/${ifaceSanitized}/tx_queue_len 2>/dev/null; echo;
            echo -n "type: "; cat /sys/class/net/${ifaceSanitized}/type 2>/dev/null; echo;
            echo -n "wireless: "; cat /proc/net/wireless 2>/dev/null | grep ${ifaceSanitized}; echo;
            echo -n "wirelessspeed: "; iw dev ${ifaceSanitized} link 2>&1 | grep bitrate; echo;`;
              let lines = [];
              try {
                lines = execSync$4(cmd).toString().split("\n");
                const connectionName = getLinuxIfaceConnectionName(ifaceSanitized);
                dhcp = getLinuxIfaceDHCPstatus(ifaceSanitized, connectionName, _dhcpNics);
                dnsSuffix = getLinuxIfaceDNSsuffix(connectionName);
                ieee8021xAuth = getLinuxIfaceIEEE8021xAuth(connectionName);
                ieee8021xState = getLinuxIfaceIEEE8021xState(ieee8021xAuth);
              } catch (e) {
                util$a.noop();
              }
              duplex = util$a.getValue(lines, "duplex");
              duplex = duplex.startsWith("cat") ? "" : duplex;
              mtu = parseInt(util$a.getValue(lines, "mtu"), 10);
              let myspeed = parseInt(util$a.getValue(lines, "speed"), 10);
              speed = isNaN(myspeed) ? null : myspeed;
              let wirelessspeed = util$a.getValue(lines, "wirelessspeed").split("tx bitrate: ");
              if (speed === null && wirelessspeed.length === 2) {
                myspeed = parseFloat(wirelessspeed[1]);
                speed = isNaN(myspeed) ? null : myspeed;
              }
              carrierChanges = parseInt(util$a.getValue(lines, "carrier_changes"), 10);
              const operstate = util$a.getValue(lines, "operstate");
              type = operstate === "up" ? util$a.getValue(lines, "wireless").trim() ? "wireless" : "wired" : "unknown";
              if (ifaceSanitized === "lo" || ifaceSanitized.startsWith("bond")) {
                type = "virtual";
              }
              let internal = ifaces[dev] && ifaces[dev][0] ? ifaces[dev][0].internal : false;
              if (dev.toLowerCase().indexOf("loopback") > -1 || ifaceName.toLowerCase().indexOf("loopback") > -1) {
                internal = true;
              }
              const virtual = internal ? false : testVirtualNic(dev, ifaceName, mac);
              result.push({
                iface: ifaceSanitized,
                ifaceName,
                default: iface === defaultInterface,
                ip4,
                ip4subnet,
                ip6,
                ip6subnet,
                mac,
                internal,
                virtual,
                operstate,
                type,
                duplex,
                mtu,
                speed,
                dhcp,
                dnsSuffix,
                ieee8021xAuth,
                ieee8021xState,
                carrierChanges
              });
            }
          }
          _networkInterfaces = result;
          if (defaultString.toLowerCase().indexOf("default") >= 0) {
            result = result.filter((item) => item.default);
            if (result.length > 0) {
              result = result[0];
            } else {
              result = [];
            }
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        }
      }
      if (_windows$9) {
        if (JSON.stringify(ifaces) === JSON.stringify(_ifaces) && !rescan) {
          result = _networkInterfaces;
          if (callback) {
            callback(result);
          }
          resolve(result);
        } else {
          _ifaces = JSON.parse(JSON.stringify(ifaces));
          const defaultInterface = getDefaultNetworkInterface();
          getWindowsNics().then(function(nics2) {
            nics2.forEach((nic) => {
              let found = false;
              Object.keys(ifaces).forEach((key) => {
                if (!found) {
                  ifaces[key].forEach((value) => {
                    if (Object.keys(value).indexOf("mac") >= 0) {
                      found = value["mac"] === nic.mac;
                    }
                  });
                }
              });
              if (!found) {
                ifaces[nic.name] = [{ mac: nic.mac }];
              }
            });
            nics8021xInfo = getWindowsWiredProfilesInformation();
            dnsSuffixes = getWindowsDNSsuffixes();
            for (let dev in ifaces) {
              let ifaceSanitized = "";
              const s = util$a.isPrototypePolluted() ? "---" : util$a.sanitizeShellString(dev);
              const l = util$a.mathMin(s.length, 2e3);
              for (let i = 0; i <= l; i++) {
                if (s[i] !== void 0) {
                  ifaceSanitized = ifaceSanitized + s[i];
                }
              }
              let iface = dev;
              let ip4 = "";
              let ip4subnet = "";
              let ip6 = "";
              let ip6subnet = "";
              let mac = "";
              let duplex = "";
              let mtu = "";
              let speed = null;
              let carrierChanges = 0;
              let operstate = "down";
              let dhcp = false;
              let dnsSuffix = "";
              let ieee8021xAuth = "";
              let ieee8021xState = "";
              let type = "";
              if ({}.hasOwnProperty.call(ifaces, dev)) {
                let ifaceName = dev;
                ifaces[dev].forEach(function(details) {
                  if (details.family === "IPv4" || details.family === 4) {
                    ip4 = details.address;
                    ip4subnet = details.netmask;
                  }
                  if (details.family === "IPv6" || details.family === 6) {
                    if (!ip6 || ip6.match(/^fe80::/i)) {
                      ip6 = details.address;
                      ip6subnet = details.netmask;
                    }
                  }
                  mac = details.mac;
                  const nodeMainVersion = parseInt(process.versions.node.split("."), 10);
                  if (mac.indexOf("00:00:0") > -1 && (_linux$8 || _darwin$8) && !details.internal && nodeMainVersion >= 8 && nodeMainVersion <= 11) {
                    if (Object.keys(_mac).length === 0) {
                      _mac = getMacAddresses();
                    }
                    mac = _mac[dev] || "";
                  }
                });
                dnsSuffix = getWindowsIfaceDNSsuffix(dnsSuffixes.ifaces, ifaceSanitized);
                let foundFirst = false;
                nics2.forEach((detail) => {
                  if (detail.mac === mac && !foundFirst) {
                    iface = detail.iface || iface;
                    ifaceName = detail.name;
                    dhcp = detail.dhcp;
                    operstate = detail.operstate;
                    speed = operstate === "up" ? detail.speed : 0;
                    type = detail.type;
                    foundFirst = true;
                  }
                });
                if (dev.toLowerCase().indexOf("wlan") >= 0 || ifaceName.toLowerCase().indexOf("wlan") >= 0 || ifaceName.toLowerCase().indexOf("802.11n") >= 0 || ifaceName.toLowerCase().indexOf("wireless") >= 0 || ifaceName.toLowerCase().indexOf("wi-fi") >= 0 || ifaceName.toLowerCase().indexOf("wifi") >= 0) {
                  type = "wireless";
                }
                const IEEE8021x = getWindowsIEEE8021x(type, ifaceSanitized, nics8021xInfo);
                ieee8021xAuth = IEEE8021x.protocol;
                ieee8021xState = IEEE8021x.state;
                let internal = ifaces[dev] && ifaces[dev][0] ? ifaces[dev][0].internal : false;
                if (dev.toLowerCase().indexOf("loopback") > -1 || ifaceName.toLowerCase().indexOf("loopback") > -1) {
                  internal = true;
                }
                const virtual = internal ? false : testVirtualNic(dev, ifaceName, mac);
                result.push({
                  iface,
                  ifaceName,
                  default: iface === defaultInterface,
                  ip4,
                  ip4subnet,
                  ip6,
                  ip6subnet,
                  mac,
                  internal,
                  virtual,
                  operstate,
                  type,
                  duplex,
                  mtu,
                  speed,
                  dhcp,
                  dnsSuffix,
                  ieee8021xAuth,
                  ieee8021xState,
                  carrierChanges
                });
              }
            }
            _networkInterfaces = result;
            if (defaultString.toLowerCase().indexOf("default") >= 0) {
              result = result.filter((item) => item.default);
              if (result.length > 0) {
                result = result[0];
              } else {
                result = [];
              }
            }
            if (callback) {
              callback(result);
            }
            resolve(result);
          });
        }
      }
    });
  });
}
network.networkInterfaces = networkInterfaces;
function calcNetworkSpeed(iface, rx_bytes, tx_bytes, operstate, rx_dropped, rx_errors, tx_dropped, tx_errors) {
  let result = {
    iface,
    operstate,
    rx_bytes,
    rx_dropped,
    rx_errors,
    tx_bytes,
    tx_dropped,
    tx_errors,
    rx_sec: null,
    tx_sec: null,
    ms: 0
  };
  if (_network[iface] && _network[iface].ms) {
    result.ms = Date.now() - _network[iface].ms;
    result.rx_sec = rx_bytes - _network[iface].rx_bytes >= 0 ? (rx_bytes - _network[iface].rx_bytes) / (result.ms / 1e3) : 0;
    result.tx_sec = tx_bytes - _network[iface].tx_bytes >= 0 ? (tx_bytes - _network[iface].tx_bytes) / (result.ms / 1e3) : 0;
    _network[iface].rx_bytes = rx_bytes;
    _network[iface].tx_bytes = tx_bytes;
    _network[iface].rx_sec = result.rx_sec;
    _network[iface].tx_sec = result.tx_sec;
    _network[iface].ms = Date.now();
    _network[iface].last_ms = result.ms;
    _network[iface].operstate = operstate;
  } else {
    if (!_network[iface]) {
      _network[iface] = {};
    }
    _network[iface].rx_bytes = rx_bytes;
    _network[iface].tx_bytes = tx_bytes;
    _network[iface].rx_sec = null;
    _network[iface].tx_sec = null;
    _network[iface].ms = Date.now();
    _network[iface].last_ms = 0;
    _network[iface].operstate = operstate;
  }
  return result;
}
function networkStats(ifaces, callback) {
  let ifacesArray = [];
  return new Promise((resolve) => {
    process.nextTick(() => {
      if (util$a.isFunction(ifaces) && !callback) {
        callback = ifaces;
        ifacesArray = [getDefaultNetworkInterface()];
      } else {
        if (typeof ifaces !== "string" && ifaces !== void 0) {
          if (callback) {
            callback([]);
          }
          return resolve([]);
        }
        ifaces = ifaces || getDefaultNetworkInterface();
        ifaces.__proto__.toLowerCase = util$a.stringToLower;
        ifaces.__proto__.replace = util$a.stringReplace;
        ifaces.__proto__.trim = util$a.stringTrim;
        ifaces = ifaces.trim().toLowerCase().replace(/,+/g, "|");
        ifacesArray = ifaces.split("|");
      }
      const result = [];
      const workload = [];
      if (ifacesArray.length && ifacesArray[0].trim() === "*") {
        ifacesArray = [];
        networkInterfaces(false).then((allIFaces) => {
          for (let iface of allIFaces) {
            ifacesArray.push(iface.iface);
          }
          networkStats(ifacesArray.join(",")).then((result2) => {
            if (callback) {
              callback(result2);
            }
            resolve(result2);
          });
        });
      } else {
        for (let iface of ifacesArray) {
          workload.push(networkStatsSingle(iface.trim()));
        }
        if (workload.length) {
          Promise.all(
            workload
          ).then((data) => {
            if (callback) {
              callback(data);
            }
            resolve(data);
          });
        } else {
          if (callback) {
            callback(result);
          }
          resolve(result);
        }
      }
    });
  });
}
function networkStatsSingle(iface) {
  function parseLinesWindowsPerfData(sections) {
    let perfData = [];
    for (let i in sections) {
      if ({}.hasOwnProperty.call(sections, i)) {
        if (sections[i].trim() !== "") {
          let lines = sections[i].trim().split("\r\n");
          perfData.push({
            name: util$a.getValue(lines, "Name", ":").replace(/[()[\] ]+/g, "").replace(/#|\//g, "_").toLowerCase(),
            rx_bytes: parseInt(util$a.getValue(lines, "BytesReceivedPersec", ":"), 10),
            rx_errors: parseInt(util$a.getValue(lines, "PacketsReceivedErrors", ":"), 10),
            rx_dropped: parseInt(util$a.getValue(lines, "PacketsReceivedDiscarded", ":"), 10),
            tx_bytes: parseInt(util$a.getValue(lines, "BytesSentPersec", ":"), 10),
            tx_errors: parseInt(util$a.getValue(lines, "PacketsOutboundErrors", ":"), 10),
            tx_dropped: parseInt(util$a.getValue(lines, "PacketsOutboundDiscarded", ":"), 10)
          });
        }
      }
    }
    return perfData;
  }
  return new Promise((resolve) => {
    process.nextTick(() => {
      let ifaceSanitized = "";
      const s = util$a.isPrototypePolluted() ? "---" : util$a.sanitizeShellString(iface);
      const l = util$a.mathMin(s.length, 2e3);
      for (let i = 0; i <= l; i++) {
        if (s[i] !== void 0) {
          ifaceSanitized = ifaceSanitized + s[i];
        }
      }
      let result = {
        iface: ifaceSanitized,
        operstate: "unknown",
        rx_bytes: 0,
        rx_dropped: 0,
        rx_errors: 0,
        tx_bytes: 0,
        tx_dropped: 0,
        tx_errors: 0,
        rx_sec: null,
        tx_sec: null,
        ms: 0
      };
      let operstate = "unknown";
      let rx_bytes = 0;
      let tx_bytes = 0;
      let rx_dropped = 0;
      let rx_errors = 0;
      let tx_dropped = 0;
      let tx_errors = 0;
      let cmd, lines, stats;
      if (!_network[ifaceSanitized] || _network[ifaceSanitized] && !_network[ifaceSanitized].ms || _network[ifaceSanitized] && _network[ifaceSanitized].ms && Date.now() - _network[ifaceSanitized].ms >= 500) {
        if (_linux$8) {
          if (fs$4.existsSync("/sys/class/net/" + ifaceSanitized)) {
            cmd = "cat /sys/class/net/" + ifaceSanitized + "/operstate; cat /sys/class/net/" + ifaceSanitized + "/statistics/rx_bytes; cat /sys/class/net/" + ifaceSanitized + "/statistics/tx_bytes; cat /sys/class/net/" + ifaceSanitized + "/statistics/rx_dropped; cat /sys/class/net/" + ifaceSanitized + "/statistics/rx_errors; cat /sys/class/net/" + ifaceSanitized + "/statistics/tx_dropped; cat /sys/class/net/" + ifaceSanitized + "/statistics/tx_errors; ";
            exec$8(cmd, function(error, stdout) {
              if (!error) {
                lines = stdout.toString().split("\n");
                operstate = lines[0].trim();
                rx_bytes = parseInt(lines[1], 10);
                tx_bytes = parseInt(lines[2], 10);
                rx_dropped = parseInt(lines[3], 10);
                rx_errors = parseInt(lines[4], 10);
                tx_dropped = parseInt(lines[5], 10);
                tx_errors = parseInt(lines[6], 10);
                result = calcNetworkSpeed(ifaceSanitized, rx_bytes, tx_bytes, operstate, rx_dropped, rx_errors, tx_dropped, tx_errors);
              }
              resolve(result);
            });
          } else {
            resolve(result);
          }
        }
        if (_freebsd$7 || _openbsd$7 || _netbsd$7) {
          cmd = "netstat -ibndI " + ifaceSanitized;
          exec$8(cmd, function(error, stdout) {
            if (!error) {
              lines = stdout.toString().split("\n");
              for (let i = 1; i < lines.length; i++) {
                const line = lines[i].replace(/ +/g, " ").split(" ");
                if (line && line[0] && line[7] && line[10]) {
                  rx_bytes = rx_bytes + parseInt(line[7]);
                  if (line[6].trim() !== "-") {
                    rx_dropped = rx_dropped + parseInt(line[6]);
                  }
                  if (line[5].trim() !== "-") {
                    rx_errors = rx_errors + parseInt(line[5]);
                  }
                  tx_bytes = tx_bytes + parseInt(line[10]);
                  if (line[12].trim() !== "-") {
                    tx_dropped = tx_dropped + parseInt(line[12]);
                  }
                  if (line[9].trim() !== "-") {
                    tx_errors = tx_errors + parseInt(line[9]);
                  }
                  operstate = "up";
                }
              }
              result = calcNetworkSpeed(ifaceSanitized, rx_bytes, tx_bytes, operstate, rx_dropped, rx_errors, tx_dropped, tx_errors);
            }
            resolve(result);
          });
        }
        if (_darwin$8) {
          cmd = "ifconfig " + ifaceSanitized + ' | grep "status"';
          exec$8(cmd, function(error, stdout) {
            result.operstate = (stdout.toString().split(":")[1] || "").trim();
            result.operstate = (result.operstate || "").toLowerCase();
            result.operstate = result.operstate === "active" ? "up" : result.operstate === "inactive" ? "down" : "unknown";
            cmd = "netstat -bdI " + ifaceSanitized;
            exec$8(cmd, function(error2, stdout2) {
              if (!error2) {
                lines = stdout2.toString().split("\n");
                if (lines.length > 1 && lines[1].trim() !== "") {
                  stats = lines[1].replace(/ +/g, " ").split(" ");
                  const offset = stats.length > 11 ? 1 : 0;
                  rx_bytes = parseInt(stats[offset + 5]);
                  rx_dropped = parseInt(stats[offset + 10]);
                  rx_errors = parseInt(stats[offset + 4]);
                  tx_bytes = parseInt(stats[offset + 8]);
                  tx_dropped = parseInt(stats[offset + 10]);
                  tx_errors = parseInt(stats[offset + 7]);
                  result = calcNetworkSpeed(ifaceSanitized, rx_bytes, tx_bytes, result.operstate, rx_dropped, rx_errors, tx_dropped, tx_errors);
                }
              }
              resolve(result);
            });
          });
        }
        if (_windows$9) {
          let perfData = [];
          let ifaceName = ifaceSanitized;
          util$a.powerShell("Get-CimInstance Win32_PerfRawData_Tcpip_NetworkInterface | select Name,BytesReceivedPersec,PacketsReceivedErrors,PacketsReceivedDiscarded,BytesSentPersec,PacketsOutboundErrors,PacketsOutboundDiscarded | fl").then((stdout, error) => {
            if (!error) {
              const psections = stdout.toString().split(/\n\s*\n/);
              perfData = parseLinesWindowsPerfData(psections);
            }
            networkInterfaces(false).then((interfaces) => {
              rx_bytes = 0;
              tx_bytes = 0;
              perfData.forEach((detail) => {
                interfaces.forEach((det) => {
                  if ((det.iface.toLowerCase() === ifaceSanitized.toLowerCase() || det.mac.toLowerCase() === ifaceSanitized.toLowerCase() || det.ip4.toLowerCase() === ifaceSanitized.toLowerCase() || det.ip6.toLowerCase() === ifaceSanitized.toLowerCase() || det.ifaceName.replace(/[()[\] ]+/g, "").replace(/#|\//g, "_").toLowerCase() === ifaceSanitized.replace(/[()[\] ]+/g, "").replace("#", "_").toLowerCase()) && det.ifaceName.replace(/[()[\] ]+/g, "").replace(/#|\//g, "_").toLowerCase() === detail.name) {
                    ifaceName = det.iface;
                    rx_bytes = detail.rx_bytes;
                    rx_dropped = detail.rx_dropped;
                    rx_errors = detail.rx_errors;
                    tx_bytes = detail.tx_bytes;
                    tx_dropped = detail.tx_dropped;
                    tx_errors = detail.tx_errors;
                    operstate = det.operstate;
                  }
                });
              });
              if (rx_bytes && tx_bytes) {
                result = calcNetworkSpeed(ifaceName, parseInt(rx_bytes), parseInt(tx_bytes), operstate, rx_dropped, rx_errors, tx_dropped, tx_errors);
              }
              resolve(result);
            });
          });
        }
      } else {
        result.rx_bytes = _network[ifaceSanitized].rx_bytes;
        result.tx_bytes = _network[ifaceSanitized].tx_bytes;
        result.rx_sec = _network[ifaceSanitized].rx_sec;
        result.tx_sec = _network[ifaceSanitized].tx_sec;
        result.ms = _network[ifaceSanitized].last_ms;
        result.operstate = _network[ifaceSanitized].operstate;
        resolve(result);
      }
    });
  });
}
network.networkStats = networkStats;
function getProcessName(processes2, pid) {
  let cmd = "";
  processes2.forEach((line) => {
    const parts = line.split(" ");
    const id = parseInt(parts[0], 10) || -1;
    if (id === pid) {
      parts.shift();
      cmd = parts.join(" ").split(":")[0];
    }
  });
  cmd = cmd.split(" -")[0];
  const cmdParts = cmd.split("/");
  return cmdParts[cmdParts.length - 1];
}
function networkConnections(callback) {
  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = [];
      if (_linux$8 || _freebsd$7 || _openbsd$7 || _netbsd$7) {
        let cmd = 'export LC_ALL=C; netstat -tunap | grep "ESTABLISHED\\|SYN_SENT\\|SYN_RECV\\|FIN_WAIT1\\|FIN_WAIT2\\|TIME_WAIT\\|CLOSE\\|CLOSE_WAIT\\|LAST_ACK\\|LISTEN\\|CLOSING\\|UNKNOWN"; unset LC_ALL';
        if (_freebsd$7 || _openbsd$7 || _netbsd$7) {
          cmd = 'export LC_ALL=C; netstat -na | grep "ESTABLISHED\\|SYN_SENT\\|SYN_RECV\\|FIN_WAIT1\\|FIN_WAIT2\\|TIME_WAIT\\|CLOSE\\|CLOSE_WAIT\\|LAST_ACK\\|LISTEN\\|CLOSING\\|UNKNOWN"; unset LC_ALL';
        }
        exec$8(cmd, { maxBuffer: 1024 * 2e4 }, function(error, stdout) {
          let lines = stdout.toString().split("\n");
          if (!error && (lines.length > 1 || lines[0] != "")) {
            lines.forEach(function(line) {
              line = line.replace(/ +/g, " ").split(" ");
              if (line.length >= 7) {
                let localip = line[3];
                let localport = "";
                let localaddress = line[3].split(":");
                if (localaddress.length > 1) {
                  localport = localaddress[localaddress.length - 1];
                  localaddress.pop();
                  localip = localaddress.join(":");
                }
                let peerip = line[4];
                let peerport = "";
                let peeraddress = line[4].split(":");
                if (peeraddress.length > 1) {
                  peerport = peeraddress[peeraddress.length - 1];
                  peeraddress.pop();
                  peerip = peeraddress.join(":");
                }
                let connstate = line[5];
                let proc = line[6].split("/");
                if (connstate) {
                  result.push({
                    protocol: line[0],
                    localAddress: localip,
                    localPort: localport,
                    peerAddress: peerip,
                    peerPort: peerport,
                    state: connstate,
                    pid: proc[0] && proc[0] !== "-" ? parseInt(proc[0], 10) : null,
                    process: proc[1] ? proc[1].split(" ")[0].split(":")[0] : ""
                  });
                }
              }
            });
            if (callback) {
              callback(result);
            }
            resolve(result);
          } else {
            cmd = 'ss -tunap | grep "ESTAB\\|SYN-SENT\\|SYN-RECV\\|FIN-WAIT1\\|FIN-WAIT2\\|TIME-WAIT\\|CLOSE\\|CLOSE-WAIT\\|LAST-ACK\\|LISTEN\\|CLOSING"';
            exec$8(cmd, { maxBuffer: 1024 * 2e4 }, function(error2, stdout2) {
              if (!error2) {
                let lines2 = stdout2.toString().split("\n");
                lines2.forEach(function(line) {
                  line = line.replace(/ +/g, " ").split(" ");
                  if (line.length >= 6) {
                    let localip = line[4];
                    let localport = "";
                    let localaddress = line[4].split(":");
                    if (localaddress.length > 1) {
                      localport = localaddress[localaddress.length - 1];
                      localaddress.pop();
                      localip = localaddress.join(":");
                    }
                    let peerip = line[5];
                    let peerport = "";
                    let peeraddress = line[5].split(":");
                    if (peeraddress.length > 1) {
                      peerport = peeraddress[peeraddress.length - 1];
                      peeraddress.pop();
                      peerip = peeraddress.join(":");
                    }
                    let connstate = line[1];
                    if (connstate === "ESTAB") {
                      connstate = "ESTABLISHED";
                    }
                    if (connstate === "TIME-WAIT") {
                      connstate = "TIME_WAIT";
                    }
                    let pid = null;
                    let process2 = "";
                    if (line.length >= 7 && line[6].indexOf("users:") > -1) {
                      let proc = line[6].replace('users:(("', "").replace(/"/g, "").split(",");
                      if (proc.length > 2) {
                        process2 = proc[0].split(" ")[0].split(":")[0];
                        pid = parseInt(proc[1], 10);
                      }
                    }
                    if (connstate) {
                      result.push({
                        protocol: line[0],
                        localAddress: localip,
                        localPort: localport,
                        peerAddress: peerip,
                        peerPort: peerport,
                        state: connstate,
                        pid,
                        process: process2
                      });
                    }
                  }
                });
              }
              if (callback) {
                callback(result);
              }
              resolve(result);
            });
          }
        });
      }
      if (_darwin$8) {
        let cmd = 'netstat -natvln | grep "tcp4\\|tcp6\\|udp4\\|udp6"';
        const states = "ESTABLISHED|SYN_SENT|SYN_RECV|FIN_WAIT1|FIN_WAIT2|TIME_WAIT|CLOSE|CLOSE_WAIT|LAST_ACK|LISTEN|CLOSING|UNKNOWN";
        exec$8(cmd, { maxBuffer: 1024 * 2e4 }, function(error, stdout) {
          if (!error) {
            exec$8("ps -axo pid,command", { maxBuffer: 1024 * 2e4 }, function(err2, stdout2) {
              let processes2 = stdout2.toString().split("\n");
              processes2 = processes2.map((line) => {
                return line.trim().replace(/ +/g, " ");
              });
              let lines = stdout.toString().split("\n");
              lines.forEach(function(line) {
                line = line.replace(/ +/g, " ").split(" ");
                if (line.length >= 8) {
                  let localip = line[3];
                  let localport = "";
                  let localaddress = line[3].split(".");
                  if (localaddress.length > 1) {
                    localport = localaddress[localaddress.length - 1];
                    localaddress.pop();
                    localip = localaddress.join(".");
                  }
                  let peerip = line[4];
                  let peerport = "";
                  let peeraddress = line[4].split(".");
                  if (peeraddress.length > 1) {
                    peerport = peeraddress[peeraddress.length - 1];
                    peeraddress.pop();
                    peerip = peeraddress.join(".");
                  }
                  const hasState = states.indexOf(line[5]) >= 0;
                  let connstate = hasState ? line[5] : "UNKNOWN";
                  let pid = parseInt(line[8 + (hasState ? 0 : -1)], 10);
                  if (connstate) {
                    result.push({
                      protocol: line[0],
                      localAddress: localip,
                      localPort: localport,
                      peerAddress: peerip,
                      peerPort: peerport,
                      state: connstate,
                      pid,
                      process: getProcessName(processes2, pid)
                    });
                  }
                }
              });
              if (callback) {
                callback(result);
              }
              resolve(result);
            });
          }
        });
      }
      if (_windows$9) {
        let cmd = "netstat -nao";
        try {
          exec$8(cmd, util$a.execOptsWin, function(error, stdout) {
            if (!error) {
              let lines = stdout.toString().split("\r\n");
              lines.forEach(function(line) {
                line = line.trim().replace(/ +/g, " ").split(" ");
                if (line.length >= 4) {
                  let localip = line[1];
                  let localport = "";
                  let localaddress = line[1].split(":");
                  if (localaddress.length > 1) {
                    localport = localaddress[localaddress.length - 1];
                    localaddress.pop();
                    localip = localaddress.join(":");
                  }
                  localip = localip.replace(/\[/g, "").replace(/\]/g, "");
                  let peerip = line[2];
                  let peerport = "";
                  let peeraddress = line[2].split(":");
                  if (peeraddress.length > 1) {
                    peerport = peeraddress[peeraddress.length - 1];
                    peeraddress.pop();
                    peerip = peeraddress.join(":");
                  }
                  peerip = peerip.replace(/\[/g, "").replace(/\]/g, "");
                  let pid = util$a.toInt(line[4]);
                  let connstate = line[3];
                  if (connstate === "HERGESTELLT") {
                    connstate = "ESTABLISHED";
                  }
                  if (connstate.startsWith("ABH")) {
                    connstate = "LISTEN";
                  }
                  if (connstate === "SCHLIESSEN_WARTEN") {
                    connstate = "CLOSE_WAIT";
                  }
                  if (connstate === "WARTEND") {
                    connstate = "TIME_WAIT";
                  }
                  if (connstate === "SYN_GESENDET") {
                    connstate = "SYN_SENT";
                  }
                  if (connstate === "LISTENING") {
                    connstate = "LISTEN";
                  }
                  if (connstate === "SYN_RECEIVED") {
                    connstate = "SYN_RECV";
                  }
                  if (connstate === "FIN_WAIT_1") {
                    connstate = "FIN_WAIT1";
                  }
                  if (connstate === "FIN_WAIT_2") {
                    connstate = "FIN_WAIT2";
                  }
                  if (line[0].toLowerCase() !== "udp" && connstate) {
                    result.push({
                      protocol: line[0].toLowerCase(),
                      localAddress: localip,
                      localPort: localport,
                      peerAddress: peerip,
                      peerPort: peerport,
                      state: connstate,
                      pid,
                      process: ""
                    });
                  } else if (line[0].toLowerCase() === "udp") {
                    result.push({
                      protocol: line[0].toLowerCase(),
                      localAddress: localip,
                      localPort: localport,
                      peerAddress: peerip,
                      peerPort: peerport,
                      state: "",
                      pid: parseInt(line[3], 10),
                      process: ""
                    });
                  }
                }
              });
              if (callback) {
                callback(result);
              }
              resolve(result);
            }
          });
        } catch (e) {
          if (callback) {
            callback(result);
          }
          resolve(result);
        }
      }
    });
  });
}
network.networkConnections = networkConnections;
function networkGatewayDefault(callback) {
  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = "";
      if (_linux$8 || _freebsd$7 || _openbsd$7 || _netbsd$7) {
        let cmd = "ip route get 1";
        try {
          exec$8(cmd, { maxBuffer: 1024 * 2e4 }, function(error, stdout) {
            if (!error) {
              let lines = stdout.toString().split("\n");
              const line = lines && lines[0] ? lines[0] : "";
              let parts = line.split(" via ");
              if (parts && parts[1]) {
                parts = parts[1].split(" ");
                result = parts[0];
              }
              if (callback) {
                callback(result);
              }
              resolve(result);
            } else {
              if (callback) {
                callback(result);
              }
              resolve(result);
            }
          });
        } catch (e) {
          if (callback) {
            callback(result);
          }
          resolve(result);
        }
      }
      if (_darwin$8) {
        let cmd = "route -n get default";
        try {
          exec$8(cmd, { maxBuffer: 1024 * 2e4 }, function(error, stdout) {
            if (!error) {
              const lines = stdout.toString().split("\n").map((line) => line.trim());
              result = util$a.getValue(lines, "gateway");
            }
            if (!result) {
              cmd = "netstat -rn | awk '/default/ {print $2}'";
              exec$8(cmd, { maxBuffer: 1024 * 2e4 }, function(error2, stdout2) {
                const lines = stdout2.toString().split("\n").map((line) => line.trim());
                result = lines.find((line) => /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(line));
                if (callback) {
                  callback(result);
                }
                resolve(result);
              });
            } else {
              if (callback) {
                callback(result);
              }
              resolve(result);
            }
          });
        } catch (e) {
          if (callback) {
            callback(result);
          }
          resolve(result);
        }
      }
      if (_windows$9) {
        try {
          exec$8("netstat -r", util$a.execOptsWin, function(error, stdout) {
            const lines = stdout.toString().split(os$3.EOL);
            lines.forEach((line) => {
              line = line.replace(/\s+/g, " ").trim();
              if (line.indexOf("0.0.0.0 0.0.0.0") > -1 && !/[a-zA-Z]/.test(line)) {
                const parts = line.split(" ");
                if (parts.length >= 5 && parts[parts.length - 3].indexOf(".") > -1) {
                  result = parts[parts.length - 3];
                }
              }
            });
            if (!result) {
              util$a.powerShell("Get-CimInstance -ClassName Win32_IP4RouteTable | Where-Object { $_.Destination -eq '0.0.0.0' -and $_.Mask -eq '0.0.0.0' }").then((data) => {
                let lines2 = data.toString().split("\r\n");
                if (lines2.length > 1 && !result) {
                  result = util$a.getValue(lines2, "NextHop");
                  if (callback) {
                    callback(result);
                  }
                  resolve(result);
                }
              });
            } else {
              if (callback) {
                callback(result);
              }
              resolve(result);
            }
          });
        } catch (e) {
          if (callback) {
            callback(result);
          }
          resolve(result);
        }
      }
    });
  });
}
network.networkGatewayDefault = networkGatewayDefault;
var wifi = {};
const os$2 = require$$0$1;
const exec$7 = require$$1.exec;
const execSync$3 = require$$1.execSync;
const util$9 = util$j;
let _platform$8 = process.platform;
const _linux$7 = _platform$8 === "linux" || _platform$8 === "android";
const _darwin$7 = _platform$8 === "darwin";
const _windows$8 = _platform$8 === "win32";
function wifiDBFromQuality(quality) {
  const qual = parseFloat(quality);
  if (qual < 0) {
    return 0;
  }
  if (qual >= 100) {
    return -50;
  }
  return qual / 2 - 100;
}
function wifiQualityFromDB(db) {
  const result = 2 * (parseFloat(db) + 100);
  return result <= 100 ? result : 100;
}
const _wifi_frequencies = {
  1: 2412,
  2: 2417,
  3: 2422,
  4: 2427,
  5: 2432,
  6: 2437,
  7: 2442,
  8: 2447,
  9: 2452,
  10: 2457,
  11: 2462,
  12: 2467,
  13: 2472,
  14: 2484,
  32: 5160,
  34: 5170,
  36: 5180,
  38: 5190,
  40: 5200,
  42: 5210,
  44: 5220,
  46: 5230,
  48: 5240,
  50: 5250,
  52: 5260,
  54: 5270,
  56: 5280,
  58: 5290,
  60: 5300,
  62: 5310,
  64: 5320,
  68: 5340,
  96: 5480,
  100: 5500,
  102: 5510,
  104: 5520,
  106: 5530,
  108: 5540,
  110: 5550,
  112: 5560,
  114: 5570,
  116: 5580,
  118: 5590,
  120: 5600,
  122: 5610,
  124: 5620,
  126: 5630,
  128: 5640,
  132: 5660,
  134: 5670,
  136: 5680,
  138: 5690,
  140: 5700,
  142: 5710,
  144: 5720,
  149: 5745,
  151: 5755,
  153: 5765,
  155: 5775,
  157: 5785,
  159: 5795,
  161: 5805,
  165: 5825,
  169: 5845,
  173: 5865,
  183: 4915,
  184: 4920,
  185: 4925,
  187: 4935,
  188: 4940,
  189: 4945,
  192: 4960,
  196: 4980
};
function wifiFrequencyFromChannel(channel) {
  return {}.hasOwnProperty.call(_wifi_frequencies, channel) ? _wifi_frequencies[channel] : null;
}
function wifiChannelFromFrequencs(frequency) {
  let channel = 0;
  for (let key in _wifi_frequencies) {
    if ({}.hasOwnProperty.call(_wifi_frequencies, key)) {
      if (_wifi_frequencies[key] === frequency) {
        channel = util$9.toInt(key);
      }
    }
  }
  return channel;
}
function ifaceListLinux() {
  const result = [];
  const cmd = "iw dev 2>/dev/null";
  try {
    const all = execSync$3(cmd).toString().split("\n").map((line) => line.trim()).join("\n");
    const parts = all.split("\nInterface ");
    parts.shift();
    parts.forEach((ifaceDetails) => {
      const lines = ifaceDetails.split("\n");
      const iface = lines[0];
      const id = util$9.toInt(util$9.getValue(lines, "ifindex", " "));
      const mac = util$9.getValue(lines, "addr", " ");
      const channel = util$9.toInt(util$9.getValue(lines, "channel", " "));
      result.push({
        id,
        iface,
        mac,
        channel
      });
    });
    return result;
  } catch (e) {
    try {
      const all = execSync$3("nmcli -t -f general,wifi-properties,wired-properties,interface-flags,capabilities,nsp device show 2>/dev/null").toString();
      const parts = all.split("\n\n");
      let i = 1;
      parts.forEach((ifaceDetails) => {
        const lines = ifaceDetails.split("\n");
        const iface = util$9.getValue(lines, "GENERAL.DEVICE");
        const type = util$9.getValue(lines, "GENERAL.TYPE");
        const id = i++;
        const mac = util$9.getValue(lines, "GENERAL.HWADDR");
        const channel = "";
        if (type.toLowerCase() === "wifi") {
          result.push({
            id,
            iface,
            mac,
            channel
          });
        }
      });
      return result;
    } catch (e2) {
      return [];
    }
  }
}
function nmiDeviceLinux(iface) {
  const cmd = `nmcli -t -f general,wifi-properties,capabilities,ip4,ip6 device show ${iface} 2>/dev/null`;
  try {
    const lines = execSync$3(cmd).toString().split("\n");
    const ssid = util$9.getValue(lines, "GENERAL.CONNECTION");
    return {
      iface,
      type: util$9.getValue(lines, "GENERAL.TYPE"),
      vendor: util$9.getValue(lines, "GENERAL.VENDOR"),
      product: util$9.getValue(lines, "GENERAL.PRODUCT"),
      mac: util$9.getValue(lines, "GENERAL.HWADDR").toLowerCase(),
      ssid: ssid !== "--" ? ssid : null
    };
  } catch (e) {
    return {};
  }
}
function nmiConnectionLinux(ssid) {
  const cmd = `nmcli -t --show-secrets connection show ${ssid} 2>/dev/null`;
  try {
    const lines = execSync$3(cmd).toString().split("\n");
    const bssid = util$9.getValue(lines, "802-11-wireless.seen-bssids").toLowerCase();
    return {
      ssid: ssid !== "--" ? ssid : null,
      uuid: util$9.getValue(lines, "connection.uuid"),
      type: util$9.getValue(lines, "connection.type"),
      autoconnect: util$9.getValue(lines, "connection.autoconnect") === "yes",
      security: util$9.getValue(lines, "802-11-wireless-security.key-mgmt"),
      bssid: bssid !== "--" ? bssid : null
    };
  } catch (e) {
    return {};
  }
}
function wpaConnectionLinux(iface) {
  if (!iface) {
    return {};
  }
  const cmd = `wpa_cli -i ${iface} status 2>&1`;
  try {
    const lines = execSync$3(cmd).toString().split("\n");
    const freq = util$9.toInt(util$9.getValue(lines, "freq", "="));
    return {
      ssid: util$9.getValue(lines, "ssid", "="),
      uuid: util$9.getValue(lines, "uuid", "="),
      security: util$9.getValue(lines, "key_mgmt", "="),
      freq,
      channel: wifiChannelFromFrequencs(freq),
      bssid: util$9.getValue(lines, "bssid", "=").toLowerCase()
    };
  } catch (e) {
    return {};
  }
}
function getWifiNetworkListNmi() {
  const result = [];
  const cmd = "nmcli -t -m multiline --fields active,ssid,bssid,mode,chan,freq,signal,security,wpa-flags,rsn-flags device wifi list 2>/dev/null";
  try {
    const stdout = execSync$3(cmd, { maxBuffer: 1024 * 2e4 });
    const parts = stdout.toString().split("ACTIVE:");
    parts.shift();
    parts.forEach((part) => {
      part = "ACTIVE:" + part;
      const lines = part.split(os$2.EOL);
      const channel = util$9.getValue(lines, "CHAN");
      const frequency = util$9.getValue(lines, "FREQ").toLowerCase().replace("mhz", "").trim();
      const security = util$9.getValue(lines, "SECURITY").replace("(", "").replace(")", "");
      const wpaFlags = util$9.getValue(lines, "WPA-FLAGS").replace("(", "").replace(")", "");
      const rsnFlags = util$9.getValue(lines, "RSN-FLAGS").replace("(", "").replace(")", "");
      const quality = util$9.getValue(lines, "SIGNAL");
      result.push({
        ssid: util$9.getValue(lines, "SSID"),
        bssid: util$9.getValue(lines, "BSSID").toLowerCase(),
        mode: util$9.getValue(lines, "MODE"),
        channel: channel ? parseInt(channel, 10) : null,
        frequency: frequency ? parseInt(frequency, 10) : null,
        signalLevel: wifiDBFromQuality(quality),
        quality: quality ? parseInt(quality, 10) : null,
        security: security && security !== "none" ? security.split(" ") : [],
        wpaFlags: wpaFlags && wpaFlags !== "none" ? wpaFlags.split(" ") : [],
        rsnFlags: rsnFlags && rsnFlags !== "none" ? rsnFlags.split(" ") : []
      });
    });
    return result;
  } catch (e) {
    return [];
  }
}
function getWifiNetworkListIw(iface) {
  const result = [];
  try {
    let iwlistParts = execSync$3(`export LC_ALL=C; iwlist ${iface} scan 2>&1; unset LC_ALL`).toString().split("        Cell ");
    if (iwlistParts[0].indexOf("resource busy") >= 0) {
      return -1;
    }
    if (iwlistParts.length > 1) {
      iwlistParts.shift();
      iwlistParts.forEach((element) => {
        const lines = element.split("\n");
        const channel = util$9.getValue(lines, "channel", ":", true);
        const address = lines && lines.length && lines[0].indexOf("Address:") >= 0 ? lines[0].split("Address:")[1].trim().toLowerCase() : "";
        const mode = util$9.getValue(lines, "mode", ":", true);
        const frequency = util$9.getValue(lines, "frequency", ":", true);
        const qualityString = util$9.getValue(lines, "Quality", "=", true);
        const dbParts = qualityString.toLowerCase().split("signal level=");
        const db = dbParts.length > 1 ? util$9.toInt(dbParts[1]) : 0;
        const quality = db ? wifiQualityFromDB(db) : 0;
        const ssid = util$9.getValue(lines, "essid", ":", true);
        const isWpa = element.indexOf(" WPA ") >= 0;
        const isWpa2 = element.indexOf("WPA2 ") >= 0;
        const security = [];
        if (isWpa) {
          security.push("WPA");
        }
        if (isWpa2) {
          security.push("WPA2");
        }
        const wpaFlags = [];
        let wpaFlag = "";
        lines.forEach(function(line) {
          const l = line.trim().toLowerCase();
          if (l.indexOf("group cipher") >= 0) {
            if (wpaFlag) {
              wpaFlags.push(wpaFlag);
            }
            const parts = l.split(":");
            if (parts.length > 1) {
              wpaFlag = parts[1].trim().toUpperCase();
            }
          }
          if (l.indexOf("pairwise cipher") >= 0) {
            const parts = l.split(":");
            if (parts.length > 1) {
              if (parts[1].indexOf("tkip")) {
                wpaFlag = wpaFlag ? "TKIP/" + wpaFlag : "TKIP";
              } else if (parts[1].indexOf("ccmp")) {
                wpaFlag = wpaFlag ? "CCMP/" + wpaFlag : "CCMP";
              } else if (parts[1].indexOf("proprietary")) {
                wpaFlag = wpaFlag ? "PROP/" + wpaFlag : "PROP";
              }
            }
          }
          if (l.indexOf("authentication suites") >= 0) {
            const parts = l.split(":");
            if (parts.length > 1) {
              if (parts[1].indexOf("802.1x")) {
                wpaFlag = wpaFlag ? "802.1x/" + wpaFlag : "802.1x";
              } else if (parts[1].indexOf("psk")) {
                wpaFlag = wpaFlag ? "PSK/" + wpaFlag : "PSK";
              }
            }
          }
        });
        if (wpaFlag) {
          wpaFlags.push(wpaFlag);
        }
        result.push({
          ssid,
          bssid: address,
          mode,
          channel: channel ? util$9.toInt(channel) : null,
          frequency: frequency ? util$9.toInt(frequency.replace(".", "")) : null,
          signalLevel: db,
          quality,
          security,
          wpaFlags,
          rsnFlags: []
        });
      });
    }
    return result;
  } catch (e) {
    return -1;
  }
}
function parseWifiDarwin(wifiObj) {
  const result = [];
  if (wifiObj) {
    wifiObj.forEach(function(wifiItem) {
      const signalLevel = wifiItem.RSSI;
      let security = [];
      let wpaFlags = [];
      let ssid = wifiItem.SSID_STR || "";
      if (wifiItem.WPA_IE) {
        security.push("WPA");
        if (wifiItem.WPA_IE.IE_KEY_WPA_UCIPHERS) {
          wifiItem.WPA_IE.IE_KEY_WPA_UCIPHERS.forEach(function(ciphers) {
            if (ciphers === 0 && wpaFlags.indexOf("unknown/TKIP") === -1) {
              wpaFlags.push("unknown/TKIP");
            }
            if (ciphers === 2 && wpaFlags.indexOf("PSK/TKIP") === -1) {
              wpaFlags.push("PSK/TKIP");
            }
            if (ciphers === 4 && wpaFlags.indexOf("PSK/AES") === -1) {
              wpaFlags.push("PSK/AES");
            }
          });
        }
      }
      if (wifiItem.RSN_IE) {
        security.push("WPA2");
        if (wifiItem.RSN_IE.IE_KEY_RSN_UCIPHERS) {
          wifiItem.RSN_IE.IE_KEY_RSN_UCIPHERS.forEach(function(ciphers) {
            if (ciphers === 0 && wpaFlags.indexOf("unknown/TKIP") === -1) {
              wpaFlags.push("unknown/TKIP");
            }
            if (ciphers === 2 && wpaFlags.indexOf("TKIP/TKIP") === -1) {
              wpaFlags.push("TKIP/TKIP");
            }
            if (ciphers === 4 && wpaFlags.indexOf("PSK/AES") === -1) {
              wpaFlags.push("PSK/AES");
            }
          });
        }
      }
      if (wifiItem.SSID && ssid === "") {
        try {
          ssid = Buffer.from(wifiItem.SSID, "base64").toString("utf8");
        } catch (err) {
          util$9.noop();
        }
      }
      result.push({
        ssid,
        bssid: wifiItem.BSSID || "",
        mode: "",
        channel: wifiItem.CHANNEL,
        frequency: wifiFrequencyFromChannel(wifiItem.CHANNEL),
        signalLevel: signalLevel ? parseInt(signalLevel, 10) : null,
        quality: wifiQualityFromDB(signalLevel),
        security,
        wpaFlags,
        rsnFlags: []
      });
    });
  }
  return result;
}
function wifiNetworks(callback) {
  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = [];
      if (_linux$7) {
        result = getWifiNetworkListNmi();
        if (result.length === 0) {
          try {
            const iwconfigParts = execSync$3("export LC_ALL=C; iwconfig 2>/dev/null; unset LC_ALL").toString().split("\n\n");
            let iface = "";
            iwconfigParts.forEach((element) => {
              if (element.indexOf("no wireless") === -1 && element.trim() !== "") {
                iface = element.split(" ")[0];
              }
            });
            if (iface) {
              let ifaceSanitized = "";
              const s = util$9.isPrototypePolluted() ? "---" : util$9.sanitizeShellString(iface, true);
              const l = util$9.mathMin(s.length, 2e3);
              for (let i = 0; i <= l; i++) {
                if (s[i] !== void 0) {
                  ifaceSanitized = ifaceSanitized + s[i];
                }
              }
              const res = getWifiNetworkListIw(ifaceSanitized);
              if (res === -1) {
                setTimeout(function(iface2) {
                  const res2 = getWifiNetworkListIw(iface2);
                  if (res2 != -1) {
                    result = res2;
                  }
                  if (callback) {
                    callback(result);
                  }
                  resolve(result);
                }, 4e3);
              } else {
                result = res;
                if (callback) {
                  callback(result);
                }
                resolve(result);
              }
            } else {
              if (callback) {
                callback(result);
              }
              resolve(result);
            }
          } catch (e) {
            if (callback) {
              callback(result);
            }
            resolve(result);
          }
        } else {
          if (callback) {
            callback(result);
          }
          resolve(result);
        }
      } else if (_darwin$7) {
        let cmd = "/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -s -x";
        exec$7(cmd, { maxBuffer: 1024 * 4e4 }, function(error, stdout) {
          const output = stdout.toString();
          result = parseWifiDarwin(util$9.plistParser(output));
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      } else if (_windows$8) {
        let cmd = "netsh wlan show networks mode=Bssid";
        util$9.powerShell(cmd).then((stdout) => {
          const ssidParts = stdout.toString("utf8").split(os$2.EOL + os$2.EOL + "SSID ");
          ssidParts.shift();
          ssidParts.forEach((ssidPart) => {
            const ssidLines = ssidPart.split(os$2.EOL);
            if (ssidLines && ssidLines.length >= 8 && ssidLines[0].indexOf(":") >= 0) {
              const bssidsParts = ssidPart.split(" BSSID");
              bssidsParts.shift();
              bssidsParts.forEach((bssidPart) => {
                const bssidLines = bssidPart.split(os$2.EOL);
                const bssidLine = bssidLines[0].split(":");
                bssidLine.shift();
                const bssid = bssidLine.join(":").trim().toLowerCase();
                const channel = bssidLines[3].split(":").pop().trim();
                const quality = bssidLines[1].split(":").pop().trim();
                result.push({
                  ssid: ssidLines[0].split(":").pop().trim(),
                  bssid,
                  mode: "",
                  channel: channel ? parseInt(channel, 10) : null,
                  frequency: wifiFrequencyFromChannel(channel),
                  signalLevel: wifiDBFromQuality(quality),
                  quality: quality ? parseInt(quality, 10) : null,
                  security: [ssidLines[2].split(":").pop().trim()],
                  wpaFlags: [ssidLines[3].split(":").pop().trim()],
                  rsnFlags: []
                });
              });
            }
          });
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      } else {
        if (callback) {
          callback(result);
        }
        resolve(result);
      }
    });
  });
}
wifi.wifiNetworks = wifiNetworks;
function getVendor(model) {
  model = model.toLowerCase();
  let result = "";
  if (model.indexOf("intel") >= 0) {
    result = "Intel";
  } else if (model.indexOf("realtek") >= 0) {
    result = "Realtek";
  } else if (model.indexOf("qualcom") >= 0) {
    result = "Qualcom";
  } else if (model.indexOf("broadcom") >= 0) {
    result = "Broadcom";
  } else if (model.indexOf("cavium") >= 0) {
    result = "Cavium";
  } else if (model.indexOf("cisco") >= 0) {
    result = "Cisco";
  } else if (model.indexOf("marvel") >= 0) {
    result = "Marvel";
  } else if (model.indexOf("zyxel") >= 0) {
    result = "Zyxel";
  } else if (model.indexOf("melanox") >= 0) {
    result = "Melanox";
  } else if (model.indexOf("d-link") >= 0) {
    result = "D-Link";
  } else if (model.indexOf("tp-link") >= 0) {
    result = "TP-Link";
  } else if (model.indexOf("asus") >= 0) {
    result = "Asus";
  } else if (model.indexOf("linksys") >= 0) {
    result = "Linksys";
  }
  return result;
}
function formatBssid(s) {
  s = s.replace(/</g, "").replace(/>/g, "").match(/.{1,2}/g) || [];
  return s.join(":");
}
function wifiConnections(callback) {
  return new Promise((resolve) => {
    process.nextTick(() => {
      const result = [];
      if (_linux$7) {
        const ifaces = ifaceListLinux();
        const networkList = getWifiNetworkListNmi();
        ifaces.forEach((ifaceDetail) => {
          let ifaceSanitized = "";
          const s = util$9.isPrototypePolluted() ? "---" : util$9.sanitizeShellString(ifaceDetail.iface, true);
          const ll = util$9.mathMin(s.length, 2e3);
          for (let i = 0; i <= ll; i++) {
            if (s[i] !== void 0) {
              ifaceSanitized = ifaceSanitized + s[i];
            }
          }
          const nmiDetails = nmiDeviceLinux(ifaceSanitized);
          const wpaDetails = wpaConnectionLinux(ifaceSanitized);
          const ssid = nmiDetails.ssid || wpaDetails.ssid;
          const network2 = networkList.filter((nw) => nw.ssid === ssid);
          let ssidSanitized = "";
          const t = util$9.isPrototypePolluted() ? "---" : util$9.sanitizeShellString(ssid, true);
          const l = util$9.mathMin(t.length, 2e3);
          for (let i = 0; i <= l; i++) {
            if (t[i] !== void 0) {
              ssidSanitized = ssidSanitized + t[i];
            }
          }
          const nmiConnection = nmiConnectionLinux(ssidSanitized);
          const channel = network2 && network2.length && network2[0].channel ? network2[0].channel : wpaDetails.channel ? wpaDetails.channel : null;
          const bssid = network2 && network2.length && network2[0].bssid ? network2[0].bssid : wpaDetails.bssid ? wpaDetails.bssid : null;
          const signalLevel = network2 && network2.length && network2[0].signalLevel ? network2[0].signalLevel : null;
          if (ssid && bssid) {
            result.push({
              id: ifaceDetail.id,
              iface: ifaceDetail.iface,
              model: nmiDetails.product,
              ssid,
              bssid: network2 && network2.length && network2[0].bssid ? network2[0].bssid : wpaDetails.bssid ? wpaDetails.bssid : null,
              channel,
              frequency: channel ? wifiFrequencyFromChannel(channel) : null,
              type: nmiConnection.type ? nmiConnection.type : "802.11",
              security: nmiConnection.security ? nmiConnection.security : wpaDetails.security ? wpaDetails.security : null,
              signalLevel,
              quality: wifiQualityFromDB(signalLevel),
              txRate: null
            });
          }
        });
        if (callback) {
          callback(result);
        }
        resolve(result);
      } else if (_darwin$7) {
        let cmd = "system_profiler SPNetworkDataType";
        exec$7(cmd, function(error, stdout) {
          const parts1 = stdout.toString().split("\n\n    Wi-Fi:\n\n");
          if (parts1.length > 1) {
            const lines = parts1[1].split("\n\n")[0].split("\n");
            const iface = util$9.getValue(lines, "BSD Device Name", ":", true);
            const model = util$9.getValue(lines, "hardware", ":", true);
            cmd = '/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -I 2>/dev/null; echo "######" ; ioreg -n AppleBCMWLANSkywalkInterface -r 2>/dev/null';
            exec$7(cmd, function(error2, stdout2) {
              const parts = stdout2.toString().split("######");
              const lines2 = parts[0].split("\n");
              let lines3 = [];
              if (parts[1].indexOf("  | {") > 0 && parts[1].indexOf("  | }") > parts[1].indexOf("  | {")) {
                lines3 = parts[1].split("  | {")[1].split("  | }")[0].replace(/ \| /g, "").replace(/"/g, "").split("\n");
              }
              if (lines2.length > 10) {
                const ssid = util$9.getValue(lines2, "ssid", ":", true);
                const bssid = util$9.getValue(lines2, "bssid", ":", true) || formatBssid(util$9.getValue(lines3, "IO80211BSSID", "=", true));
                const security = util$9.getValue(lines2, "link auth", ":", true);
                const txRate = util$9.getValue(lines2, "lastTxRate", ":", true);
                const channel = util$9.getValue(lines2, "channel", ":", true).split(",")[0];
                const type = "802.11";
                const rssi = util$9.toInt(util$9.getValue(lines2, "agrCtlRSSI", ":", true));
                const signalLevel = rssi;
                if (ssid || bssid) {
                  result.push({
                    id: "Wi-Fi",
                    iface,
                    model,
                    ssid,
                    bssid,
                    channel: util$9.toInt(channel),
                    frequency: channel ? wifiFrequencyFromChannel(channel) : null,
                    type,
                    security,
                    signalLevel,
                    quality: wifiQualityFromDB(signalLevel),
                    txRate
                  });
                }
              }
              if (lines3.length > 10) {
                const ssid = util$9.getValue(lines3, "IO80211SSID", "=", true);
                const bssid = formatBssid(util$9.getValue(lines3, "IO80211BSSID", "=", true));
                const security = "";
                const txRate = -1;
                const signalLevel = -1;
                const quality = -1;
                const channel = util$9.getValue(lines3, "IO80211Channel", "=", true);
                const type = "802.11";
                if ((ssid || bssid) && !result.length) {
                  result.push({
                    id: "Wi-Fi",
                    iface,
                    model,
                    ssid,
                    bssid,
                    channel: util$9.toInt(channel),
                    frequency: channel ? wifiFrequencyFromChannel(channel) : null,
                    type,
                    security,
                    signalLevel,
                    quality,
                    txRate
                  });
                }
              }
              if (callback) {
                callback(result);
              }
              resolve(result);
            });
          } else {
            if (callback) {
              callback(result);
            }
            resolve(result);
          }
        });
      } else if (_windows$8) {
        let cmd = "netsh wlan show interfaces";
        util$9.powerShell(cmd).then(function(stdout) {
          const allLines = stdout.toString().split("\r\n");
          for (let i = 0; i < allLines.length; i++) {
            allLines[i] = allLines[i].trim();
          }
          const parts = allLines.join("\r\n").split(":\r\n\r\n");
          parts.shift();
          parts.forEach((part) => {
            const lines = part.split("\r\n");
            if (lines.length >= 5) {
              const iface = lines[0].indexOf(":") >= 0 ? lines[0].split(":")[1].trim() : "";
              const model = lines[1].indexOf(":") >= 0 ? lines[1].split(":")[1].trim() : "";
              const id = lines[2].indexOf(":") >= 0 ? lines[2].split(":")[1].trim() : "";
              const ssid = util$9.getValue(lines, "SSID", ":", true);
              const bssid = util$9.getValue(lines, "BSSID", ":", true);
              const quality = util$9.getValue(lines, "Signal", ":", true);
              const signalLevel = wifiDBFromQuality(quality);
              const type = util$9.getValue(lines, "Radio type", ":", true) || util$9.getValue(lines, "Type de radio", ":", true) || util$9.getValue(lines, "Funktyp", ":", true) || null;
              const security = util$9.getValue(lines, "authentication", ":", true) || util$9.getValue(lines, "Authentification", ":", true) || util$9.getValue(lines, "Authentifizierung", ":", true) || null;
              const channel = util$9.getValue(lines, "Channel", ":", true) || util$9.getValue(lines, "Canal", ":", true) || util$9.getValue(lines, "Kanal", ":", true) || null;
              const txRate = util$9.getValue(lines, "Transmit rate (mbps)", ":", true) || util$9.getValue(lines, "Transmission (mbit/s)", ":", true) || util$9.getValue(lines, "Empfangsrate (MBit/s)", ":", true) || null;
              if (model && id && ssid && bssid) {
                result.push({
                  id,
                  iface,
                  model,
                  ssid,
                  bssid,
                  channel: util$9.toInt(channel),
                  frequency: channel ? wifiFrequencyFromChannel(channel) : null,
                  type,
                  security,
                  signalLevel,
                  quality: quality ? parseInt(quality, 10) : null,
                  txRate: util$9.toInt(txRate) || null
                });
              }
            }
          });
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      } else {
        if (callback) {
          callback(result);
        }
        resolve(result);
      }
    });
  });
}
wifi.wifiConnections = wifiConnections;
function wifiInterfaces(callback) {
  return new Promise((resolve) => {
    process.nextTick(() => {
      const result = [];
      if (_linux$7) {
        const ifaces = ifaceListLinux();
        ifaces.forEach((ifaceDetail) => {
          const nmiDetails = nmiDeviceLinux(ifaceDetail.iface);
          result.push({
            id: ifaceDetail.id,
            iface: ifaceDetail.iface,
            model: nmiDetails.product ? nmiDetails.product : null,
            vendor: nmiDetails.vendor ? nmiDetails.vendor : null,
            mac: ifaceDetail.mac
          });
        });
        if (callback) {
          callback(result);
        }
        resolve(result);
      } else if (_darwin$7) {
        let cmd = "system_profiler SPNetworkDataType";
        exec$7(cmd, function(error, stdout) {
          const parts1 = stdout.toString().split("\n\n    Wi-Fi:\n\n");
          if (parts1.length > 1) {
            const lines = parts1[1].split("\n\n")[0].split("\n");
            const iface = util$9.getValue(lines, "BSD Device Name", ":", true);
            const mac = util$9.getValue(lines, "MAC Address", ":", true);
            const model = util$9.getValue(lines, "hardware", ":", true);
            result.push({
              id: "Wi-Fi",
              iface,
              model,
              vendor: "",
              mac
            });
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      } else if (_windows$8) {
        let cmd = "netsh wlan show interfaces";
        util$9.powerShell(cmd).then(function(stdout) {
          const allLines = stdout.toString().split("\r\n");
          for (let i = 0; i < allLines.length; i++) {
            allLines[i] = allLines[i].trim();
          }
          const parts = allLines.join("\r\n").split(":\r\n\r\n");
          parts.shift();
          parts.forEach((part) => {
            const lines = part.split("\r\n");
            if (lines.length >= 5) {
              const iface = lines[0].indexOf(":") >= 0 ? lines[0].split(":")[1].trim() : "";
              const model = lines[1].indexOf(":") >= 0 ? lines[1].split(":")[1].trim() : "";
              const id = lines[2].indexOf(":") >= 0 ? lines[2].split(":")[1].trim() : "";
              const macParts = lines[3].indexOf(":") >= 0 ? lines[3].split(":") : [];
              macParts.shift();
              const mac = macParts.join(":").trim();
              const vendor = getVendor(model);
              if (iface && model && id && mac) {
                result.push({
                  id,
                  iface,
                  model,
                  vendor,
                  mac
                });
              }
            }
          });
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      } else {
        if (callback) {
          callback(result);
        }
        resolve(result);
      }
    });
  });
}
wifi.wifiInterfaces = wifiInterfaces;
var processes$1 = {};
const os$1 = require$$0$1;
const fs$3 = require$$1$1;
const path$1 = require$$2;
const exec$6 = require$$1.exec;
const execSync$2 = require$$1.execSync;
const util$8 = util$j;
let _platform$7 = process.platform;
const _linux$6 = _platform$7 === "linux" || _platform$7 === "android";
const _darwin$6 = _platform$7 === "darwin";
const _windows$7 = _platform$7 === "win32";
const _freebsd$6 = _platform$7 === "freebsd";
const _openbsd$6 = _platform$7 === "openbsd";
const _netbsd$6 = _platform$7 === "netbsd";
const _sunos$6 = _platform$7 === "sunos";
const _processes_cpu = {
  all: 0,
  all_utime: 0,
  all_stime: 0,
  list: {},
  ms: 0,
  result: {}
};
const _services_cpu = {
  all: 0,
  all_utime: 0,
  all_stime: 0,
  list: {},
  ms: 0,
  result: {}
};
const _process_cpu = {
  all: 0,
  all_utime: 0,
  all_stime: 0,
  list: {},
  ms: 0,
  result: {}
};
const _winStatusValues = {
  "0": "unknown",
  "1": "other",
  "2": "ready",
  "3": "running",
  "4": "blocked",
  "5": "suspended blocked",
  "6": "suspended ready",
  "7": "terminated",
  "8": "stopped",
  "9": "growing"
};
function parseTimeUnix(time2) {
  let result = time2;
  let parts = time2.replace(/ +/g, " ").split(" ");
  if (parts.length === 5) {
    result = parts[4] + "-" + ("0" + ("JANFEBMARAPRMAYJUNJULAUGSEPOCTNOVDEC".indexOf(parts[1].toUpperCase()) / 3 + 1)).slice(-2) + "-" + ("0" + parts[2]).slice(-2) + " " + parts[3];
  }
  return result;
}
function parseElapsedTime(etime) {
  let current = /* @__PURE__ */ new Date();
  current = new Date(current.getTime() - current.getTimezoneOffset() * 6e4);
  const elapsed = etime.split("-");
  const timeIndex = elapsed.length - 1;
  const days = timeIndex > 0 ? parseInt(elapsed[timeIndex - 1]) : 0;
  const timeStr = elapsed[timeIndex].split(":");
  const hours = timeStr.length === 3 ? parseInt(timeStr[0] || 0) : 0;
  const mins = parseInt(timeStr[timeStr.length === 3 ? 1 : 0] || 0);
  const secs = parseInt(timeStr[timeStr.length === 3 ? 2 : 1] || 0);
  const ms = (((days * 24 + hours) * 60 + mins) * 60 + secs) * 1e3;
  let res = new Date(current.getTime());
  let result = res.toISOString().substring(0, 10) + " " + res.toISOString().substring(11, 19);
  try {
    res = new Date(current.getTime() - ms);
    result = res.toISOString().substring(0, 10) + " " + res.toISOString().substring(11, 19);
  } catch (e) {
    util$8.noop();
  }
  return result;
}
function services(srv, callback) {
  if (util$8.isFunction(srv) && !callback) {
    callback = srv;
    srv = "";
  }
  return new Promise((resolve) => {
    process.nextTick(() => {
      if (typeof srv !== "string") {
        if (callback) {
          callback([]);
        }
        return resolve([]);
      }
      if (srv) {
        let srvString = "";
        srvString.__proto__.toLowerCase = util$8.stringToLower;
        srvString.__proto__.replace = util$8.stringReplace;
        srvString.__proto__.trim = util$8.stringTrim;
        const s = util$8.sanitizeShellString(srv);
        const l = util$8.mathMin(s.length, 2e3);
        for (let i = 0; i <= l; i++) {
          if (s[i] !== void 0) {
            srvString = srvString + s[i];
          }
        }
        srvString = srvString.trim().toLowerCase().replace(/, /g, "|").replace(/,+/g, "|");
        if (srvString === "") {
          srvString = "*";
        }
        if (util$8.isPrototypePolluted() && srvString !== "*") {
          srvString = "------";
        }
        let srvs = srvString.split("|");
        let result = [];
        let dataSrv = [];
        if (_linux$6 || _freebsd$6 || _openbsd$6 || _netbsd$6 || _darwin$6) {
          if ((_linux$6 || _freebsd$6 || _openbsd$6 || _netbsd$6) && srvString === "*") {
            try {
              const tmpsrv = execSync$2("systemctl --all --type=service --no-legend 2> /dev/null").toString().split("\n");
              srvs = [];
              for (const s2 of tmpsrv) {
                const name2 = s2.split(".service")[0];
                if (name2 && s2.indexOf(" not-found ") === -1) {
                  srvs.push(name2.trim());
                }
              }
              srvString = srvs.join("|");
            } catch (d) {
              try {
                srvString = "";
                const tmpsrv = execSync$2("service --status-all 2> /dev/null").toString().split("\n");
                for (const s2 of tmpsrv) {
                  const parts = s2.split("]");
                  if (parts.length === 2) {
                    srvString += (srvString !== "" ? "|" : "") + parts[1].trim();
                  }
                }
                srvs = srvString.split("|");
              } catch (e) {
                try {
                  const srvStr = execSync$2("ls /etc/init.d/ -m 2> /dev/null").toString().split("\n").join("");
                  srvString = "";
                  if (srvStr) {
                    const tmpsrv = srvStr.split(",");
                    for (const s2 of tmpsrv) {
                      const name2 = s2.trim();
                      if (name2) {
                        srvString += (srvString !== "" ? "|" : "") + name2;
                      }
                    }
                    srvs = srvString.split("|");
                  }
                } catch (f) {
                  srvString = "";
                  srvs = [];
                }
              }
            }
          }
          if (_darwin$6 && srvString === "*") {
            if (callback) {
              callback(result);
            }
            resolve(result);
          }
          let args = _darwin$6 ? ["-caxo", "pcpu,pmem,pid,command"] : ["-axo", "pcpu,pmem,pid,command"];
          if (srvString !== "" && srvs.length > 0) {
            util$8.execSafe("ps", args).then((stdout) => {
              if (stdout) {
                let lines = stdout.replace(/ +/g, " ").replace(/,+/g, ".").split("\n");
                srvs.forEach(function(srv2) {
                  let ps;
                  if (_darwin$6) {
                    ps = lines.filter(function(e) {
                      return e.toLowerCase().indexOf(srv2) !== -1;
                    });
                  } else {
                    ps = lines.filter(function(e) {
                      return e.toLowerCase().indexOf(" " + srv2.toLowerCase() + ":") !== -1 || e.toLowerCase().indexOf("/" + srv2.toLowerCase()) !== -1;
                    });
                  }
                  const pids = [];
                  for (const p of ps) {
                    const pid = p.trim().split(" ")[2];
                    if (pid) {
                      pids.push(parseInt(pid, 10));
                    }
                  }
                  result.push({
                    name: srv2,
                    running: ps.length > 0,
                    startmode: "",
                    pids,
                    cpu: parseFloat(ps.reduce(function(pv, cv) {
                      return pv + parseFloat(cv.trim().split(" ")[0]);
                    }, 0).toFixed(2)),
                    mem: parseFloat(ps.reduce(function(pv, cv) {
                      return pv + parseFloat(cv.trim().split(" ")[1]);
                    }, 0).toFixed(2))
                  });
                });
                if (_linux$6) {
                  let cmd = 'cat /proc/stat | grep "cpu "';
                  for (let i in result) {
                    for (let j in result[i].pids) {
                      cmd += ";cat /proc/" + result[i].pids[j] + "/stat";
                    }
                  }
                  exec$6(cmd, { maxBuffer: 1024 * 2e4 }, function(error, stdout2) {
                    let curr_processes = stdout2.toString().split("\n");
                    let all = parseProcStat(curr_processes.shift());
                    let list_new = {};
                    let resultProcess = {};
                    curr_processes.forEach((element) => {
                      resultProcess = calcProcStatLinux(element, all, _services_cpu);
                      if (resultProcess.pid) {
                        let listPos = -1;
                        for (let i in result) {
                          for (let j in result[i].pids) {
                            if (parseInt(result[i].pids[j]) === parseInt(resultProcess.pid)) {
                              listPos = i;
                            }
                          }
                        }
                        if (listPos >= 0) {
                          result[listPos].cpu += resultProcess.cpuu + resultProcess.cpus;
                        }
                        list_new[resultProcess.pid] = {
                          cpuu: resultProcess.cpuu,
                          cpus: resultProcess.cpus,
                          utime: resultProcess.utime,
                          stime: resultProcess.stime,
                          cutime: resultProcess.cutime,
                          cstime: resultProcess.cstime
                        };
                      }
                    });
                    _services_cpu.all = all;
                    _services_cpu.list = Object.assign({}, list_new);
                    _services_cpu.ms = Date.now() - _services_cpu.ms;
                    _services_cpu.result = Object.assign({}, result);
                    if (callback) {
                      callback(result);
                    }
                    resolve(result);
                  });
                } else {
                  if (callback) {
                    callback(result);
                  }
                  resolve(result);
                }
              } else {
                args = ["-o", "comm"];
                util$8.execSafe("ps", args).then((stdout2) => {
                  if (stdout2) {
                    let lines = stdout2.replace(/ +/g, " ").replace(/,+/g, ".").split("\n");
                    srvs.forEach(function(srv2) {
                      let ps = lines.filter(function(e) {
                        return e.indexOf(srv2) !== -1;
                      });
                      result.push({
                        name: srv2,
                        running: ps.length > 0,
                        startmode: "",
                        cpu: 0,
                        mem: 0
                      });
                    });
                    if (callback) {
                      callback(result);
                    }
                    resolve(result);
                  } else {
                    srvs.forEach(function(srv2) {
                      result.push({
                        name: srv2,
                        running: false,
                        startmode: "",
                        cpu: 0,
                        mem: 0
                      });
                    });
                    if (callback) {
                      callback(result);
                    }
                    resolve(result);
                  }
                });
              }
            });
          } else {
            if (callback) {
              callback(result);
            }
            resolve(result);
          }
        }
        if (_windows$7) {
          try {
            let wincommand = "Get-CimInstance Win32_Service";
            if (srvs[0] !== "*") {
              wincommand += ' -Filter "';
              srvs.forEach((srv2) => {
                wincommand += `Name='${srv2}' or `;
              });
              wincommand = `${wincommand.slice(0, -4)}"`;
            }
            wincommand += " | select Name,Caption,Started,StartMode,ProcessId | fl";
            util$8.powerShell(wincommand).then((stdout, error) => {
              if (!error) {
                let serviceSections = stdout.split(/\n\s*\n/);
                serviceSections.forEach((element) => {
                  if (element.trim() !== "") {
                    let lines = element.trim().split("\r\n");
                    let srvName = util$8.getValue(lines, "Name", ":", true).toLowerCase();
                    let srvCaption = util$8.getValue(lines, "Caption", ":", true).toLowerCase();
                    let started = util$8.getValue(lines, "Started", ":", true);
                    let startMode = util$8.getValue(lines, "StartMode", ":", true);
                    let pid = util$8.getValue(lines, "ProcessId", ":", true);
                    if (srvString === "*" || srvs.indexOf(srvName) >= 0 || srvs.indexOf(srvCaption) >= 0) {
                      result.push({
                        name: srvName,
                        running: started.toLowerCase() === "true",
                        startmode: startMode,
                        pids: [pid],
                        cpu: 0,
                        mem: 0
                      });
                      dataSrv.push(srvName);
                      dataSrv.push(srvCaption);
                    }
                  }
                });
                if (srvString !== "*") {
                  let srvsMissing = srvs.filter(function(e) {
                    return dataSrv.indexOf(e) === -1;
                  });
                  srvsMissing.forEach(function(srvName) {
                    result.push({
                      name: srvName,
                      running: false,
                      startmode: "",
                      pids: [],
                      cpu: 0,
                      mem: 0
                    });
                  });
                }
                if (callback) {
                  callback(result);
                }
                resolve(result);
              } else {
                srvs.forEach(function(srvName) {
                  result.push({
                    name: srvName,
                    running: false,
                    startmode: "",
                    cpu: 0,
                    mem: 0
                  });
                });
                if (callback) {
                  callback(result);
                }
                resolve(result);
              }
            });
          } catch (e) {
            if (callback) {
              callback(result);
            }
            resolve(result);
          }
        }
      } else {
        if (callback) {
          callback([]);
        }
        resolve([]);
      }
    });
  });
}
processes$1.services = services;
function parseProcStat(line) {
  let parts = line.replace(/ +/g, " ").split(" ");
  let user = parts.length >= 2 ? parseInt(parts[1]) : 0;
  let nice = parts.length >= 3 ? parseInt(parts[2]) : 0;
  let system2 = parts.length >= 4 ? parseInt(parts[3]) : 0;
  let idle = parts.length >= 5 ? parseInt(parts[4]) : 0;
  let iowait = parts.length >= 6 ? parseInt(parts[5]) : 0;
  let irq = parts.length >= 7 ? parseInt(parts[6]) : 0;
  let softirq = parts.length >= 8 ? parseInt(parts[7]) : 0;
  let steal = parts.length >= 9 ? parseInt(parts[8]) : 0;
  let guest = parts.length >= 10 ? parseInt(parts[9]) : 0;
  let guest_nice = parts.length >= 11 ? parseInt(parts[10]) : 0;
  return user + nice + system2 + idle + iowait + irq + softirq + steal + guest + guest_nice;
}
function calcProcStatLinux(line, all, _cpu_old) {
  let statparts = line.replace(/ +/g, " ").split(")");
  if (statparts.length >= 2) {
    let parts = statparts[1].split(" ");
    if (parts.length >= 16) {
      let pid = parseInt(statparts[0].split(" ")[0]);
      let utime = parseInt(parts[12]);
      let stime = parseInt(parts[13]);
      let cutime = parseInt(parts[14]);
      let cstime = parseInt(parts[15]);
      let cpuu = 0;
      let cpus = 0;
      if (_cpu_old.all > 0 && _cpu_old.list[pid]) {
        cpuu = (utime + cutime - _cpu_old.list[pid].utime - _cpu_old.list[pid].cutime) / (all - _cpu_old.all) * 100;
        cpus = (stime + cstime - _cpu_old.list[pid].stime - _cpu_old.list[pid].cstime) / (all - _cpu_old.all) * 100;
      } else {
        cpuu = (utime + cutime) / all * 100;
        cpus = (stime + cstime) / all * 100;
      }
      return {
        pid,
        utime,
        stime,
        cutime,
        cstime,
        cpuu,
        cpus
      };
    } else {
      return {
        pid: 0,
        utime: 0,
        stime: 0,
        cutime: 0,
        cstime: 0,
        cpuu: 0,
        cpus: 0
      };
    }
  } else {
    return {
      pid: 0,
      utime: 0,
      stime: 0,
      cutime: 0,
      cstime: 0,
      cpuu: 0,
      cpus: 0
    };
  }
}
function calcProcStatWin(procStat, all, _cpu_old) {
  let cpuu = 0;
  let cpus = 0;
  if (_cpu_old.all > 0 && _cpu_old.list[procStat.pid]) {
    cpuu = (procStat.utime - _cpu_old.list[procStat.pid].utime) / (all - _cpu_old.all) * 100;
    cpus = (procStat.stime - _cpu_old.list[procStat.pid].stime) / (all - _cpu_old.all) * 100;
  } else {
    cpuu = procStat.utime / all * 100;
    cpus = procStat.stime / all * 100;
  }
  return {
    pid: procStat.pid,
    utime: procStat.utime,
    stime: procStat.stime,
    cpuu: cpuu > 0 ? cpuu : 0,
    cpus: cpus > 0 ? cpus : 0
  };
}
function processes(callback) {
  let parsedhead = [];
  function getName(command) {
    command = command || "";
    let result = command.split(" ")[0];
    if (result.substr(-1) === ":") {
      result = result.substr(0, result.length - 1);
    }
    if (result.substr(0, 1) !== "[") {
      let parts = result.split("/");
      if (isNaN(parseInt(parts[parts.length - 1]))) {
        result = parts[parts.length - 1];
      } else {
        result = parts[0];
      }
    }
    return result;
  }
  function parseLine(line) {
    let offset = 0;
    let offset2 = 0;
    function checkColumn(i) {
      offset = offset2;
      if (parsedhead[i]) {
        offset2 = line.substring(parsedhead[i].to + offset, 1e4).indexOf(" ");
      } else {
        offset2 = 1e4;
      }
    }
    checkColumn(0);
    const pid = parseInt(line.substring(parsedhead[0].from + offset, parsedhead[0].to + offset2));
    checkColumn(1);
    const ppid = parseInt(line.substring(parsedhead[1].from + offset, parsedhead[1].to + offset2));
    checkColumn(2);
    const cpu2 = parseFloat(line.substring(parsedhead[2].from + offset, parsedhead[2].to + offset2).replace(/,/g, "."));
    checkColumn(3);
    const mem2 = parseFloat(line.substring(parsedhead[3].from + offset, parsedhead[3].to + offset2).replace(/,/g, "."));
    checkColumn(4);
    const priority = parseInt(line.substring(parsedhead[4].from + offset, parsedhead[4].to + offset2));
    checkColumn(5);
    const vsz = parseInt(line.substring(parsedhead[5].from + offset, parsedhead[5].to + offset2));
    checkColumn(6);
    const rss = parseInt(line.substring(parsedhead[6].from + offset, parsedhead[6].to + offset2));
    checkColumn(7);
    const nice = parseInt(line.substring(parsedhead[7].from + offset, parsedhead[7].to + offset2)) || 0;
    checkColumn(8);
    const started = !_sunos$6 ? parseElapsedTime(line.substring(parsedhead[8].from + offset, parsedhead[8].to + offset2).trim()) : parseTimeUnix(line.substring(parsedhead[8].from + offset, parsedhead[8].to + offset2).trim());
    checkColumn(9);
    let state = line.substring(parsedhead[9].from + offset, parsedhead[9].to + offset2).trim();
    state = state[0] === "R" ? "running" : state[0] === "S" ? "sleeping" : state[0] === "T" ? "stopped" : state[0] === "W" ? "paging" : state[0] === "X" ? "dead" : state[0] === "Z" ? "zombie" : state[0] === "D" || state[0] === "U" ? "blocked" : "unknown";
    checkColumn(10);
    let tty = line.substring(parsedhead[10].from + offset, parsedhead[10].to + offset2).trim();
    if (tty === "?" || tty === "??") {
      tty = "";
    }
    checkColumn(11);
    const user = line.substring(parsedhead[11].from + offset, parsedhead[11].to + offset2).trim();
    checkColumn(12);
    let cmdPath = "";
    let command = "";
    let params = "";
    let fullcommand = line.substring(parsedhead[12].from + offset, parsedhead[12].to + offset2).trim();
    if (fullcommand.substr(fullcommand.length - 1) === "]") {
      fullcommand = fullcommand.slice(0, -1);
    }
    if (fullcommand.substr(0, 1) === "[") {
      command = fullcommand.substring(1);
    } else {
      const p1 = fullcommand.indexOf("(");
      const p2 = fullcommand.indexOf(")");
      const p3 = fullcommand.indexOf("/");
      const p4 = fullcommand.indexOf(":");
      if (p1 < p2 && p1 < p3 && p3 < p2) {
        command = fullcommand.split(" ")[0];
        command = command.replace(/:/g, "");
      } else {
        if (p4 > 0 && (p3 === -1 || p3 > 3)) {
          command = fullcommand.split(" ")[0];
          command = command.replace(/:/g, "");
        } else {
          let firstParamPos = fullcommand.indexOf(" -");
          let firstParamPathPos = fullcommand.indexOf(" /");
          firstParamPos = firstParamPos >= 0 ? firstParamPos : 1e4;
          firstParamPathPos = firstParamPathPos >= 0 ? firstParamPathPos : 1e4;
          const firstPos = Math.min(firstParamPos, firstParamPathPos);
          let tmpCommand = fullcommand.substr(0, firstPos);
          const tmpParams = fullcommand.substr(firstPos);
          const lastSlashPos = tmpCommand.lastIndexOf("/");
          if (lastSlashPos >= 0) {
            cmdPath = tmpCommand.substr(0, lastSlashPos);
            tmpCommand = tmpCommand.substr(lastSlashPos + 1);
          }
          if (firstPos === 1e4 && tmpCommand.indexOf(" ") > -1) {
            const parts = tmpCommand.split(" ");
            if (fs$3.existsSync(path$1.join(cmdPath, parts[0]))) {
              command = parts.shift();
              params = (parts.join(" ") + " " + tmpParams).trim();
            } else {
              command = tmpCommand.trim();
              params = tmpParams.trim();
            }
          } else {
            command = tmpCommand.trim();
            params = tmpParams.trim();
          }
        }
      }
    }
    return {
      pid,
      parentPid: ppid,
      name: _linux$6 ? getName(command) : command,
      cpu: cpu2,
      cpuu: 0,
      cpus: 0,
      mem: mem2,
      priority,
      memVsz: vsz,
      memRss: rss,
      nice,
      started,
      state,
      tty,
      user,
      command,
      params,
      path: cmdPath
    };
  }
  function parseProcesses(lines) {
    let result = [];
    if (lines.length > 1) {
      let head = lines[0];
      parsedhead = util$8.parseHead(head, 8);
      lines.shift();
      lines.forEach(function(line) {
        if (line.trim() !== "") {
          result.push(parseLine(line));
        }
      });
    }
    return result;
  }
  function parseProcesses2(lines) {
    function formatDateTime(time2) {
      const month = ("0" + (time2.getMonth() + 1).toString()).slice(-2);
      const year = time2.getFullYear().toString();
      const day = ("0" + time2.getDate().toString()).slice(-2);
      const hours = ("0" + time2.getHours().toString()).slice(-2);
      const mins = ("0" + time2.getMinutes().toString()).slice(-2);
      const secs = ("0" + time2.getSeconds().toString()).slice(-2);
      return year + "-" + month + "-" + day + " " + hours + ":" + mins + ":" + secs;
    }
    function parseElapsed(etime) {
      let started = "";
      if (etime.indexOf("d") >= 0) {
        const elapsed_parts = etime.split("d");
        started = formatDateTime(new Date(Date.now() - (elapsed_parts[0] * 24 + elapsed_parts[1] * 1) * 60 * 60 * 1e3));
      } else if (etime.indexOf("h") >= 0) {
        const elapsed_parts = etime.split("h");
        started = formatDateTime(new Date(Date.now() - (elapsed_parts[0] * 60 + elapsed_parts[1] * 1) * 60 * 1e3));
      } else if (etime.indexOf(":") >= 0) {
        const elapsed_parts = etime.split(":");
        started = formatDateTime(new Date(Date.now() - (elapsed_parts.length > 1 ? (elapsed_parts[0] * 60 + elapsed_parts[1]) * 1e3 : elapsed_parts[0] * 1e3)));
      }
      return started;
    }
    let result = [];
    lines.forEach(function(line) {
      if (line.trim() !== "") {
        line = line.trim().replace(/ +/g, " ").replace(/,+/g, ".");
        const parts = line.split(" ");
        const command = parts.slice(9).join(" ");
        const pmem = parseFloat((1 * parseInt(parts[3]) * 1024 / os$1.totalmem()).toFixed(1));
        const started = parseElapsed(parts[5]);
        result.push({
          pid: parseInt(parts[0]),
          parentPid: parseInt(parts[1]),
          name: getName(command),
          cpu: 0,
          cpuu: 0,
          cpus: 0,
          mem: pmem,
          priority: 0,
          memVsz: parseInt(parts[2]),
          memRss: parseInt(parts[3]),
          nice: parseInt(parts[4]),
          started,
          state: parts[6] === "R" ? "running" : parts[6] === "S" ? "sleeping" : parts[6] === "T" ? "stopped" : parts[6] === "W" ? "paging" : parts[6] === "X" ? "dead" : parts[6] === "Z" ? "zombie" : parts[6] === "D" || parts[6] === "U" ? "blocked" : "unknown",
          tty: parts[7],
          user: parts[8],
          command
        });
      }
    });
    return result;
  }
  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = {
        all: 0,
        running: 0,
        blocked: 0,
        sleeping: 0,
        unknown: 0,
        list: []
      };
      let cmd = "";
      if (_processes_cpu.ms && Date.now() - _processes_cpu.ms >= 500 || _processes_cpu.ms === 0) {
        if (_linux$6 || _freebsd$6 || _openbsd$6 || _netbsd$6 || _darwin$6 || _sunos$6) {
          if (_linux$6) {
            cmd = "export LC_ALL=C; ps -axo pid:11,ppid:11,pcpu:6,pmem:6,pri:5,vsz:11,rss:11,ni:5,etime:30,state:5,tty:15,user:20,command; unset LC_ALL";
          }
          if (_freebsd$6 || _openbsd$6 || _netbsd$6) {
            cmd = "export LC_ALL=C; ps -axo pid,ppid,pcpu,pmem,pri,vsz,rss,ni,etime,state,tty,user,command; unset LC_ALL";
          }
          if (_darwin$6) {
            cmd = "ps -axo pid,ppid,pcpu,pmem,pri,vsz=temp_title_1,rss=temp_title_2,nice,etime=temp_title_3,state,tty,user,command -r";
          }
          if (_sunos$6) {
            cmd = "ps -Ao pid,ppid,pcpu,pmem,pri,vsz,rss,nice,stime,s,tty,user,comm";
          }
          exec$6(cmd, { maxBuffer: 1024 * 2e4 }, function(error, stdout) {
            if (!error && stdout.toString().trim()) {
              result.list = parseProcesses(stdout.toString().split("\n")).slice();
              result.all = result.list.length;
              result.running = result.list.filter(function(e) {
                return e.state === "running";
              }).length;
              result.blocked = result.list.filter(function(e) {
                return e.state === "blocked";
              }).length;
              result.sleeping = result.list.filter(function(e) {
                return e.state === "sleeping";
              }).length;
              if (_linux$6) {
                cmd = 'cat /proc/stat | grep "cpu "';
                result.list.forEach((element) => {
                  cmd += ";cat /proc/" + element.pid + "/stat";
                });
                exec$6(cmd, { maxBuffer: 1024 * 2e4 }, function(error2, stdout2) {
                  let curr_processes = stdout2.toString().split("\n");
                  let all = parseProcStat(curr_processes.shift());
                  let list_new = {};
                  let resultProcess = {};
                  curr_processes.forEach((element) => {
                    resultProcess = calcProcStatLinux(element, all, _processes_cpu);
                    if (resultProcess.pid) {
                      let listPos = result.list.map(function(e) {
                        return e.pid;
                      }).indexOf(resultProcess.pid);
                      if (listPos >= 0) {
                        result.list[listPos].cpu = resultProcess.cpuu + resultProcess.cpus;
                        result.list[listPos].cpuu = resultProcess.cpuu;
                        result.list[listPos].cpus = resultProcess.cpus;
                      }
                      list_new[resultProcess.pid] = {
                        cpuu: resultProcess.cpuu,
                        cpus: resultProcess.cpus,
                        utime: resultProcess.utime,
                        stime: resultProcess.stime,
                        cutime: resultProcess.cutime,
                        cstime: resultProcess.cstime
                      };
                    }
                  });
                  _processes_cpu.all = all;
                  _processes_cpu.list = Object.assign({}, list_new);
                  _processes_cpu.ms = Date.now() - _processes_cpu.ms;
                  _processes_cpu.result = Object.assign({}, result);
                  if (callback) {
                    callback(result);
                  }
                  resolve(result);
                });
              } else {
                if (callback) {
                  callback(result);
                }
                resolve(result);
              }
            } else {
              cmd = "ps -o pid,ppid,vsz,rss,nice,etime,stat,tty,user,comm";
              if (_sunos$6) {
                cmd = "ps -o pid,ppid,vsz,rss,nice,etime,s,tty,user,comm";
              }
              exec$6(cmd, { maxBuffer: 1024 * 2e4 }, function(error2, stdout2) {
                if (!error2) {
                  let lines = stdout2.toString().split("\n");
                  lines.shift();
                  result.list = parseProcesses2(lines).slice();
                  result.all = result.list.length;
                  result.running = result.list.filter(function(e) {
                    return e.state === "running";
                  }).length;
                  result.blocked = result.list.filter(function(e) {
                    return e.state === "blocked";
                  }).length;
                  result.sleeping = result.list.filter(function(e) {
                    return e.state === "sleeping";
                  }).length;
                  if (callback) {
                    callback(result);
                  }
                  resolve(result);
                } else {
                  if (callback) {
                    callback(result);
                  }
                  resolve(result);
                }
              });
            }
          });
        } else if (_windows$7) {
          try {
            util$8.powerShell('Get-CimInstance Win32_Process | select-Object ProcessId,ParentProcessId,ExecutionState,Caption,CommandLine,ExecutablePath,UserModeTime,KernelModeTime,WorkingSetSize,Priority,PageFileUsage, @{n="CreationDate";e={$_.CreationDate.ToString("yyyy-MM-dd HH:mm:ss")}} | fl').then((stdout, error) => {
              if (!error) {
                let processSections = stdout.split(/\n\s*\n/);
                let procs = [];
                let procStats = [];
                let list_new = {};
                let allcpuu = 0;
                let allcpus = 0;
                processSections.forEach((element) => {
                  if (element.trim() !== "") {
                    let lines = element.trim().split("\r\n");
                    let pid = parseInt(util$8.getValue(lines, "ProcessId", ":", true), 10);
                    let parentPid = parseInt(util$8.getValue(lines, "ParentProcessId", ":", true), 10);
                    let statusValue = util$8.getValue(lines, "ExecutionState", ":");
                    let name2 = util$8.getValue(lines, "Caption", ":", true);
                    let commandLine = util$8.getValue(lines, "CommandLine", ":", true);
                    let additionalCommand = false;
                    lines.forEach((line) => {
                      if (additionalCommand && line.toLowerCase().startsWith(" ")) {
                        commandLine += " " + line.trim();
                      } else {
                        additionalCommand = false;
                      }
                      if (line.toLowerCase().startsWith("commandline")) {
                        additionalCommand = true;
                      }
                    });
                    let commandPath = util$8.getValue(lines, "ExecutablePath", ":", true);
                    let utime = parseInt(util$8.getValue(lines, "UserModeTime", ":", true), 10);
                    let stime = parseInt(util$8.getValue(lines, "KernelModeTime", ":", true), 10);
                    let memw = parseInt(util$8.getValue(lines, "WorkingSetSize", ":", true), 10);
                    allcpuu = allcpuu + utime;
                    allcpus = allcpus + stime;
                    result.all++;
                    if (!statusValue) {
                      result.unknown++;
                    }
                    if (statusValue === "3") {
                      result.running++;
                    }
                    if (statusValue === "4" || statusValue === "5") {
                      result.blocked++;
                    }
                    procStats.push({
                      pid,
                      utime,
                      stime,
                      cpu: 0,
                      cpuu: 0,
                      cpus: 0
                    });
                    procs.push({
                      pid,
                      parentPid,
                      name: name2,
                      cpu: 0,
                      cpuu: 0,
                      cpus: 0,
                      mem: memw / os$1.totalmem() * 100,
                      priority: parseInt(util$8.getValue(lines, "Priority", ":", true), 10),
                      memVsz: parseInt(util$8.getValue(lines, "PageFileUsage", ":", true), 10),
                      memRss: Math.floor(parseInt(util$8.getValue(lines, "WorkingSetSize", ":", true), 10) / 1024),
                      nice: 0,
                      started: util$8.getValue(lines, "CreationDate", ":", true),
                      state: !statusValue ? _winStatusValues[0] : _winStatusValues[statusValue],
                      tty: "",
                      user: "",
                      command: commandLine || name2,
                      path: commandPath,
                      params: ""
                    });
                  }
                });
                result.sleeping = result.all - result.running - result.blocked - result.unknown;
                result.list = procs;
                procStats.forEach((element) => {
                  let resultProcess = calcProcStatWin(element, allcpuu + allcpus, _processes_cpu);
                  let listPos = result.list.map(function(e) {
                    return e.pid;
                  }).indexOf(resultProcess.pid);
                  if (listPos >= 0) {
                    result.list[listPos].cpu = resultProcess.cpuu + resultProcess.cpus;
                    result.list[listPos].cpuu = resultProcess.cpuu;
                    result.list[listPos].cpus = resultProcess.cpus;
                  }
                  list_new[resultProcess.pid] = {
                    cpuu: resultProcess.cpuu,
                    cpus: resultProcess.cpus,
                    utime: resultProcess.utime,
                    stime: resultProcess.stime
                  };
                });
                _processes_cpu.all = allcpuu + allcpus;
                _processes_cpu.all_utime = allcpuu;
                _processes_cpu.all_stime = allcpus;
                _processes_cpu.list = Object.assign({}, list_new);
                _processes_cpu.ms = Date.now() - _processes_cpu.ms;
                _processes_cpu.result = Object.assign({}, result);
              }
              if (callback) {
                callback(result);
              }
              resolve(result);
            });
          } catch (e) {
            if (callback) {
              callback(result);
            }
            resolve(result);
          }
        } else {
          if (callback) {
            callback(result);
          }
          resolve(result);
        }
      } else {
        if (callback) {
          callback(_processes_cpu.result);
        }
        resolve(_processes_cpu.result);
      }
    });
  });
}
processes$1.processes = processes;
function processLoad(proc, callback) {
  if (util$8.isFunction(proc) && !callback) {
    callback = proc;
    proc = "";
  }
  return new Promise((resolve) => {
    process.nextTick(() => {
      proc = proc || "";
      if (typeof proc !== "string") {
        if (callback) {
          callback([]);
        }
        return resolve([]);
      }
      let processesString = "";
      processesString.__proto__.toLowerCase = util$8.stringToLower;
      processesString.__proto__.replace = util$8.stringReplace;
      processesString.__proto__.trim = util$8.stringTrim;
      const s = util$8.sanitizeShellString(proc);
      const l = util$8.mathMin(s.length, 2e3);
      for (let i = 0; i <= l; i++) {
        if (s[i] !== void 0) {
          processesString = processesString + s[i];
        }
      }
      processesString = processesString.trim().toLowerCase().replace(/, /g, "|").replace(/,+/g, "|");
      if (processesString === "") {
        processesString = "*";
      }
      if (util$8.isPrototypePolluted() && processesString !== "*") {
        processesString = "------";
      }
      let processes2 = processesString.split("|");
      let result = [];
      const procSanitized = util$8.isPrototypePolluted() ? "" : util$8.sanitizeShellString(proc);
      if (procSanitized && processes2.length && processes2[0] !== "------") {
        if (_windows$7) {
          try {
            util$8.powerShell("Get-CimInstance Win32_Process | select ProcessId,Caption,UserModeTime,KernelModeTime,WorkingSetSize | fl").then((stdout, error) => {
              if (!error) {
                let processSections = stdout.split(/\n\s*\n/);
                let procStats = [];
                let list_new = {};
                let allcpuu = 0;
                let allcpus = 0;
                processSections.forEach((element) => {
                  if (element.trim() !== "") {
                    let lines = element.trim().split("\r\n");
                    let pid = parseInt(util$8.getValue(lines, "ProcessId", ":", true), 10);
                    let name2 = util$8.getValue(lines, "Caption", ":", true);
                    let utime = parseInt(util$8.getValue(lines, "UserModeTime", ":", true), 10);
                    let stime = parseInt(util$8.getValue(lines, "KernelModeTime", ":", true), 10);
                    let mem2 = parseInt(util$8.getValue(lines, "WorkingSetSize", ":", true), 10);
                    allcpuu = allcpuu + utime;
                    allcpus = allcpus + stime;
                    procStats.push({
                      pid,
                      name: name2,
                      utime,
                      stime,
                      cpu: 0,
                      cpuu: 0,
                      cpus: 0,
                      mem: mem2
                    });
                    let pname = "";
                    let inList = false;
                    processes2.forEach(function(proc2) {
                      if (name2.toLowerCase().indexOf(proc2.toLowerCase()) >= 0 && !inList) {
                        inList = true;
                        pname = proc2;
                      }
                    });
                    if (processesString === "*" || inList) {
                      let processFound = false;
                      result.forEach(function(item) {
                        if (item.proc.toLowerCase() === pname.toLowerCase()) {
                          item.pids.push(pid);
                          item.mem += mem2 / os$1.totalmem() * 100;
                          processFound = true;
                        }
                      });
                      if (!processFound) {
                        result.push({
                          proc: pname,
                          pid,
                          pids: [pid],
                          cpu: 0,
                          mem: mem2 / os$1.totalmem() * 100
                        });
                      }
                    }
                  }
                });
                if (processesString !== "*") {
                  let processesMissing = processes2.filter(function(name2) {
                    return procStats.filter(function(item) {
                      return item.name.toLowerCase().indexOf(name2) >= 0;
                    }).length === 0;
                  });
                  processesMissing.forEach(function(procName) {
                    result.push({
                      proc: procName,
                      pid: null,
                      pids: [],
                      cpu: 0,
                      mem: 0
                    });
                  });
                }
                procStats.forEach((element) => {
                  let resultProcess = calcProcStatWin(element, allcpuu + allcpus, _process_cpu);
                  let listPos = -1;
                  for (let j = 0; j < result.length; j++) {
                    if (result[j].pid === resultProcess.pid || result[j].pids.indexOf(resultProcess.pid) >= 0) {
                      listPos = j;
                    }
                  }
                  if (listPos >= 0) {
                    result[listPos].cpu += resultProcess.cpuu + resultProcess.cpus;
                  }
                  list_new[resultProcess.pid] = {
                    cpuu: resultProcess.cpuu,
                    cpus: resultProcess.cpus,
                    utime: resultProcess.utime,
                    stime: resultProcess.stime
                  };
                });
                _process_cpu.all = allcpuu + allcpus;
                _process_cpu.all_utime = allcpuu;
                _process_cpu.all_stime = allcpus;
                _process_cpu.list = Object.assign({}, list_new);
                _process_cpu.ms = Date.now() - _process_cpu.ms;
                _process_cpu.result = JSON.parse(JSON.stringify(result));
                if (callback) {
                  callback(result);
                }
                resolve(result);
              }
            });
          } catch (e) {
            if (callback) {
              callback(result);
            }
            resolve(result);
          }
        }
        if (_darwin$6 || _linux$6 || _freebsd$6 || _openbsd$6 || _netbsd$6) {
          const params = ["-axo", "pid,ppid,pcpu,pmem,comm"];
          util$8.execSafe("ps", params).then((stdout) => {
            if (stdout) {
              let procStats = [];
              let lines = stdout.toString().split("\n").filter(function(line) {
                if (processesString === "*") {
                  return true;
                }
                if (line.toLowerCase().indexOf("grep") !== -1) {
                  return false;
                }
                let found = false;
                processes2.forEach(function(item) {
                  found = found || line.toLowerCase().indexOf(item.toLowerCase()) >= 0;
                });
                return found;
              });
              lines.forEach(function(line) {
                let data = line.trim().replace(/ +/g, " ").split(" ");
                if (data.length > 4) {
                  procStats.push({
                    name: data[4].substring(data[4].lastIndexOf("/") + 1),
                    pid: parseInt(data[0]) || 0,
                    ppid: parseInt(data[1]) || 0,
                    cpu: parseFloat(data[2].replace(",", ".")),
                    mem: parseFloat(data[3].replace(",", "."))
                  });
                }
              });
              procStats.forEach(function(item) {
                let listPos = -1;
                let inList = false;
                let name2 = "";
                for (let j = 0; j < result.length; j++) {
                  if (item.name.toLowerCase().indexOf(result[j].proc.toLowerCase()) >= 0) {
                    listPos = j;
                  }
                }
                processes2.forEach(function(proc2) {
                  if (item.name.toLowerCase().indexOf(proc2.toLowerCase()) >= 0 && !inList) {
                    inList = true;
                    name2 = proc2;
                  }
                });
                if (processesString === "*" || inList) {
                  if (listPos < 0) {
                    result.push({
                      proc: name2,
                      pid: item.pid,
                      pids: [item.pid],
                      cpu: item.cpu,
                      mem: item.mem
                    });
                  } else {
                    if (item.ppid < 10) {
                      result[listPos].pid = item.pid;
                    }
                    result[listPos].pids.push(item.pid);
                    result[listPos].cpu += item.cpu;
                    result[listPos].mem += item.mem;
                  }
                }
              });
              if (processesString !== "*") {
                let processesMissing = processes2.filter(function(name2) {
                  return procStats.filter(function(item) {
                    return item.name.toLowerCase().indexOf(name2) >= 0;
                  }).length === 0;
                });
                processesMissing.forEach(function(procName) {
                  result.push({
                    proc: procName,
                    pid: null,
                    pids: [],
                    cpu: 0,
                    mem: 0
                  });
                });
              }
              if (_linux$6) {
                result.forEach(function(item) {
                  item.cpu = 0;
                });
                let cmd = 'cat /proc/stat | grep "cpu "';
                for (let i in result) {
                  for (let j in result[i].pids) {
                    cmd += ";cat /proc/" + result[i].pids[j] + "/stat";
                  }
                }
                exec$6(cmd, { maxBuffer: 1024 * 2e4 }, function(error, stdout2) {
                  let curr_processes = stdout2.toString().split("\n");
                  let all = parseProcStat(curr_processes.shift());
                  let list_new = {};
                  let resultProcess = {};
                  curr_processes.forEach((element) => {
                    resultProcess = calcProcStatLinux(element, all, _process_cpu);
                    if (resultProcess.pid) {
                      let resultItemId = -1;
                      for (let i in result) {
                        if (result[i].pids.indexOf(resultProcess.pid) >= 0) {
                          resultItemId = i;
                        }
                      }
                      if (resultItemId >= 0) {
                        result[resultItemId].cpu += resultProcess.cpuu + resultProcess.cpus;
                      }
                      list_new[resultProcess.pid] = {
                        cpuu: resultProcess.cpuu,
                        cpus: resultProcess.cpus,
                        utime: resultProcess.utime,
                        stime: resultProcess.stime,
                        cutime: resultProcess.cutime,
                        cstime: resultProcess.cstime
                      };
                    }
                  });
                  result.forEach(function(item) {
                    item.cpu = Math.round(item.cpu * 100) / 100;
                  });
                  _process_cpu.all = all;
                  _process_cpu.list = Object.assign({}, list_new);
                  _process_cpu.ms = Date.now() - _process_cpu.ms;
                  _process_cpu.result = Object.assign({}, result);
                  if (callback) {
                    callback(result);
                  }
                  resolve(result);
                });
              } else {
                if (callback) {
                  callback(result);
                }
                resolve(result);
              }
            } else {
              if (callback) {
                callback(result);
              }
              resolve(result);
            }
          });
        }
      }
    });
  });
}
processes$1.processLoad = processLoad;
var users$1 = {};
const exec$5 = require$$1.exec;
const util$7 = util$j;
let _platform$6 = process.platform;
const _linux$5 = _platform$6 === "linux" || _platform$6 === "android";
const _darwin$5 = _platform$6 === "darwin";
const _windows$6 = _platform$6 === "win32";
const _freebsd$5 = _platform$6 === "freebsd";
const _openbsd$5 = _platform$6 === "openbsd";
const _netbsd$5 = _platform$6 === "netbsd";
const _sunos$5 = _platform$6 === "sunos";
function parseUsersLinux(lines, phase) {
  let result = [];
  let result_who = [];
  let result_w = {};
  let w_first = true;
  let w_header = [];
  let w_pos = [];
  let who_line = {};
  let is_whopart = true;
  lines.forEach(function(line) {
    if (line === "---") {
      is_whopart = false;
    } else {
      let l = line.replace(/ +/g, " ").split(" ");
      if (is_whopart) {
        result_who.push({
          user: l[0],
          tty: l[1],
          date: l[2],
          time: l[3],
          ip: l && l.length > 4 ? l[4].replace(/\(/g, "").replace(/\)/g, "") : ""
        });
      } else {
        if (w_first) {
          w_header = l;
          w_header.forEach(function(item) {
            w_pos.push(line.indexOf(item));
          });
          w_first = false;
        } else {
          result_w.user = line.substring(w_pos[0], w_pos[1] - 1).trim();
          result_w.tty = line.substring(w_pos[1], w_pos[2] - 1).trim();
          result_w.ip = line.substring(w_pos[2], w_pos[3] - 1).replace(/\(/g, "").replace(/\)/g, "").trim();
          result_w.command = line.substring(w_pos[7], 1e3).trim();
          who_line = result_who.filter(function(obj) {
            return obj.user.substring(0, 8).trim() === result_w.user && obj.tty === result_w.tty;
          });
          if (who_line.length === 1) {
            result.push({
              user: who_line[0].user,
              tty: who_line[0].tty,
              date: who_line[0].date,
              time: who_line[0].time,
              ip: who_line[0].ip,
              command: result_w.command
            });
          }
        }
      }
    }
  });
  if (result.length === 0 && phase === 2) {
    return result_who;
  } else {
    return result;
  }
}
function parseUsersDarwin(lines) {
  let result = [];
  let result_who = [];
  let result_w = {};
  let who_line = {};
  let is_whopart = true;
  lines.forEach(function(line) {
    if (line === "---") {
      is_whopart = false;
    } else {
      let l = line.replace(/ +/g, " ").split(" ");
      if (is_whopart) {
        result_who.push({
          user: l[0],
          tty: l[1],
          date: "" + (/* @__PURE__ */ new Date()).getFullYear() + "-" + ("0" + ("JANFEBMARAPRMAYJUNJULAUGSEPOCTNOVDEC".indexOf(l[2].toUpperCase()) / 3 + 1)).slice(-2) + "-" + ("0" + l[3]).slice(-2),
          time: l[4]
        });
      } else {
        result_w.user = l[0];
        result_w.tty = l[1];
        result_w.ip = l[2] !== "-" ? l[2] : "";
        result_w.command = l.slice(5, 1e3).join(" ");
        who_line = result_who.filter(function(obj) {
          return obj.user === result_w.user && (obj.tty.substring(3, 1e3) === result_w.tty || obj.tty === result_w.tty);
        });
        if (who_line.length === 1) {
          result.push({
            user: who_line[0].user,
            tty: who_line[0].tty,
            date: who_line[0].date,
            time: who_line[0].time,
            ip: result_w.ip,
            command: result_w.command
          });
        }
      }
    }
  });
  return result;
}
function users(callback) {
  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = [];
      if (_linux$5) {
        exec$5('who --ips; echo "---"; w | tail -n +2', function(error, stdout) {
          if (!error) {
            let lines = stdout.toString().split("\n");
            result = parseUsersLinux(lines, 1);
            if (result.length === 0) {
              exec$5('who; echo "---"; w | tail -n +2', function(error2, stdout2) {
                if (!error2) {
                  lines = stdout2.toString().split("\n");
                  result = parseUsersLinux(lines, 2);
                }
                if (callback) {
                  callback(result);
                }
                resolve(result);
              });
            } else {
              if (callback) {
                callback(result);
              }
              resolve(result);
            }
          } else {
            if (callback) {
              callback(result);
            }
            resolve(result);
          }
        });
      }
      if (_freebsd$5 || _openbsd$5 || _netbsd$5) {
        exec$5('who; echo "---"; w -ih', function(error, stdout) {
          if (!error) {
            let lines = stdout.toString().split("\n");
            result = parseUsersDarwin(lines);
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_sunos$5) {
        exec$5('who; echo "---"; w -h', function(error, stdout) {
          if (!error) {
            let lines = stdout.toString().split("\n");
            result = parseUsersDarwin(lines);
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_darwin$5) {
        exec$5('who; echo "---"; w -ih', function(error, stdout) {
          if (!error) {
            let lines = stdout.toString().split("\n");
            result = parseUsersDarwin(lines);
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_windows$6) {
        try {
          let cmd = `Get-CimInstance Win32_LogonSession | select LogonId,@{n="StartTime";e={$_.StartTime.ToString("yyyy-MM-dd HH:mm:ss")}} | fl; echo '#-#-#-#';`;
          cmd += "Get-CimInstance Win32_LoggedOnUser | select antecedent,dependent | fl ; echo '#-#-#-#';";
          cmd += `$process = (Get-CimInstance Win32_Process -Filter "name = 'explorer.exe'"); Invoke-CimMethod -InputObject $process[0] -MethodName GetOwner | select user, domain | fl; get-process -name explorer | select-object sessionid | fl; echo '#-#-#-#';`;
          cmd += "query user";
          util$7.powerShell(cmd).then((data) => {
            if (data) {
              data = data.split("#-#-#-#");
              let sessions = parseWinSessions((data[0] || "").split(/\n\s*\n/));
              let loggedons = parseWinLoggedOn((data[1] || "").split(/\n\s*\n/));
              let queryUser = parseWinUsersQuery((data[3] || "").split("\r\n"));
              let users2 = parseWinUsers((data[2] || "").split(/\n\s*\n/), queryUser);
              for (let id in loggedons) {
                if ({}.hasOwnProperty.call(loggedons, id)) {
                  loggedons[id].dateTime = {}.hasOwnProperty.call(sessions, id) ? sessions[id] : "";
                }
              }
              users2.forEach((user) => {
                let dateTime = "";
                for (let id in loggedons) {
                  if ({}.hasOwnProperty.call(loggedons, id)) {
                    if (loggedons[id].user === user.user && (!dateTime || dateTime < loggedons[id].dateTime)) {
                      dateTime = loggedons[id].dateTime;
                    }
                  }
                }
                result.push({
                  user: user.user,
                  tty: user.tty,
                  date: `${dateTime.substring(0, 10)}`,
                  time: `${dateTime.substring(11, 19)}`,
                  ip: "",
                  command: ""
                });
              });
            }
            if (callback) {
              callback(result);
            }
            resolve(result);
          });
        } catch (e) {
          if (callback) {
            callback(result);
          }
          resolve(result);
        }
      }
    });
  });
}
function parseWinSessions(sessionParts) {
  const sessions = {};
  sessionParts.forEach((session) => {
    const lines = session.split("\r\n");
    const id = util$7.getValue(lines, "LogonId");
    const starttime = util$7.getValue(lines, "starttime");
    if (id) {
      sessions[id] = starttime;
    }
  });
  return sessions;
}
function fuzzyMatch(name1, name2) {
  name1 = name1.toLowerCase();
  name2 = name2.toLowerCase();
  let eq = 0;
  let len = name1.length;
  if (name2.length > len) {
    len = name2.length;
  }
  for (let i = 0; i < len; i++) {
    const c1 = name1[i] || "";
    const c2 = name2[i] || "";
    if (c1 === c2) {
      eq++;
    }
  }
  return len > 10 ? eq / len > 0.9 : len > 0 ? eq / len > 0.8 : false;
}
function parseWinUsers(userParts, userQuery) {
  const users2 = [];
  userParts.forEach((user) => {
    const lines = user.split("\r\n");
    const domain = util$7.getValue(lines, "domain", ":", true);
    const username = util$7.getValue(lines, "user", ":", true);
    const sessionid = util$7.getValue(lines, "sessionid", ":", true);
    if (username) {
      const quser = userQuery.filter((item) => fuzzyMatch(item.user, username));
      users2.push({
        domain,
        user: username,
        tty: quser && quser[0] && quser[0].tty ? quser[0].tty : sessionid
      });
    }
  });
  return users2;
}
function parseWinLoggedOn(loggedonParts) {
  const loggedons = {};
  loggedonParts.forEach((loggedon) => {
    const lines = loggedon.split("\r\n");
    const antecendent = util$7.getValue(lines, "antecedent", ":", true);
    let parts = antecendent.split("=");
    const name2 = parts.length > 2 ? parts[1].split(",")[0].replace(/"/g, "").trim() : "";
    const domain = parts.length > 2 ? parts[2].replace(/"/g, "").replace(/\)/g, "").trim() : "";
    const dependent = util$7.getValue(lines, "dependent", ":", true);
    parts = dependent.split("=");
    const id = parts.length > 1 ? parts[1].replace(/"/g, "").replace(/\)/g, "").trim() : "";
    if (id) {
      loggedons[id] = {
        domain,
        user: name2
      };
    }
  });
  return loggedons;
}
function parseWinUsersQuery(lines) {
  lines = lines.filter((item) => item);
  let result = [];
  const header = lines[0];
  const headerDelimiter = [];
  if (header) {
    const start = header[0] === " " ? 1 : 0;
    headerDelimiter.push(start - 1);
    let nextSpace = 0;
    for (let i = start + 1; i < header.length; i++) {
      if (header[i] === " " && (header[i - 1] === " " || header[i - 1] === ".")) {
        nextSpace = i;
      } else {
        if (nextSpace) {
          headerDelimiter.push(nextSpace);
          nextSpace = 0;
        }
      }
    }
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const user = lines[i].substring(headerDelimiter[0] + 1, headerDelimiter[1]).trim() || "";
        const tty = lines[i].substring(headerDelimiter[1] + 1, headerDelimiter[2] - 2).trim() || "";
        result.push({
          user,
          tty
        });
      }
    }
  }
  return result;
}
users$1.users = users;
var internet = {};
const util$6 = util$j;
let _platform$5 = process.platform;
const _linux$4 = _platform$5 === "linux" || _platform$5 === "android";
const _darwin$4 = _platform$5 === "darwin";
const _windows$5 = _platform$5 === "win32";
const _freebsd$4 = _platform$5 === "freebsd";
const _openbsd$4 = _platform$5 === "openbsd";
const _netbsd$4 = _platform$5 === "netbsd";
const _sunos$4 = _platform$5 === "sunos";
function inetChecksite(url, callback) {
  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = {
        url,
        ok: false,
        status: 404,
        ms: null
      };
      if (typeof url !== "string") {
        if (callback) {
          callback(result);
        }
        return resolve(result);
      }
      let urlSanitized = "";
      const s = util$6.sanitizeShellString(url, true);
      const l = util$6.mathMin(s.length, 2e3);
      for (let i = 0; i <= l; i++) {
        if (s[i] !== void 0) {
          s[i].__proto__.toLowerCase = util$6.stringToLower;
          const sl = s[i].toLowerCase();
          if (sl && sl[0] && !sl[1] && sl[0].length === 1) {
            urlSanitized = urlSanitized + sl[0];
          }
        }
      }
      result.url = urlSanitized;
      try {
        if (urlSanitized && !util$6.isPrototypePolluted()) {
          urlSanitized.__proto__.startsWith = util$6.stringStartWith;
          if (urlSanitized.startsWith("file:") || urlSanitized.startsWith("gopher:") || urlSanitized.startsWith("telnet:") || urlSanitized.startsWith("mailto:") || urlSanitized.startsWith("news:") || urlSanitized.startsWith("nntp:")) {
            if (callback) {
              callback(result);
            }
            return resolve(result);
          }
          let t = Date.now();
          if (_linux$4 || _freebsd$4 || _openbsd$4 || _netbsd$4 || _darwin$4 || _sunos$4) {
            let args = ["-I", "--connect-timeout", "5", "-m", "5"];
            args.push(urlSanitized);
            let cmd = "curl";
            util$6.execSafe(cmd, args).then((stdout) => {
              const lines = stdout.split("\n");
              let statusCode = lines[0] && lines[0].indexOf(" ") >= 0 ? parseInt(lines[0].split(" ")[1], 10) : 404;
              result.status = statusCode || 404;
              result.ok = statusCode === 200 || statusCode === 301 || statusCode === 302 || statusCode === 304;
              result.ms = result.ok ? Date.now() - t : null;
              if (callback) {
                callback(result);
              }
              resolve(result);
            });
          }
          if (_windows$5) {
            const http = urlSanitized.startsWith("https:") ? require("https") : require("http");
            try {
              http.get(urlSanitized, (res) => {
                const statusCode = res.statusCode;
                result.status = statusCode || 404;
                result.ok = statusCode === 200 || statusCode === 301 || statusCode === 302 || statusCode === 304;
                if (statusCode !== 200) {
                  res.resume();
                  result.ms = result.ok ? Date.now() - t : null;
                  if (callback) {
                    callback(result);
                  }
                  resolve(result);
                } else {
                  res.on("data", () => {
                  });
                  res.on("end", () => {
                    result.ms = result.ok ? Date.now() - t : null;
                    if (callback) {
                      callback(result);
                    }
                    resolve(result);
                  });
                }
              }).on("error", () => {
                if (callback) {
                  callback(result);
                }
                resolve(result);
              });
            } catch (err) {
              if (callback) {
                callback(result);
              }
              resolve(result);
            }
          }
        } else {
          if (callback) {
            callback(result);
          }
          resolve(result);
        }
      } catch (err) {
        if (callback) {
          callback(result);
        }
        resolve(result);
      }
    });
  });
}
internet.inetChecksite = inetChecksite;
function inetLatency(host, callback) {
  if (util$6.isFunction(host) && !callback) {
    callback = host;
    host = "";
  }
  host = host || "8.8.8.8";
  return new Promise((resolve) => {
    process.nextTick(() => {
      if (typeof host !== "string") {
        if (callback) {
          callback(null);
        }
        return resolve(null);
      }
      let hostSanitized = "";
      const s = (util$6.isPrototypePolluted() ? "8.8.8.8" : util$6.sanitizeShellString(host, true)).trim();
      const l = util$6.mathMin(s.length, 2e3);
      for (let i = 0; i <= l; i++) {
        if (!(s[i] === void 0)) {
          s[i].__proto__.toLowerCase = util$6.stringToLower;
          const sl = s[i].toLowerCase();
          if (sl && sl[0] && !sl[1]) {
            hostSanitized = hostSanitized + sl[0];
          }
        }
      }
      hostSanitized.__proto__.startsWith = util$6.stringStartWith;
      if (hostSanitized.startsWith("file:") || hostSanitized.startsWith("gopher:") || hostSanitized.startsWith("telnet:") || hostSanitized.startsWith("mailto:") || hostSanitized.startsWith("news:") || hostSanitized.startsWith("nntp:")) {
        if (callback) {
          callback(null);
        }
        return resolve(null);
      }
      let params;
      if (_linux$4 || _freebsd$4 || _openbsd$4 || _netbsd$4 || _darwin$4) {
        if (_linux$4) {
          params = ["-c", "2", "-w", "3", hostSanitized];
        }
        if (_freebsd$4 || _openbsd$4 || _netbsd$4) {
          params = ["-c", "2", "-t", "3", hostSanitized];
        }
        if (_darwin$4) {
          params = ["-c2", "-t3", hostSanitized];
        }
        util$6.execSafe("ping", params).then((stdout) => {
          let result = null;
          if (stdout) {
            const lines = stdout.split("\n").filter((line2) => line2.indexOf("rtt") >= 0 || line2.indexOf("round-trip") >= 0 || line2.indexOf("avg") >= 0).join("\n");
            const line = lines.split("=");
            if (line.length > 1) {
              const parts = line[1].split("/");
              if (parts.length > 1) {
                result = parseFloat(parts[1]);
              }
            }
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_sunos$4) {
        const params2 = ["-s", "-a", hostSanitized, "56", "2"];
        const filt = "avg";
        util$6.execSafe("ping", params2, { timeout: 3e3 }).then((stdout) => {
          let result = null;
          if (stdout) {
            const lines = stdout.split("\n").filter((line2) => line2.indexOf(filt) >= 0).join("\n");
            const line = lines.split("=");
            if (line.length > 1) {
              const parts = line[1].split("/");
              if (parts.length > 1) {
                result = parseFloat(parts[1].replace(",", "."));
              }
            }
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_windows$5) {
        let result = null;
        try {
          const params2 = [hostSanitized, "-n", "1"];
          util$6.execSafe("ping", params2, util$6.execOptsWin).then((stdout) => {
            if (stdout) {
              let lines = stdout.split("\r\n");
              lines.shift();
              lines.forEach(function(line) {
                if ((line.toLowerCase().match(/ms/g) || []).length === 3) {
                  let l2 = line.replace(/ +/g, " ").split(" ");
                  if (l2.length > 6) {
                    result = parseFloat(l2[l2.length - 1]);
                  }
                }
              });
            }
            if (callback) {
              callback(result);
            }
            resolve(result);
          });
        } catch (e) {
          if (callback) {
            callback(result);
          }
          resolve(result);
        }
      }
    });
  });
}
internet.inetLatency = inetLatency;
var docker = {};
const net = require$$0$2;
const isWin = require$$0$1.type() === "Windows_NT";
const socketPath = isWin ? "//./pipe/docker_engine" : "/var/run/docker.sock";
let DockerSocket$1 = class DockerSocket {
  getInfo(callback) {
    try {
      let socket = net.createConnection({ path: socketPath });
      let alldata = "";
      let data;
      socket.on("connect", () => {
        socket.write("GET http:/info HTTP/1.0\r\n\r\n");
      });
      socket.on("data", (data2) => {
        alldata = alldata + data2.toString();
      });
      socket.on("error", () => {
        socket = false;
        callback({});
      });
      socket.on("end", () => {
        let startbody = alldata.indexOf("\r\n\r\n");
        alldata = alldata.substring(startbody + 4);
        socket = false;
        try {
          data = JSON.parse(alldata);
          callback(data);
        } catch (err) {
          callback({});
        }
      });
    } catch (err) {
      callback({});
    }
  }
  listImages(all, callback) {
    try {
      let socket = net.createConnection({ path: socketPath });
      let alldata = "";
      let data;
      socket.on("connect", () => {
        socket.write("GET http:/images/json" + (all ? "?all=1" : "") + " HTTP/1.0\r\n\r\n");
      });
      socket.on("data", (data2) => {
        alldata = alldata + data2.toString();
      });
      socket.on("error", () => {
        socket = false;
        callback({});
      });
      socket.on("end", () => {
        let startbody = alldata.indexOf("\r\n\r\n");
        alldata = alldata.substring(startbody + 4);
        socket = false;
        try {
          data = JSON.parse(alldata);
          callback(data);
        } catch (err) {
          callback({});
        }
      });
    } catch (err) {
      callback({});
    }
  }
  inspectImage(id, callback) {
    id = id || "";
    if (id) {
      try {
        let socket = net.createConnection({ path: socketPath });
        let alldata = "";
        let data;
        socket.on("connect", () => {
          socket.write("GET http:/images/" + id + "/json?stream=0 HTTP/1.0\r\n\r\n");
        });
        socket.on("data", (data2) => {
          alldata = alldata + data2.toString();
        });
        socket.on("error", () => {
          socket = false;
          callback({});
        });
        socket.on("end", () => {
          let startbody = alldata.indexOf("\r\n\r\n");
          alldata = alldata.substring(startbody + 4);
          socket = false;
          try {
            data = JSON.parse(alldata);
            callback(data);
          } catch (err) {
            callback({});
          }
        });
      } catch (err) {
        callback({});
      }
    } else {
      callback({});
    }
  }
  listContainers(all, callback) {
    try {
      let socket = net.createConnection({ path: socketPath });
      let alldata = "";
      let data;
      socket.on("connect", () => {
        socket.write("GET http:/containers/json" + (all ? "?all=1" : "") + " HTTP/1.0\r\n\r\n");
      });
      socket.on("data", (data2) => {
        alldata = alldata + data2.toString();
      });
      socket.on("error", () => {
        socket = false;
        callback({});
      });
      socket.on("end", () => {
        let startbody = alldata.indexOf("\r\n\r\n");
        alldata = alldata.substring(startbody + 4);
        socket = false;
        try {
          data = JSON.parse(alldata);
          callback(data);
        } catch (err) {
          callback({});
        }
      });
    } catch (err) {
      callback({});
    }
  }
  getStats(id, callback) {
    id = id || "";
    if (id) {
      try {
        let socket = net.createConnection({ path: socketPath });
        let alldata = "";
        let data;
        socket.on("connect", () => {
          socket.write("GET http:/containers/" + id + "/stats?stream=0 HTTP/1.0\r\n\r\n");
        });
        socket.on("data", (data2) => {
          alldata = alldata + data2.toString();
        });
        socket.on("error", () => {
          socket = false;
          callback({});
        });
        socket.on("end", () => {
          let startbody = alldata.indexOf("\r\n\r\n");
          alldata = alldata.substring(startbody + 4);
          socket = false;
          try {
            data = JSON.parse(alldata);
            callback(data);
          } catch (err) {
            callback({});
          }
        });
      } catch (err) {
        callback({});
      }
    } else {
      callback({});
    }
  }
  getInspect(id, callback) {
    id = id || "";
    if (id) {
      try {
        let socket = net.createConnection({ path: socketPath });
        let alldata = "";
        let data;
        socket.on("connect", () => {
          socket.write("GET http:/containers/" + id + "/json?stream=0 HTTP/1.0\r\n\r\n");
        });
        socket.on("data", (data2) => {
          alldata = alldata + data2.toString();
        });
        socket.on("error", () => {
          socket = false;
          callback({});
        });
        socket.on("end", () => {
          let startbody = alldata.indexOf("\r\n\r\n");
          alldata = alldata.substring(startbody + 4);
          socket = false;
          try {
            data = JSON.parse(alldata);
            callback(data);
          } catch (err) {
            callback({});
          }
        });
      } catch (err) {
        callback({});
      }
    } else {
      callback({});
    }
  }
  getProcesses(id, callback) {
    id = id || "";
    if (id) {
      try {
        let socket = net.createConnection({ path: socketPath });
        let alldata = "";
        let data;
        socket.on("connect", () => {
          socket.write("GET http:/containers/" + id + "/top?ps_args=-opid,ppid,pgid,vsz,time,etime,nice,ruser,user,rgroup,group,stat,rss,args HTTP/1.0\r\n\r\n");
        });
        socket.on("data", (data2) => {
          alldata = alldata + data2.toString();
        });
        socket.on("error", () => {
          socket = false;
          callback({});
        });
        socket.on("end", () => {
          let startbody = alldata.indexOf("\r\n\r\n");
          alldata = alldata.substring(startbody + 4);
          socket = false;
          try {
            data = JSON.parse(alldata);
            callback(data);
          } catch (err) {
            callback({});
          }
        });
      } catch (err) {
        callback({});
      }
    } else {
      callback({});
    }
  }
  listVolumes(callback) {
    try {
      let socket = net.createConnection({ path: socketPath });
      let alldata = "";
      let data;
      socket.on("connect", () => {
        socket.write("GET http:/volumes HTTP/1.0\r\n\r\n");
      });
      socket.on("data", (data2) => {
        alldata = alldata + data2.toString();
      });
      socket.on("error", () => {
        socket = false;
        callback({});
      });
      socket.on("end", () => {
        let startbody = alldata.indexOf("\r\n\r\n");
        alldata = alldata.substring(startbody + 4);
        socket = false;
        try {
          data = JSON.parse(alldata);
          callback(data);
        } catch (err) {
          callback({});
        }
      });
    } catch (err) {
      callback({});
    }
  }
};
var dockerSocket = DockerSocket$1;
const util$5 = util$j;
const DockerSocket2 = dockerSocket;
let _platform$4 = process.platform;
const _windows$4 = _platform$4 === "win32";
let _docker_container_stats = {};
let _docker_socket;
let _docker_last_read = 0;
function dockerInfo(callback) {
  return new Promise((resolve) => {
    process.nextTick(() => {
      if (!_docker_socket) {
        _docker_socket = new DockerSocket2();
      }
      const result = {};
      _docker_socket.getInfo((data) => {
        result.id = data.ID;
        result.containers = data.Containers;
        result.containersRunning = data.ContainersRunning;
        result.containersPaused = data.ContainersPaused;
        result.containersStopped = data.ContainersStopped;
        result.images = data.Images;
        result.driver = data.Driver;
        result.memoryLimit = data.MemoryLimit;
        result.swapLimit = data.SwapLimit;
        result.kernelMemory = data.KernelMemory;
        result.cpuCfsPeriod = data.CpuCfsPeriod;
        result.cpuCfsQuota = data.CpuCfsQuota;
        result.cpuShares = data.CPUShares;
        result.cpuSet = data.CPUSet;
        result.ipv4Forwarding = data.IPv4Forwarding;
        result.bridgeNfIptables = data.BridgeNfIptables;
        result.bridgeNfIp6tables = data.BridgeNfIp6tables;
        result.debug = data.Debug;
        result.nfd = data.NFd;
        result.oomKillDisable = data.OomKillDisable;
        result.ngoroutines = data.NGoroutines;
        result.systemTime = data.SystemTime;
        result.loggingDriver = data.LoggingDriver;
        result.cgroupDriver = data.CgroupDriver;
        result.nEventsListener = data.NEventsListener;
        result.kernelVersion = data.KernelVersion;
        result.operatingSystem = data.OperatingSystem;
        result.osType = data.OSType;
        result.architecture = data.Architecture;
        result.ncpu = data.NCPU;
        result.memTotal = data.MemTotal;
        result.dockerRootDir = data.DockerRootDir;
        result.httpProxy = data.HttpProxy;
        result.httpsProxy = data.HttpsProxy;
        result.noProxy = data.NoProxy;
        result.name = data.Name;
        result.labels = data.Labels;
        result.experimentalBuild = data.ExperimentalBuild;
        result.serverVersion = data.ServerVersion;
        result.clusterStore = data.ClusterStore;
        result.clusterAdvertise = data.ClusterAdvertise;
        result.defaultRuntime = data.DefaultRuntime;
        result.liveRestoreEnabled = data.LiveRestoreEnabled;
        result.isolation = data.Isolation;
        result.initBinary = data.InitBinary;
        result.productLicense = data.ProductLicense;
        if (callback) {
          callback(result);
        }
        resolve(result);
      });
    });
  });
}
docker.dockerInfo = dockerInfo;
function dockerImages(all, callback) {
  if (util$5.isFunction(all) && !callback) {
    callback = all;
    all = false;
  }
  if (typeof all === "string" && all === "true") {
    all = true;
  }
  if (typeof all !== "boolean" && all !== void 0) {
    all = false;
  }
  all = all || false;
  let result = [];
  return new Promise((resolve) => {
    process.nextTick(() => {
      if (!_docker_socket) {
        _docker_socket = new DockerSocket2();
      }
      const workload = [];
      _docker_socket.listImages(all, (data) => {
        let dockerImages2 = {};
        try {
          dockerImages2 = data;
          if (dockerImages2 && Object.prototype.toString.call(dockerImages2) === "[object Array]" && dockerImages2.length > 0) {
            dockerImages2.forEach(function(element) {
              if (element.Names && Object.prototype.toString.call(element.Names) === "[object Array]" && element.Names.length > 0) {
                element.Name = element.Names[0].replace(/^\/|\/$/g, "");
              }
              workload.push(dockerImagesInspect(element.Id.trim(), element));
            });
            if (workload.length) {
              Promise.all(
                workload
              ).then((data2) => {
                if (callback) {
                  callback(data2);
                }
                resolve(data2);
              });
            } else {
              if (callback) {
                callback(result);
              }
              resolve(result);
            }
          } else {
            if (callback) {
              callback(result);
            }
            resolve(result);
          }
        } catch (err) {
          if (callback) {
            callback(result);
          }
          resolve(result);
        }
      });
    });
  });
}
function dockerImagesInspect(imageID, payload) {
  return new Promise((resolve) => {
    process.nextTick(() => {
      imageID = imageID || "";
      if (typeof imageID !== "string") {
        return resolve();
      }
      const imageIDSanitized = (util$5.isPrototypePolluted() ? "" : util$5.sanitizeShellString(imageID, true)).trim();
      if (imageIDSanitized) {
        if (!_docker_socket) {
          _docker_socket = new DockerSocket2();
        }
        _docker_socket.inspectImage(imageIDSanitized.trim(), (data) => {
          try {
            resolve({
              id: payload.Id,
              container: data.Container,
              comment: data.Comment,
              os: data.Os,
              architecture: data.Architecture,
              parent: data.Parent,
              dockerVersion: data.DockerVersion,
              size: data.Size,
              sharedSize: payload.SharedSize,
              virtualSize: data.VirtualSize,
              author: data.Author,
              created: data.Created ? Math.round(new Date(data.Created).getTime() / 1e3) : 0,
              containerConfig: data.ContainerConfig ? data.ContainerConfig : {},
              graphDriver: data.GraphDriver ? data.GraphDriver : {},
              repoDigests: data.RepoDigests ? data.RepoDigests : {},
              repoTags: data.RepoTags ? data.RepoTags : {},
              config: data.Config ? data.Config : {},
              rootFS: data.RootFS ? data.RootFS : {}
            });
          } catch (err) {
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  });
}
docker.dockerImages = dockerImages;
function dockerContainers(all, callback) {
  function inContainers(containers, id) {
    let filtered = containers.filter((obj) => {
      return obj.Id && obj.Id === id;
    });
    return filtered.length > 0;
  }
  if (util$5.isFunction(all) && !callback) {
    callback = all;
    all = false;
  }
  if (typeof all === "string" && all === "true") {
    all = true;
  }
  if (typeof all !== "boolean" && all !== void 0) {
    all = false;
  }
  all = all || false;
  let result = [];
  return new Promise((resolve) => {
    process.nextTick(() => {
      if (!_docker_socket) {
        _docker_socket = new DockerSocket2();
      }
      const workload = [];
      _docker_socket.listContainers(all, (data) => {
        let docker_containers = {};
        try {
          docker_containers = data;
          if (docker_containers && Object.prototype.toString.call(docker_containers) === "[object Array]" && docker_containers.length > 0) {
            for (let key in _docker_container_stats) {
              if ({}.hasOwnProperty.call(_docker_container_stats, key)) {
                if (!inContainers(docker_containers, key)) {
                  delete _docker_container_stats[key];
                }
              }
            }
            docker_containers.forEach(function(element) {
              if (element.Names && Object.prototype.toString.call(element.Names) === "[object Array]" && element.Names.length > 0) {
                element.Name = element.Names[0].replace(/^\/|\/$/g, "");
              }
              workload.push(dockerContainerInspect(element.Id.trim(), element));
            });
            if (workload.length) {
              Promise.all(
                workload
              ).then((data2) => {
                if (callback) {
                  callback(data2);
                }
                resolve(data2);
              });
            } else {
              if (callback) {
                callback(result);
              }
              resolve(result);
            }
          } else {
            if (callback) {
              callback(result);
            }
            resolve(result);
          }
        } catch (err) {
          for (let key in _docker_container_stats) {
            if ({}.hasOwnProperty.call(_docker_container_stats, key)) {
              if (!inContainers(docker_containers, key)) {
                delete _docker_container_stats[key];
              }
            }
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        }
      });
    });
  });
}
function dockerContainerInspect(containerID, payload) {
  return new Promise((resolve) => {
    process.nextTick(() => {
      containerID = containerID || "";
      if (typeof containerID !== "string") {
        return resolve();
      }
      const containerIdSanitized = (util$5.isPrototypePolluted() ? "" : util$5.sanitizeShellString(containerID, true)).trim();
      if (containerIdSanitized) {
        if (!_docker_socket) {
          _docker_socket = new DockerSocket2();
        }
        _docker_socket.getInspect(containerIdSanitized.trim(), (data) => {
          try {
            resolve({
              id: payload.Id,
              name: payload.Name,
              image: payload.Image,
              imageID: payload.ImageID,
              command: payload.Command,
              created: payload.Created,
              started: data.State && data.State.StartedAt ? Math.round(new Date(data.State.StartedAt).getTime() / 1e3) : 0,
              finished: data.State && data.State.FinishedAt && !data.State.FinishedAt.startsWith("0001-01-01") ? Math.round(new Date(data.State.FinishedAt).getTime() / 1e3) : 0,
              createdAt: data.Created ? data.Created : "",
              startedAt: data.State && data.State.StartedAt ? data.State.StartedAt : "",
              finishedAt: data.State && data.State.FinishedAt && !data.State.FinishedAt.startsWith("0001-01-01") ? data.State.FinishedAt : "",
              state: payload.State,
              restartCount: data.RestartCount || 0,
              platform: data.Platform || "",
              driver: data.Driver || "",
              ports: payload.Ports,
              mounts: payload.Mounts
              // hostconfig: payload.HostConfig,
              // network: payload.NetworkSettings
            });
          } catch (err) {
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  });
}
docker.dockerContainers = dockerContainers;
function docker_calcCPUPercent(cpu_stats, precpu_stats) {
  if (!_windows$4) {
    let cpuPercent = 0;
    let cpuDelta = cpu_stats.cpu_usage.total_usage - precpu_stats.cpu_usage.total_usage;
    let systemDelta = cpu_stats.system_cpu_usage - precpu_stats.system_cpu_usage;
    if (systemDelta > 0 && cpuDelta > 0) {
      if (precpu_stats.online_cpus) {
        cpuPercent = cpuDelta / systemDelta * precpu_stats.online_cpus * 100;
      } else {
        cpuPercent = cpuDelta / systemDelta * cpu_stats.cpu_usage.percpu_usage.length * 100;
      }
    }
    return cpuPercent;
  } else {
    let nanoSecNow = util$5.nanoSeconds();
    let cpuPercent = 0;
    if (_docker_last_read > 0) {
      let possIntervals = nanoSecNow - _docker_last_read;
      let intervalsUsed = cpu_stats.cpu_usage.total_usage - precpu_stats.cpu_usage.total_usage;
      if (possIntervals > 0) {
        cpuPercent = 100 * intervalsUsed / possIntervals;
      }
    }
    _docker_last_read = nanoSecNow;
    return cpuPercent;
  }
}
function docker_calcNetworkIO(networks) {
  let rx;
  let wx;
  for (let key in networks) {
    if (!{}.hasOwnProperty.call(networks, key)) {
      continue;
    }
    let obj = networks[key];
    rx = +obj.rx_bytes;
    wx = +obj.tx_bytes;
  }
  return {
    rx,
    wx
  };
}
function docker_calcBlockIO(blkio_stats) {
  let result = {
    r: 0,
    w: 0
  };
  if (blkio_stats && blkio_stats.io_service_bytes_recursive && Object.prototype.toString.call(blkio_stats.io_service_bytes_recursive) === "[object Array]" && blkio_stats.io_service_bytes_recursive.length > 0) {
    blkio_stats.io_service_bytes_recursive.forEach(function(element) {
      if (element.op && element.op.toLowerCase() === "read" && element.value) {
        result.r += element.value;
      }
      if (element.op && element.op.toLowerCase() === "write" && element.value) {
        result.w += element.value;
      }
    });
  }
  return result;
}
function dockerContainerStats(containerIDs, callback) {
  let containerArray = [];
  return new Promise((resolve) => {
    process.nextTick(() => {
      if (util$5.isFunction(containerIDs) && !callback) {
        callback = containerIDs;
        containerArray = ["*"];
      } else {
        containerIDs = containerIDs || "*";
        if (typeof containerIDs !== "string") {
          if (callback) {
            callback([]);
          }
          return resolve([]);
        }
        let containerIDsSanitized = "";
        containerIDsSanitized.__proto__.toLowerCase = util$5.stringToLower;
        containerIDsSanitized.__proto__.replace = util$5.stringReplace;
        containerIDsSanitized.__proto__.trim = util$5.stringTrim;
        containerIDsSanitized = containerIDs;
        containerIDsSanitized = containerIDsSanitized.trim();
        if (containerIDsSanitized !== "*") {
          containerIDsSanitized = "";
          const s = (util$5.isPrototypePolluted() ? "" : util$5.sanitizeShellString(containerIDs, true)).trim();
          const l = util$5.mathMin(s.length, 2e3);
          for (let i = 0; i <= l; i++) {
            if (s[i] !== void 0) {
              s[i].__proto__.toLowerCase = util$5.stringToLower;
              const sl = s[i].toLowerCase();
              if (sl && sl[0] && !sl[1]) {
                containerIDsSanitized = containerIDsSanitized + sl[0];
              }
            }
          }
        }
        containerIDsSanitized = containerIDsSanitized.trim().toLowerCase().replace(/,+/g, "|");
        containerArray = containerIDsSanitized.split("|");
      }
      const result = [];
      const workload = [];
      if (containerArray.length && containerArray[0].trim() === "*") {
        containerArray = [];
        dockerContainers().then((allContainers) => {
          for (let container of allContainers) {
            containerArray.push(container.id.substring(0, 12));
          }
          if (containerArray.length) {
            dockerContainerStats(containerArray.join(",")).then((result2) => {
              if (callback) {
                callback(result2);
              }
              resolve(result2);
            });
          } else {
            if (callback) {
              callback(result);
            }
            resolve(result);
          }
        });
      } else {
        for (let containerID of containerArray) {
          workload.push(dockerContainerStatsSingle(containerID.trim()));
        }
        if (workload.length) {
          Promise.all(
            workload
          ).then((data) => {
            if (callback) {
              callback(data);
            }
            resolve(data);
          });
        } else {
          if (callback) {
            callback(result);
          }
          resolve(result);
        }
      }
    });
  });
}
function dockerContainerStatsSingle(containerID) {
  containerID = containerID || "";
  let result = {
    id: containerID,
    memUsage: 0,
    memLimit: 0,
    memPercent: 0,
    cpuPercent: 0,
    pids: 0,
    netIO: {
      rx: 0,
      wx: 0
    },
    blockIO: {
      r: 0,
      w: 0
    },
    restartCount: 0,
    cpuStats: {},
    precpuStats: {},
    memoryStats: {},
    networks: {}
  };
  return new Promise((resolve) => {
    process.nextTick(() => {
      if (containerID) {
        if (!_docker_socket) {
          _docker_socket = new DockerSocket2();
        }
        _docker_socket.getInspect(containerID, (dataInspect) => {
          try {
            _docker_socket.getStats(containerID, (data) => {
              try {
                let stats = data;
                if (!stats.message) {
                  if (data.id) {
                    result.id = data.id;
                  }
                  result.memUsage = stats.memory_stats && stats.memory_stats.usage ? stats.memory_stats.usage : 0;
                  result.memLimit = stats.memory_stats && stats.memory_stats.limit ? stats.memory_stats.limit : 0;
                  result.memPercent = stats.memory_stats && stats.memory_stats.usage && stats.memory_stats.limit ? stats.memory_stats.usage / stats.memory_stats.limit * 100 : 0;
                  result.cpuPercent = stats.cpu_stats && stats.precpu_stats ? docker_calcCPUPercent(stats.cpu_stats, stats.precpu_stats) : 0;
                  result.pids = stats.pids_stats && stats.pids_stats.current ? stats.pids_stats.current : 0;
                  result.restartCount = dataInspect.RestartCount ? dataInspect.RestartCount : 0;
                  if (stats.networks) {
                    result.netIO = docker_calcNetworkIO(stats.networks);
                  }
                  if (stats.blkio_stats) {
                    result.blockIO = docker_calcBlockIO(stats.blkio_stats);
                  }
                  result.cpuStats = stats.cpu_stats ? stats.cpu_stats : {};
                  result.precpuStats = stats.precpu_stats ? stats.precpu_stats : {};
                  result.memoryStats = stats.memory_stats ? stats.memory_stats : {};
                  result.networks = stats.networks ? stats.networks : {};
                }
              } catch (err) {
                util$5.noop();
              }
              resolve(result);
            });
          } catch (err) {
            util$5.noop();
          }
        });
      } else {
        resolve(result);
      }
    });
  });
}
docker.dockerContainerStats = dockerContainerStats;
function dockerContainerProcesses(containerID, callback) {
  let result = [];
  return new Promise((resolve) => {
    process.nextTick(() => {
      containerID = containerID || "";
      if (typeof containerID !== "string") {
        return resolve(result);
      }
      const containerIdSanitized = (util$5.isPrototypePolluted() ? "" : util$5.sanitizeShellString(containerID, true)).trim();
      if (containerIdSanitized) {
        if (!_docker_socket) {
          _docker_socket = new DockerSocket2();
        }
        _docker_socket.getProcesses(containerIdSanitized, (data) => {
          try {
            if (data && data.Titles && data.Processes) {
              let titles = data.Titles.map(function(value) {
                return value.toUpperCase();
              });
              let pos_pid = titles.indexOf("PID");
              let pos_ppid = titles.indexOf("PPID");
              let pos_pgid = titles.indexOf("PGID");
              let pos_vsz = titles.indexOf("VSZ");
              let pos_time = titles.indexOf("TIME");
              let pos_elapsed = titles.indexOf("ELAPSED");
              let pos_ni = titles.indexOf("NI");
              let pos_ruser = titles.indexOf("RUSER");
              let pos_user = titles.indexOf("USER");
              let pos_rgroup = titles.indexOf("RGROUP");
              let pos_group = titles.indexOf("GROUP");
              let pos_stat = titles.indexOf("STAT");
              let pos_rss = titles.indexOf("RSS");
              let pos_command = titles.indexOf("COMMAND");
              data.Processes.forEach((process2) => {
                result.push({
                  pidHost: pos_pid >= 0 ? process2[pos_pid] : "",
                  ppid: pos_ppid >= 0 ? process2[pos_ppid] : "",
                  pgid: pos_pgid >= 0 ? process2[pos_pgid] : "",
                  user: pos_user >= 0 ? process2[pos_user] : "",
                  ruser: pos_ruser >= 0 ? process2[pos_ruser] : "",
                  group: pos_group >= 0 ? process2[pos_group] : "",
                  rgroup: pos_rgroup >= 0 ? process2[pos_rgroup] : "",
                  stat: pos_stat >= 0 ? process2[pos_stat] : "",
                  time: pos_time >= 0 ? process2[pos_time] : "",
                  elapsed: pos_elapsed >= 0 ? process2[pos_elapsed] : "",
                  nice: pos_ni >= 0 ? process2[pos_ni] : "",
                  rss: pos_rss >= 0 ? process2[pos_rss] : "",
                  vsz: pos_vsz >= 0 ? process2[pos_vsz] : "",
                  command: pos_command >= 0 ? process2[pos_command] : ""
                });
              });
            }
          } catch (err) {
            util$5.noop();
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      } else {
        if (callback) {
          callback(result);
        }
        resolve(result);
      }
    });
  });
}
docker.dockerContainerProcesses = dockerContainerProcesses;
function dockerVolumes(callback) {
  let result = [];
  return new Promise((resolve) => {
    process.nextTick(() => {
      if (!_docker_socket) {
        _docker_socket = new DockerSocket2();
      }
      _docker_socket.listVolumes((data) => {
        let dockerVolumes2 = {};
        try {
          dockerVolumes2 = data;
          if (dockerVolumes2 && dockerVolumes2.Volumes && Object.prototype.toString.call(dockerVolumes2.Volumes) === "[object Array]" && dockerVolumes2.Volumes.length > 0) {
            dockerVolumes2.Volumes.forEach(function(element) {
              result.push({
                name: element.Name,
                driver: element.Driver,
                labels: element.Labels,
                mountpoint: element.Mountpoint,
                options: element.Options,
                scope: element.Scope,
                created: element.CreatedAt ? Math.round(new Date(element.CreatedAt).getTime() / 1e3) : 0
              });
            });
            if (callback) {
              callback(result);
            }
            resolve(result);
          } else {
            if (callback) {
              callback(result);
            }
            resolve(result);
          }
        } catch (err) {
          if (callback) {
            callback(result);
          }
          resolve(result);
        }
      });
    });
  });
}
docker.dockerVolumes = dockerVolumes;
function dockerAll(callback) {
  return new Promise((resolve) => {
    process.nextTick(() => {
      dockerContainers(true).then((result) => {
        if (result && Object.prototype.toString.call(result) === "[object Array]" && result.length > 0) {
          let l = result.length;
          result.forEach(function(element) {
            dockerContainerStats(element.id).then((res) => {
              element.memUsage = res[0].memUsage;
              element.memLimit = res[0].memLimit;
              element.memPercent = res[0].memPercent;
              element.cpuPercent = res[0].cpuPercent;
              element.pids = res[0].pids;
              element.netIO = res[0].netIO;
              element.blockIO = res[0].blockIO;
              element.cpuStats = res[0].cpuStats;
              element.precpuStats = res[0].precpuStats;
              element.memoryStats = res[0].memoryStats;
              element.networks = res[0].networks;
              dockerContainerProcesses(element.id).then((processes2) => {
                element.processes = processes2;
                l -= 1;
                if (l === 0) {
                  if (callback) {
                    callback(result);
                  }
                  resolve(result);
                }
              });
            });
          });
        } else {
          if (callback) {
            callback(result);
          }
          resolve(result);
        }
      });
    });
  });
}
docker.dockerAll = dockerAll;
var virtualbox = {};
const os = require$$0$1;
const exec$4 = require$$1.exec;
const util$4 = util$j;
function vboxInfo(callback) {
  let result = [];
  return new Promise((resolve) => {
    process.nextTick(() => {
      try {
        exec$4(util$4.getVboxmanage() + " list vms --long", function(error, stdout) {
          let parts = (os.EOL + stdout.toString()).split(os.EOL + "Name:");
          parts.shift();
          parts.forEach((part) => {
            const lines = ("Name:" + part).split(os.EOL);
            const state = util$4.getValue(lines, "State");
            const running = state.startsWith("running");
            const runningSinceString = running ? state.replace("running (since ", "").replace(")", "").trim() : "";
            let runningSince = 0;
            try {
              if (running) {
                const sinceDateObj = new Date(runningSinceString);
                const offset = sinceDateObj.getTimezoneOffset();
                runningSince = Math.round((Date.now() - Date.parse(sinceDateObj)) / 1e3) + offset * 60;
              }
            } catch (e) {
              util$4.noop();
            }
            const stoppedSinceString = !running ? state.replace("powered off (since", "").replace(")", "").trim() : "";
            let stoppedSince = 0;
            try {
              if (!running) {
                const sinceDateObj = new Date(stoppedSinceString);
                const offset = sinceDateObj.getTimezoneOffset();
                stoppedSince = Math.round((Date.now() - Date.parse(sinceDateObj)) / 1e3) + offset * 60;
              }
            } catch (e) {
              util$4.noop();
            }
            result.push({
              id: util$4.getValue(lines, "UUID"),
              name: util$4.getValue(lines, "Name"),
              running,
              started: runningSinceString,
              runningSince,
              stopped: stoppedSinceString,
              stoppedSince,
              guestOS: util$4.getValue(lines, "Guest OS"),
              hardwareUUID: util$4.getValue(lines, "Hardware UUID"),
              memory: parseInt(util$4.getValue(lines, "Memory size", "     "), 10),
              vram: parseInt(util$4.getValue(lines, "VRAM size"), 10),
              cpus: parseInt(util$4.getValue(lines, "Number of CPUs"), 10),
              cpuExepCap: util$4.getValue(lines, "CPU exec cap"),
              cpuProfile: util$4.getValue(lines, "CPUProfile"),
              chipset: util$4.getValue(lines, "Chipset"),
              firmware: util$4.getValue(lines, "Firmware"),
              pageFusion: util$4.getValue(lines, "Page Fusion") === "enabled",
              configFile: util$4.getValue(lines, "Config file"),
              snapshotFolder: util$4.getValue(lines, "Snapshot folder"),
              logFolder: util$4.getValue(lines, "Log folder"),
              hpet: util$4.getValue(lines, "HPET") === "enabled",
              pae: util$4.getValue(lines, "PAE") === "enabled",
              longMode: util$4.getValue(lines, "Long Mode") === "enabled",
              tripleFaultReset: util$4.getValue(lines, "Triple Fault Reset") === "enabled",
              apic: util$4.getValue(lines, "APIC") === "enabled",
              x2Apic: util$4.getValue(lines, "X2APIC") === "enabled",
              acpi: util$4.getValue(lines, "ACPI") === "enabled",
              ioApic: util$4.getValue(lines, "IOAPIC") === "enabled",
              biosApicMode: util$4.getValue(lines, "BIOS APIC mode"),
              bootMenuMode: util$4.getValue(lines, "Boot menu mode"),
              bootDevice1: util$4.getValue(lines, "Boot Device 1"),
              bootDevice2: util$4.getValue(lines, "Boot Device 2"),
              bootDevice3: util$4.getValue(lines, "Boot Device 3"),
              bootDevice4: util$4.getValue(lines, "Boot Device 4"),
              timeOffset: util$4.getValue(lines, "Time offset"),
              rtc: util$4.getValue(lines, "RTC")
            });
          });
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      } catch (e) {
        if (callback) {
          callback(result);
        }
        resolve(result);
      }
    });
  });
}
virtualbox.vboxInfo = vboxInfo;
var printer$1 = {};
const exec$3 = require$$1.exec;
const util$3 = util$j;
let _platform$3 = process.platform;
const _linux$3 = _platform$3 === "linux" || _platform$3 === "android";
const _darwin$3 = _platform$3 === "darwin";
const _windows$3 = _platform$3 === "win32";
const _freebsd$3 = _platform$3 === "freebsd";
const _openbsd$3 = _platform$3 === "openbsd";
const _netbsd$3 = _platform$3 === "netbsd";
const _sunos$3 = _platform$3 === "sunos";
const winPrinterStatus = {
  1: "Other",
  2: "Unknown",
  3: "Idle",
  4: "Printing",
  5: "Warmup",
  6: "Stopped Printing",
  7: "Offline"
};
function parseLinuxCupsHeader(lines) {
  const result = {};
  if (lines && lines.length) {
    if (lines[0].indexOf(" CUPS v") > 0) {
      const parts = lines[0].split(" CUPS v");
      result.cupsVersion = parts[1];
    }
  }
  return result;
}
function parseLinuxCupsPrinter(lines) {
  const result = {};
  const printerId = util$3.getValue(lines, "PrinterId", " ");
  result.id = printerId ? parseInt(printerId, 10) : null;
  result.name = util$3.getValue(lines, "Info", " ");
  result.model = lines.length > 0 && lines[0] ? lines[0].split(" ")[0] : "";
  result.uri = util$3.getValue(lines, "DeviceURI", " ");
  result.uuid = util$3.getValue(lines, "UUID", " ");
  result.status = util$3.getValue(lines, "State", " ");
  result.local = util$3.getValue(lines, "Location", " ").toLowerCase().startsWith("local");
  result.default = null;
  result.shared = util$3.getValue(lines, "Shared", " ").toLowerCase().startsWith("yes");
  return result;
}
function parseLinuxLpstatPrinter(lines, id) {
  const result = {};
  result.id = id;
  result.name = util$3.getValue(lines, "Description", ":", true);
  result.model = lines.length > 0 && lines[0] ? lines[0].split(" ")[0] : "";
  result.uri = null;
  result.uuid = null;
  result.status = lines.length > 0 && lines[0] ? lines[0].indexOf(" idle") > 0 ? "idle" : lines[0].indexOf(" printing") > 0 ? "printing" : "unknown" : null;
  result.local = util$3.getValue(lines, "Location", ":", true).toLowerCase().startsWith("local");
  result.default = null;
  result.shared = util$3.getValue(lines, "Shared", " ").toLowerCase().startsWith("yes");
  return result;
}
function parseDarwinPrinters(printerObject, id) {
  const result = {};
  const uriParts = printerObject.uri.split("/");
  result.id = id;
  result.name = printerObject._name;
  result.model = uriParts.length ? uriParts[uriParts.length - 1] : "";
  result.uri = printerObject.uri;
  result.uuid = null;
  result.status = printerObject.status;
  result.local = printerObject.printserver === "local";
  result.default = printerObject.default === "yes";
  result.shared = printerObject.shared === "yes";
  return result;
}
function parseWindowsPrinters(lines, id) {
  const result = {};
  const status = parseInt(util$3.getValue(lines, "PrinterStatus", ":"), 10);
  result.id = id;
  result.name = util$3.getValue(lines, "name", ":");
  result.model = util$3.getValue(lines, "DriverName", ":");
  result.uri = null;
  result.uuid = null;
  result.status = winPrinterStatus[status] ? winPrinterStatus[status] : null;
  result.local = util$3.getValue(lines, "Local", ":").toUpperCase() === "TRUE";
  result.default = util$3.getValue(lines, "Default", ":").toUpperCase() === "TRUE";
  result.shared = util$3.getValue(lines, "Shared", ":").toUpperCase() === "TRUE";
  return result;
}
function printer(callback) {
  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = [];
      if (_linux$3 || _freebsd$3 || _openbsd$3 || _netbsd$3) {
        let cmd = "cat /etc/cups/printers.conf 2>/dev/null";
        exec$3(cmd, function(error, stdout) {
          if (!error) {
            const parts = stdout.toString().split("<Printer ");
            const printerHeader = parseLinuxCupsHeader(parts[0]);
            for (let i = 1; i < parts.length; i++) {
              const printers = parseLinuxCupsPrinter(parts[i].split("\n"));
              if (printers.name) {
                printers.engine = "CUPS";
                printers.engineVersion = printerHeader.cupsVersion;
                result.push(printers);
              }
            }
          }
          if (result.length === 0) {
            if (_linux$3) {
              cmd = "export LC_ALL=C; lpstat -lp 2>/dev/null; unset LC_ALL";
              exec$3(cmd, function(error2, stdout2) {
                const parts = ("\n" + stdout2.toString()).split("\nprinter ");
                for (let i = 1; i < parts.length; i++) {
                  const printers = parseLinuxLpstatPrinter(parts[i].split("\n"), i);
                  result.push(printers);
                }
              });
              if (callback) {
                callback(result);
              }
              resolve(result);
            } else {
              if (callback) {
                callback(result);
              }
              resolve(result);
            }
          } else {
            if (callback) {
              callback(result);
            }
            resolve(result);
          }
        });
      }
      if (_darwin$3) {
        let cmd = "system_profiler SPPrintersDataType -json";
        exec$3(cmd, function(error, stdout) {
          if (!error) {
            try {
              const outObj = JSON.parse(stdout.toString());
              if (outObj.SPPrintersDataType && outObj.SPPrintersDataType.length) {
                for (let i = 0; i < outObj.SPPrintersDataType.length; i++) {
                  const printer2 = parseDarwinPrinters(outObj.SPPrintersDataType[i], i);
                  result.push(printer2);
                }
              }
            } catch (e) {
              util$3.noop();
            }
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_windows$3) {
        util$3.powerShell("Get-CimInstance Win32_Printer | select PrinterStatus,Name,DriverName,Local,Default,Shared | fl").then((stdout, error) => {
          if (!error) {
            const parts = stdout.toString().split(/\n\s*\n/);
            for (let i = 0; i < parts.length; i++) {
              const printer2 = parseWindowsPrinters(parts[i].split("\n"), i);
              if (printer2.name || printer2.model) {
                result.push(printer2);
              }
            }
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_sunos$3) {
        resolve(null);
      }
    });
  });
}
printer$1.printer = printer;
var usb$1 = {};
const exec$2 = require$$1.exec;
const util$2 = util$j;
let _platform$2 = process.platform;
const _linux$2 = _platform$2 === "linux" || _platform$2 === "android";
const _darwin$2 = _platform$2 === "darwin";
const _windows$2 = _platform$2 === "win32";
const _freebsd$2 = _platform$2 === "freebsd";
const _openbsd$2 = _platform$2 === "openbsd";
const _netbsd$2 = _platform$2 === "netbsd";
const _sunos$2 = _platform$2 === "sunos";
function getLinuxUsbType(type, name2) {
  let result = type;
  const str = (name2 + " " + type).toLowerCase();
  if (str.indexOf("camera") >= 0) {
    result = "Camera";
  } else if (str.indexOf("hub") >= 0) {
    result = "Hub";
  } else if (str.indexOf("keybrd") >= 0) {
    result = "Keyboard";
  } else if (str.indexOf("keyboard") >= 0) {
    result = "Keyboard";
  } else if (str.indexOf("mouse") >= 0) {
    result = "Mouse";
  } else if (str.indexOf("stora") >= 0) {
    result = "Storage";
  } else if (str.indexOf("mic") >= 0) {
    result = "Microphone";
  } else if (str.indexOf("headset") >= 0) {
    result = "Audio";
  } else if (str.indexOf("audio") >= 0) {
    result = "Audio";
  }
  return result;
}
function parseLinuxUsb(usb2) {
  const result = {};
  const lines = usb2.split("\n");
  if (lines && lines.length && lines[0].indexOf("Device") >= 0) {
    const parts = lines[0].split(" ");
    result.bus = parseInt(parts[0], 10);
    if (parts[2]) {
      result.deviceId = parseInt(parts[2], 10);
    } else {
      result.deviceId = null;
    }
  } else {
    result.bus = null;
    result.deviceId = null;
  }
  const idVendor = util$2.getValue(lines, "idVendor", " ", true).trim();
  let vendorParts = idVendor.split(" ");
  vendorParts.shift();
  const vendor = vendorParts.join(" ");
  const idProduct = util$2.getValue(lines, "idProduct", " ", true).trim();
  let productParts = idProduct.split(" ");
  productParts.shift();
  const product = productParts.join(" ");
  const interfaceClass = util$2.getValue(lines, "bInterfaceClass", " ", true).trim();
  let interfaceClassParts = interfaceClass.split(" ");
  interfaceClassParts.shift();
  const usbType = interfaceClassParts.join(" ");
  const iManufacturer = util$2.getValue(lines, "iManufacturer", " ", true).trim();
  let iManufacturerParts = iManufacturer.split(" ");
  iManufacturerParts.shift();
  const manufacturer = iManufacturerParts.join(" ");
  result.id = (idVendor.startsWith("0x") ? idVendor.split(" ")[0].substr(2, 10) : "") + ":" + (idProduct.startsWith("0x") ? idProduct.split(" ")[0].substr(2, 10) : "");
  result.name = product;
  result.type = getLinuxUsbType(usbType, product);
  result.removable = null;
  result.vendor = vendor;
  result.manufacturer = manufacturer;
  result.maxPower = util$2.getValue(lines, "MaxPower", " ", true);
  result.serialNumber = null;
  return result;
}
function getDarwinUsbType(name2) {
  let result = "";
  if (name2.indexOf("camera") >= 0) {
    result = "Camera";
  } else if (name2.indexOf("touch bar") >= 0) {
    result = "Touch Bar";
  } else if (name2.indexOf("controller") >= 0) {
    result = "Controller";
  } else if (name2.indexOf("headset") >= 0) {
    result = "Audio";
  } else if (name2.indexOf("keyboard") >= 0) {
    result = "Keyboard";
  } else if (name2.indexOf("trackpad") >= 0) {
    result = "Trackpad";
  } else if (name2.indexOf("sensor") >= 0) {
    result = "Sensor";
  } else if (name2.indexOf("bthusb") >= 0) {
    result = "Bluetooth";
  } else if (name2.indexOf("bth") >= 0) {
    result = "Bluetooth";
  } else if (name2.indexOf("rfcomm") >= 0) {
    result = "Bluetooth";
  } else if (name2.indexOf("usbhub") >= 0) {
    result = "Hub";
  } else if (name2.indexOf(" hub") >= 0) {
    result = "Hub";
  } else if (name2.indexOf("mouse") >= 0) {
    result = "Mouse";
  } else if (name2.indexOf("mic") >= 0) {
    result = "Microphone";
  } else if (name2.indexOf("removable") >= 0) {
    result = "Storage";
  }
  return result;
}
function parseDarwinUsb(usb2, id) {
  const result = {};
  result.id = id;
  usb2 = usb2.replace(/ \|/g, "");
  usb2 = usb2.trim();
  let lines = usb2.split("\n");
  lines.shift();
  try {
    for (let i = 0; i < lines.length; i++) {
      lines[i] = lines[i].trim();
      lines[i] = lines[i].replace(/=/g, ":");
      if (lines[i] !== "{" && lines[i] !== "}" && lines[i + 1] && lines[i + 1].trim() !== "}") {
        lines[i] = lines[i] + ",";
      }
      lines[i] = lines[i].replace(":Yes,", ':"Yes",');
      lines[i] = lines[i].replace(": Yes,", ': "Yes",');
      lines[i] = lines[i].replace(": Yes", ': "Yes"');
      lines[i] = lines[i].replace(":No,", ':"No",');
      lines[i] = lines[i].replace(": No,", ': "No",');
      lines[i] = lines[i].replace(": No", ': "No"');
      lines[i] = lines[i].replace("((", "").replace("))", "");
      const match = /<(\w+)>/.exec(lines[i]);
      if (match) {
        const number = match[0];
        lines[i] = lines[i].replace(number, `"${number}"`);
      }
    }
    const usbObj = JSON.parse(lines.join("\n"));
    const removableDrive = (usbObj["Built-In"] ? usbObj["Built-In"].toLowerCase() !== "yes" : true) && (usbObj["non-removable"] ? usbObj["non-removable"].toLowerCase() === "no" : true);
    result.bus = null;
    result.deviceId = null;
    result.id = usbObj["USB Address"] || null;
    result.name = usbObj["kUSBProductString"] || usbObj["USB Product Name"] || null;
    result.type = getDarwinUsbType((usbObj["kUSBProductString"] || usbObj["USB Product Name"] || "").toLowerCase() + (removableDrive ? " removable" : ""));
    result.removable = usbObj["non-removable"] ? usbObj["non-removable"].toLowerCase() || false : true;
    result.vendor = usbObj["kUSBVendorString"] || usbObj["USB Vendor Name"] || null;
    result.manufacturer = usbObj["kUSBVendorString"] || usbObj["USB Vendor Name"] || null;
    result.maxPower = null;
    result.serialNumber = usbObj["kUSBSerialNumberString"] || null;
    if (result.name) {
      return result;
    } else {
      return null;
    }
  } catch (e) {
    return null;
  }
}
function getWindowsUsbTypeCreation(creationclass, name2) {
  let result = "";
  if (name2.indexOf("storage") >= 0) {
    result = "Storage";
  } else if (name2.indexOf("speicher") >= 0) {
    result = "Storage";
  } else if (creationclass.indexOf("usbhub") >= 0) {
    result = "Hub";
  } else if (creationclass.indexOf("storage") >= 0) {
    result = "Storage";
  } else if (creationclass.indexOf("usbcontroller") >= 0) {
    result = "Controller";
  } else if (creationclass.indexOf("keyboard") >= 0) {
    result = "Keyboard";
  } else if (creationclass.indexOf("pointing") >= 0) {
    result = "Mouse";
  } else if (creationclass.indexOf("disk") >= 0) {
    result = "Storage";
  }
  return result;
}
function parseWindowsUsb(lines, id) {
  const usbType = getWindowsUsbTypeCreation(util$2.getValue(lines, "CreationClassName", ":").toLowerCase(), util$2.getValue(lines, "name", ":").toLowerCase());
  if (usbType) {
    const result = {};
    result.bus = null;
    result.deviceId = util$2.getValue(lines, "deviceid", ":");
    result.id = id;
    result.name = util$2.getValue(lines, "name", ":");
    result.type = usbType;
    result.removable = null;
    result.vendor = null;
    result.manufacturer = util$2.getValue(lines, "Manufacturer", ":");
    result.maxPower = null;
    result.serialNumber = null;
    return result;
  } else {
    return null;
  }
}
function usb(callback) {
  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = [];
      if (_linux$2) {
        const cmd = "export LC_ALL=C; lsusb -v 2>/dev/null; unset LC_ALL";
        exec$2(cmd, { maxBuffer: 1024 * 1024 * 128 }, function(error, stdout) {
          if (!error) {
            const parts = ("\n\n" + stdout.toString()).split("\n\nBus ");
            for (let i = 1; i < parts.length; i++) {
              const usb2 = parseLinuxUsb(parts[i]);
              result.push(usb2);
            }
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_darwin$2) {
        let cmd = "ioreg -p IOUSB -c AppleUSBRootHubDevice -w0 -l";
        exec$2(cmd, { maxBuffer: 1024 * 1024 * 128 }, function(error, stdout) {
          if (!error) {
            const parts = stdout.toString().split(" +-o ");
            for (let i = 1; i < parts.length; i++) {
              const usb2 = parseDarwinUsb(parts[i]);
              if (usb2) {
                result.push(usb2);
              }
            }
            if (callback) {
              callback(result);
            }
            resolve(result);
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_windows$2) {
        util$2.powerShell('Get-CimInstance CIM_LogicalDevice | where { $_.Description -match "USB"} | select Name,CreationClassName,DeviceId,Manufacturer | fl').then((stdout, error) => {
          if (!error) {
            const parts = stdout.toString().split(/\n\s*\n/);
            for (let i = 0; i < parts.length; i++) {
              const usb2 = parseWindowsUsb(parts[i].split("\n"), i);
              if (usb2) {
                result.push(usb2);
              }
            }
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_sunos$2 || _freebsd$2 || _openbsd$2 || _netbsd$2) {
        resolve(null);
      }
    });
  });
}
usb$1.usb = usb;
var audio$1 = {};
const exec$1 = require$$1.exec;
const execSync$1 = require$$1.execSync;
const util$1 = util$j;
let _platform$1 = process.platform;
const _linux$1 = _platform$1 === "linux" || _platform$1 === "android";
const _darwin$1 = _platform$1 === "darwin";
const _windows$1 = _platform$1 === "win32";
const _freebsd$1 = _platform$1 === "freebsd";
const _openbsd$1 = _platform$1 === "openbsd";
const _netbsd$1 = _platform$1 === "netbsd";
const _sunos$1 = _platform$1 === "sunos";
function parseAudioType(str, input, output) {
  str = str.toLowerCase();
  let result = "";
  if (str.indexOf("input") >= 0) {
    result = "Microphone";
  }
  if (str.indexOf("display audio") >= 0) {
    result = "Speaker";
  }
  if (str.indexOf("speak") >= 0) {
    result = "Speaker";
  }
  if (str.indexOf("laut") >= 0) {
    result = "Speaker";
  }
  if (str.indexOf("loud") >= 0) {
    result = "Speaker";
  }
  if (str.indexOf("head") >= 0) {
    result = "Headset";
  }
  if (str.indexOf("mic") >= 0) {
    result = "Microphone";
  }
  if (str.indexOf("mikr") >= 0) {
    result = "Microphone";
  }
  if (str.indexOf("phone") >= 0) {
    result = "Phone";
  }
  if (str.indexOf("controll") >= 0) {
    result = "Controller";
  }
  if (str.indexOf("line o") >= 0) {
    result = "Line Out";
  }
  if (str.indexOf("digital o") >= 0) {
    result = "Digital Out";
  }
  if (str.indexOf("smart sound technology") >= 0) {
    result = "Digital Signal Processor";
  }
  if (str.indexOf("high definition audio") >= 0) {
    result = "Sound Driver";
  }
  if (!result && output) {
    result = "Speaker";
  } else if (!result && input) {
    result = "Microphone";
  }
  return result;
}
function getLinuxAudioPci() {
  let cmd = "lspci -v 2>/dev/null";
  let result = [];
  try {
    const parts = execSync$1(cmd).toString().split("\n\n");
    parts.forEach((element) => {
      const lines = element.split("\n");
      if (lines && lines.length && lines[0].toLowerCase().indexOf("audio") >= 0) {
        const audio2 = {};
        audio2.slotId = lines[0].split(" ")[0];
        audio2.driver = util$1.getValue(lines, "Kernel driver in use", ":", true) || util$1.getValue(lines, "Kernel modules", ":", true);
        result.push(audio2);
      }
    });
    return result;
  } catch (e) {
    return result;
  }
}
function parseLinuxAudioPciMM(lines, audioPCI) {
  const result = {};
  const slotId = util$1.getValue(lines, "Slot");
  const pciMatch = audioPCI.filter(function(item) {
    return item.slotId === slotId;
  });
  result.id = slotId;
  result.name = util$1.getValue(lines, "SDevice");
  result.manufacturer = util$1.getValue(lines, "SVendor");
  result.revision = util$1.getValue(lines, "Rev");
  result.driver = pciMatch && pciMatch.length === 1 && pciMatch[0].driver ? pciMatch[0].driver : "";
  result.default = null;
  result.channel = "PCIe";
  result.type = parseAudioType(result.name, null, null);
  result.in = null;
  result.out = null;
  result.status = "online";
  return result;
}
function parseDarwinChannel(str) {
  let result = "";
  if (str.indexOf("builtin") >= 0) {
    result = "Built-In";
  }
  if (str.indexOf("extern") >= 0) {
    result = "Audio-Jack";
  }
  if (str.indexOf("hdmi") >= 0) {
    result = "HDMI";
  }
  if (str.indexOf("displayport") >= 0) {
    result = "Display-Port";
  }
  if (str.indexOf("usb") >= 0) {
    result = "USB";
  }
  if (str.indexOf("pci") >= 0) {
    result = "PCIe";
  }
  return result;
}
function parseDarwinAudio(audioObject, id) {
  const result = {};
  const channelStr = ((audioObject.coreaudio_device_transport || "") + " " + (audioObject._name || "")).toLowerCase();
  result.id = id;
  result.name = audioObject._name;
  result.manufacturer = audioObject.coreaudio_device_manufacturer;
  result.revision = null;
  result.driver = null;
  result.default = !!(audioObject.coreaudio_default_audio_input_device || "") || !!(audioObject.coreaudio_default_audio_output_device || "");
  result.channel = parseDarwinChannel(channelStr);
  result.type = parseAudioType(result.name, !!(audioObject.coreaudio_device_input || ""), !!(audioObject.coreaudio_device_output || ""));
  result.in = !!(audioObject.coreaudio_device_input || "");
  result.out = !!(audioObject.coreaudio_device_output || "");
  result.status = "online";
  return result;
}
function parseWindowsAudio(lines) {
  const result = {};
  const status = util$1.getValue(lines, "StatusInfo", ":");
  result.id = util$1.getValue(lines, "DeviceID", ":");
  result.name = util$1.getValue(lines, "name", ":");
  result.manufacturer = util$1.getValue(lines, "manufacturer", ":");
  result.revision = null;
  result.driver = null;
  result.default = null;
  result.channel = null;
  result.type = parseAudioType(result.name, null, null);
  result.in = null;
  result.out = null;
  result.status = status;
  return result;
}
function audio(callback) {
  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = [];
      if (_linux$1 || _freebsd$1 || _openbsd$1 || _netbsd$1) {
        let cmd = "lspci -vmm 2>/dev/null";
        exec$1(cmd, function(error, stdout) {
          if (!error) {
            const audioPCI = getLinuxAudioPci();
            const parts = stdout.toString().split("\n\n");
            parts.forEach((element) => {
              const lines = element.split("\n");
              if (util$1.getValue(lines, "class", ":", true).toLowerCase().indexOf("audio") >= 0) {
                const audio2 = parseLinuxAudioPciMM(lines, audioPCI);
                result.push(audio2);
              }
            });
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_darwin$1) {
        let cmd = "system_profiler SPAudioDataType -json";
        exec$1(cmd, function(error, stdout) {
          if (!error) {
            try {
              const outObj = JSON.parse(stdout.toString());
              if (outObj.SPAudioDataType && outObj.SPAudioDataType.length && outObj.SPAudioDataType[0] && outObj.SPAudioDataType[0]["_items"] && outObj.SPAudioDataType[0]["_items"].length) {
                for (let i = 0; i < outObj.SPAudioDataType[0]["_items"].length; i++) {
                  const audio2 = parseDarwinAudio(outObj.SPAudioDataType[0]["_items"][i], i);
                  result.push(audio2);
                }
              }
            } catch (e) {
              util$1.noop();
            }
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_windows$1) {
        util$1.powerShell("Get-CimInstance Win32_SoundDevice | select DeviceID,StatusInfo,Name,Manufacturer | fl").then((stdout, error) => {
          if (!error) {
            const parts = stdout.toString().split(/\n\s*\n/);
            parts.forEach((element) => {
              const lines = element.split("\n");
              if (util$1.getValue(lines, "name", ":")) {
                result.push(parseWindowsAudio(lines));
              }
            });
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_sunos$1) {
        resolve(null);
      }
    });
  });
}
audio$1.audio = audio;
var bluetooth = {};
const exec = require$$1.exec;
const execSync = require$$1.execSync;
const path = require$$2;
const util = util$j;
const fs$2 = require$$1$1;
let _platform = process.platform;
const _linux = _platform === "linux" || _platform === "android";
const _darwin = _platform === "darwin";
const _windows = _platform === "win32";
const _freebsd = _platform === "freebsd";
const _openbsd = _platform === "openbsd";
const _netbsd = _platform === "netbsd";
const _sunos = _platform === "sunos";
function parseBluetoothType(str) {
  let result = "";
  if (str.indexOf("keyboard") >= 0) {
    result = "Keyboard";
  }
  if (str.indexOf("mouse") >= 0) {
    result = "Mouse";
  }
  if (str.indexOf("trackpad") >= 0) {
    result = "Trackpad";
  }
  if (str.indexOf("speaker") >= 0) {
    result = "Speaker";
  }
  if (str.indexOf("headset") >= 0) {
    result = "Headset";
  }
  if (str.indexOf("phone") >= 0) {
    result = "Phone";
  }
  if (str.indexOf("macbook") >= 0) {
    result = "Computer";
  }
  if (str.indexOf("imac") >= 0) {
    result = "Computer";
  }
  if (str.indexOf("ipad") >= 0) {
    result = "Tablet";
  }
  if (str.indexOf("watch") >= 0) {
    result = "Watch";
  }
  if (str.indexOf("headphone") >= 0) {
    result = "Headset";
  }
  return result;
}
function parseBluetoothManufacturer(str) {
  let result = str.split(" ")[0];
  str = str.toLowerCase();
  if (str.indexOf("apple") >= 0) {
    result = "Apple";
  }
  if (str.indexOf("ipad") >= 0) {
    result = "Apple";
  }
  if (str.indexOf("imac") >= 0) {
    result = "Apple";
  }
  if (str.indexOf("iphone") >= 0) {
    result = "Apple";
  }
  if (str.indexOf("magic mouse") >= 0) {
    result = "Apple";
  }
  if (str.indexOf("magic track") >= 0) {
    result = "Apple";
  }
  if (str.indexOf("macbook") >= 0) {
    result = "Apple";
  }
  return result;
}
function parseLinuxBluetoothInfo(lines, macAddr1, macAddr2) {
  const result = {};
  result.device = null;
  result.name = util.getValue(lines, "name", "=");
  result.manufacturer = null;
  result.macDevice = macAddr1;
  result.macHost = macAddr2;
  result.batteryPercent = null;
  result.type = parseBluetoothType(result.name.toLowerCase());
  result.connected = false;
  return result;
}
function parseDarwinBluetoothDevices(bluetoothObject, macAddr2) {
  const result = {};
  const typeStr = ((bluetoothObject.device_minorClassOfDevice_string || bluetoothObject.device_majorClassOfDevice_string || bluetoothObject.device_minorType || "") + (bluetoothObject.device_name || "")).toLowerCase();
  result.device = bluetoothObject.device_services || "";
  result.name = bluetoothObject.device_name || "";
  result.manufacturer = bluetoothObject.device_manufacturer || parseBluetoothManufacturer(bluetoothObject.device_name || "") || "";
  result.macDevice = (bluetoothObject.device_addr || bluetoothObject.device_address || "").toLowerCase().replace(/-/g, ":");
  result.macHost = macAddr2;
  result.batteryPercent = bluetoothObject.device_batteryPercent || null;
  result.type = parseBluetoothType(typeStr);
  result.connected = bluetoothObject.device_isconnected === "attrib_Yes" || false;
  return result;
}
function parseWindowsBluetooth(lines) {
  const result = {};
  result.device = null;
  result.name = util.getValue(lines, "name", ":");
  result.manufacturer = util.getValue(lines, "manufacturer", ":");
  result.macDevice = null;
  result.macHost = null;
  result.batteryPercent = null;
  result.type = parseBluetoothType(result.name.toLowerCase());
  result.connected = null;
  return result;
}
function bluetoothDevices(callback) {
  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = [];
      if (_linux) {
        const btFiles = util.getFilesInPath("/var/lib/bluetooth/");
        btFiles.forEach((element) => {
          const filename = path.basename(element);
          const pathParts = element.split("/");
          const macAddr1 = pathParts.length >= 6 ? pathParts[pathParts.length - 2] : null;
          const macAddr2 = pathParts.length >= 7 ? pathParts[pathParts.length - 3] : null;
          if (filename === "info") {
            const infoFile = fs$2.readFileSync(element, { encoding: "utf8" }).split("\n");
            result.push(parseLinuxBluetoothInfo(infoFile, macAddr1, macAddr2));
          }
        });
        try {
          const hdicon = execSync("hcitool con").toString().toLowerCase();
          for (let i = 0; i < result.length; i++) {
            if (result[i].macDevice && result[i].macDevice.length > 10 && hdicon.indexOf(result[i].macDevice.toLowerCase()) >= 0) {
              result[i].connected = true;
            }
          }
        } catch (e) {
          util.noop();
        }
        if (callback) {
          callback(result);
        }
        resolve(result);
      }
      if (_darwin) {
        let cmd = "system_profiler SPBluetoothDataType -json";
        exec(cmd, function(error, stdout) {
          if (!error) {
            try {
              const outObj = JSON.parse(stdout.toString());
              if (outObj.SPBluetoothDataType && outObj.SPBluetoothDataType.length && outObj.SPBluetoothDataType[0] && outObj.SPBluetoothDataType[0]["device_title"] && outObj.SPBluetoothDataType[0]["device_title"].length) {
                let macAddr2 = null;
                if (outObj.SPBluetoothDataType[0]["local_device_title"] && outObj.SPBluetoothDataType[0].local_device_title.general_address) {
                  macAddr2 = outObj.SPBluetoothDataType[0].local_device_title.general_address.toLowerCase().replace(/-/g, ":");
                }
                outObj.SPBluetoothDataType[0]["device_title"].forEach((element) => {
                  const obj = element;
                  const objKey = Object.keys(obj);
                  if (objKey && objKey.length === 1) {
                    const innerObject = obj[objKey[0]];
                    innerObject.device_name = objKey[0];
                    const bluetoothDevice = parseDarwinBluetoothDevices(innerObject, macAddr2);
                    result.push(bluetoothDevice);
                  }
                });
              }
              if (outObj.SPBluetoothDataType && outObj.SPBluetoothDataType.length && outObj.SPBluetoothDataType[0] && outObj.SPBluetoothDataType[0]["device_connected"] && outObj.SPBluetoothDataType[0]["device_connected"].length) {
                const macAddr2 = outObj.SPBluetoothDataType[0].controller_properties && outObj.SPBluetoothDataType[0].controller_properties.controller_address ? outObj.SPBluetoothDataType[0].controller_properties.controller_address.toLowerCase().replace(/-/g, ":") : null;
                outObj.SPBluetoothDataType[0]["device_connected"].forEach((element) => {
                  const obj = element;
                  const objKey = Object.keys(obj);
                  if (objKey && objKey.length === 1) {
                    const innerObject = obj[objKey[0]];
                    innerObject.device_name = objKey[0];
                    innerObject.device_isconnected = "attrib_Yes";
                    const bluetoothDevice = parseDarwinBluetoothDevices(innerObject, macAddr2);
                    result.push(bluetoothDevice);
                  }
                });
              }
              if (outObj.SPBluetoothDataType && outObj.SPBluetoothDataType.length && outObj.SPBluetoothDataType[0] && outObj.SPBluetoothDataType[0]["device_not_connected"] && outObj.SPBluetoothDataType[0]["device_not_connected"].length) {
                const macAddr2 = outObj.SPBluetoothDataType[0].controller_properties && outObj.SPBluetoothDataType[0].controller_properties.controller_address ? outObj.SPBluetoothDataType[0].controller_properties.controller_address.toLowerCase().replace(/-/g, ":") : null;
                outObj.SPBluetoothDataType[0]["device_not_connected"].forEach((element) => {
                  const obj = element;
                  const objKey = Object.keys(obj);
                  if (objKey && objKey.length === 1) {
                    const innerObject = obj[objKey[0]];
                    innerObject.device_name = objKey[0];
                    innerObject.device_isconnected = "attrib_No";
                    const bluetoothDevice = parseDarwinBluetoothDevices(innerObject, macAddr2);
                    result.push(bluetoothDevice);
                  }
                });
              }
            } catch (e) {
              util.noop();
            }
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_windows) {
        util.powerShell("Get-CimInstance Win32_PNPEntity | select PNPClass, Name, Manufacturer | fl").then((stdout, error) => {
          if (!error) {
            const parts = stdout.toString().split(/\n\s*\n/);
            parts.forEach((part) => {
              if (util.getValue(part.split("\n"), "PNPClass", ":") === "Bluetooth") {
                result.push(parseWindowsBluetooth(part.split("\n")));
              }
            });
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_freebsd || _netbsd || _openbsd || _sunos) {
        resolve(null);
      }
    });
  });
}
bluetooth.bluetoothDevices = bluetoothDevices;
(function(exports) {
  const lib_version = require$$0.version;
  const util2 = util$j;
  const system2 = system$1;
  const osInfo2 = osinfo;
  const cpu2 = cpu$1;
  const memory$1 = memory;
  const battery$1 = battery;
  const graphics2 = graphics$1;
  const filesystem$1 = filesystem;
  const network$1 = network;
  const wifi$1 = wifi;
  const processes2 = processes$1;
  const users2 = users$1;
  const internet$1 = internet;
  const docker$1 = docker;
  const vbox = virtualbox;
  const printer2 = printer$1;
  const usb2 = usb$1;
  const audio2 = audio$1;
  const bluetooth$1 = bluetooth;
  let _platform2 = process.platform;
  const _windows2 = _platform2 === "win32";
  const _freebsd2 = _platform2 === "freebsd";
  const _openbsd2 = _platform2 === "openbsd";
  const _netbsd2 = _platform2 === "netbsd";
  const _sunos2 = _platform2 === "sunos";
  if (_windows2) {
    util2.getCodepage();
  }
  function version2() {
    return lib_version;
  }
  function getStaticData(callback) {
    return new Promise((resolve) => {
      process.nextTick(() => {
        let data = {};
        data.version = version2();
        Promise.all([
          system2.system(),
          system2.bios(),
          system2.baseboard(),
          system2.chassis(),
          osInfo2.osInfo(),
          osInfo2.uuid(),
          osInfo2.versions(),
          cpu2.cpu(),
          cpu2.cpuFlags(),
          graphics2.graphics(),
          network$1.networkInterfaces(),
          memory$1.memLayout(),
          filesystem$1.diskLayout()
        ]).then((res) => {
          data.system = res[0];
          data.bios = res[1];
          data.baseboard = res[2];
          data.chassis = res[3];
          data.os = res[4];
          data.uuid = res[5];
          data.versions = res[6];
          data.cpu = res[7];
          data.cpu.flags = res[8];
          data.graphics = res[9];
          data.net = res[10];
          data.memLayout = res[11];
          data.diskLayout = res[12];
          if (callback) {
            callback(data);
          }
          resolve(data);
        });
      });
    });
  }
  function getDynamicData(srv, iface, callback) {
    if (util2.isFunction(iface)) {
      callback = iface;
      iface = "";
    }
    if (util2.isFunction(srv)) {
      callback = srv;
      srv = "";
    }
    return new Promise((resolve) => {
      process.nextTick(() => {
        iface = iface || network$1.getDefaultNetworkInterface();
        srv = srv || "";
        let functionProcessed = function() {
          let totalFunctions = 15;
          if (_windows2) {
            totalFunctions = 13;
          }
          if (_freebsd2 || _openbsd2 || _netbsd2) {
            totalFunctions = 11;
          }
          if (_sunos2) {
            totalFunctions = 6;
          }
          return function() {
            if (--totalFunctions === 0) {
              if (callback) {
                callback(data);
              }
              resolve(data);
            }
          };
        }();
        let data = {};
        data.time = osInfo2.time();
        data.node = process.versions.node;
        data.v8 = process.versions.v8;
        cpu2.cpuCurrentSpeed().then((res) => {
          data.cpuCurrentSpeed = res;
          functionProcessed();
        });
        users2.users().then((res) => {
          data.users = res;
          functionProcessed();
        });
        processes2.processes().then((res) => {
          data.processes = res;
          functionProcessed();
        });
        cpu2.currentLoad().then((res) => {
          data.currentLoad = res;
          functionProcessed();
        });
        if (!_sunos2) {
          cpu2.cpuTemperature().then((res) => {
            data.temp = res;
            functionProcessed();
          });
        }
        if (!_openbsd2 && !_freebsd2 && !_netbsd2 && !_sunos2) {
          network$1.networkStats(iface).then((res) => {
            data.networkStats = res;
            functionProcessed();
          });
        }
        if (!_sunos2) {
          network$1.networkConnections().then((res) => {
            data.networkConnections = res;
            functionProcessed();
          });
        }
        memory$1.mem().then((res) => {
          data.mem = res;
          functionProcessed();
        });
        if (!_sunos2) {
          battery$1().then((res) => {
            data.battery = res;
            functionProcessed();
          });
        }
        if (!_sunos2) {
          processes2.services(srv).then((res) => {
            data.services = res;
            functionProcessed();
          });
        }
        if (!_sunos2) {
          filesystem$1.fsSize().then((res) => {
            data.fsSize = res;
            functionProcessed();
          });
        }
        if (!_windows2 && !_openbsd2 && !_freebsd2 && !_netbsd2 && !_sunos2) {
          filesystem$1.fsStats().then((res) => {
            data.fsStats = res;
            functionProcessed();
          });
        }
        if (!_windows2 && !_openbsd2 && !_freebsd2 && !_netbsd2 && !_sunos2) {
          filesystem$1.disksIO().then((res) => {
            data.disksIO = res;
            functionProcessed();
          });
        }
        if (!_openbsd2 && !_freebsd2 && !_netbsd2 && !_sunos2) {
          wifi$1.wifiNetworks().then((res) => {
            data.wifiNetworks = res;
            functionProcessed();
          });
        }
        internet$1.inetLatency().then((res) => {
          data.inetLatency = res;
          functionProcessed();
        });
      });
    });
  }
  function getAllData(srv, iface, callback) {
    return new Promise((resolve) => {
      process.nextTick(() => {
        let data = {};
        if (iface && util2.isFunction(iface) && !callback) {
          callback = iface;
          iface = "";
        }
        if (srv && util2.isFunction(srv) && !iface && !callback) {
          callback = srv;
          srv = "";
          iface = "";
        }
        getStaticData().then((res) => {
          data = res;
          getDynamicData(srv, iface).then((res2) => {
            for (let key in res2) {
              if ({}.hasOwnProperty.call(res2, key)) {
                data[key] = res2[key];
              }
            }
            if (callback) {
              callback(data);
            }
            resolve(data);
          });
        });
      });
    });
  }
  function get(valueObject, callback) {
    return new Promise((resolve) => {
      process.nextTick(() => {
        const allPromises = Object.keys(valueObject).filter((func) => ({}).hasOwnProperty.call(exports, func)).map((func) => {
          const params = valueObject[func].substring(valueObject[func].lastIndexOf("(") + 1, valueObject[func].lastIndexOf(")"));
          let funcWithoutParams = func.indexOf(")") >= 0 ? func.split(")")[1].trim() : func;
          funcWithoutParams = func.indexOf("|") >= 0 ? func.split("|")[0].trim() : funcWithoutParams;
          if (params) {
            return exports[funcWithoutParams](params);
          } else {
            return exports[funcWithoutParams]("");
          }
        });
        Promise.all(allPromises).then((data) => {
          const result = {};
          let i = 0;
          for (let key in valueObject) {
            if ({}.hasOwnProperty.call(valueObject, key) && {}.hasOwnProperty.call(exports, key) && data.length > i) {
              if (valueObject[key] === "*" || valueObject[key] === "all") {
                result[key] = data[i];
              } else {
                let keys = valueObject[key];
                let filter = "";
                let filterParts = [];
                if (keys.indexOf(")") >= 0) {
                  keys = keys.split(")")[1].trim();
                }
                if (keys.indexOf("|") >= 0) {
                  filter = keys.split("|")[1].trim();
                  filterParts = filter.split(":");
                  keys = keys.split("|")[0].trim();
                }
                keys = keys.replace(/,/g, " ").replace(/ +/g, " ").split(" ");
                if (data[i]) {
                  if (Array.isArray(data[i])) {
                    const partialArray = [];
                    data[i].forEach((element) => {
                      let partialRes = {};
                      if (keys.length === 1 && (keys[0] === "*" || keys[0] === "all")) {
                        partialRes = element;
                      } else {
                        keys.forEach((k) => {
                          if ({}.hasOwnProperty.call(element, k)) {
                            partialRes[k] = element[k];
                          }
                        });
                      }
                      if (filter && filterParts.length === 2) {
                        if ({}.hasOwnProperty.call(partialRes, filterParts[0].trim())) {
                          const val = partialRes[filterParts[0].trim()];
                          if (typeof val == "number") {
                            if (val === parseFloat(filterParts[1].trim())) {
                              partialArray.push(partialRes);
                            }
                          } else if (typeof val == "string") {
                            if (val.toLowerCase() === filterParts[1].trim().toLowerCase()) {
                              partialArray.push(partialRes);
                            }
                          }
                        }
                      } else {
                        partialArray.push(partialRes);
                      }
                    });
                    result[key] = partialArray;
                  } else {
                    const partialRes = {};
                    keys.forEach((k) => {
                      if ({}.hasOwnProperty.call(data[i], k)) {
                        partialRes[k] = data[i][k];
                      }
                    });
                    result[key] = partialRes;
                  }
                } else {
                  result[key] = {};
                }
              }
              i++;
            }
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      });
    });
  }
  function observe(valueObject, interval, callback) {
    let _data = null;
    const result = setInterval(() => {
      get(valueObject).then((data) => {
        if (JSON.stringify(_data) !== JSON.stringify(data)) {
          _data = Object.assign({}, data);
          callback(data);
        }
      });
    }, interval);
    return result;
  }
  exports.version = version2;
  exports.system = system2.system;
  exports.bios = system2.bios;
  exports.baseboard = system2.baseboard;
  exports.chassis = system2.chassis;
  exports.time = osInfo2.time;
  exports.osInfo = osInfo2.osInfo;
  exports.versions = osInfo2.versions;
  exports.shell = osInfo2.shell;
  exports.uuid = osInfo2.uuid;
  exports.cpu = cpu2.cpu;
  exports.cpuFlags = cpu2.cpuFlags;
  exports.cpuCache = cpu2.cpuCache;
  exports.cpuCurrentSpeed = cpu2.cpuCurrentSpeed;
  exports.cpuTemperature = cpu2.cpuTemperature;
  exports.currentLoad = cpu2.currentLoad;
  exports.fullLoad = cpu2.fullLoad;
  exports.mem = memory$1.mem;
  exports.memLayout = memory$1.memLayout;
  exports.battery = battery$1;
  exports.graphics = graphics2.graphics;
  exports.fsSize = filesystem$1.fsSize;
  exports.fsOpenFiles = filesystem$1.fsOpenFiles;
  exports.blockDevices = filesystem$1.blockDevices;
  exports.fsStats = filesystem$1.fsStats;
  exports.disksIO = filesystem$1.disksIO;
  exports.diskLayout = filesystem$1.diskLayout;
  exports.networkInterfaceDefault = network$1.networkInterfaceDefault;
  exports.networkGatewayDefault = network$1.networkGatewayDefault;
  exports.networkInterfaces = network$1.networkInterfaces;
  exports.networkStats = network$1.networkStats;
  exports.networkConnections = network$1.networkConnections;
  exports.wifiNetworks = wifi$1.wifiNetworks;
  exports.wifiInterfaces = wifi$1.wifiInterfaces;
  exports.wifiConnections = wifi$1.wifiConnections;
  exports.services = processes2.services;
  exports.processes = processes2.processes;
  exports.processLoad = processes2.processLoad;
  exports.users = users2.users;
  exports.inetChecksite = internet$1.inetChecksite;
  exports.inetLatency = internet$1.inetLatency;
  exports.dockerInfo = docker$1.dockerInfo;
  exports.dockerImages = docker$1.dockerImages;
  exports.dockerContainers = docker$1.dockerContainers;
  exports.dockerContainerStats = docker$1.dockerContainerStats;
  exports.dockerContainerProcesses = docker$1.dockerContainerProcesses;
  exports.dockerVolumes = docker$1.dockerVolumes;
  exports.dockerAll = docker$1.dockerAll;
  exports.vboxInfo = vbox.vboxInfo;
  exports.printer = printer2.printer;
  exports.usb = usb2.usb;
  exports.audio = audio2.audio;
  exports.bluetoothDevices = bluetooth$1.bluetoothDevices;
  exports.getStaticData = getStaticData;
  exports.getDynamicData = getDynamicData;
  exports.getAllData = getAllData;
  exports.get = get;
  exports.observe = observe;
  exports.powerShellStart = util2.powerShellStart;
  exports.powerShellRelease = util2.powerShellRelease;
})(lib);
const si = /* @__PURE__ */ getDefaultExportFromCjs(lib);
const icon = require$$2.join(__dirname, "../../resources/icon.png");
const fs$1 = require("fs");
const getFileCount = (filePath2) => {
  try {
    const files2 = fs$1.readdirSync(filePath2);
    const fileCount = files2.length;
    return fileCount;
  } catch (error) {
    console.error("Error reading directory:", error);
    return 0;
  }
};
const { join } = (() => {
  const mod = require("path");
  return mod && mod.__esModule ? mod : Object.assign(/* @__PURE__ */ Object.create(null), mod, { default: mod, [Symbol.toStringTag]: "Module" });
})();
const { default: fs } = (() => {
  const mod = require("fs");
  return mod && mod.__esModule ? mod : Object.assign(/* @__PURE__ */ Object.create(null), mod, { default: mod, [Symbol.toStringTag]: "Module" });
})();
const homeDirectory = require$$0$1.homedir();
const filePath = `${homeDirectory}/Documents/recyclePictures`;
function createWindow() {
  const mainWindow = new electron.BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...process.platform === "linux" ? { icon } : {},
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false
    },
    fullscreen: true
  });
  mainWindow.webContents.openDevTools();
  fs.watchFile(filePath, () => {
    const fileCount = getFileCount(filePath);
    mainWindow?.webContents.send("file-count-changed", fileCount);
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
    const fileCount = getFileCount(filePath);
    mainWindow?.webContents.send("file-count-changed", fileCount);
    si.system().then((data) => {
      console.log("System Information:", data);
      mainWindow?.webContents.send("system-uuid", data.uuid);
    });
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    electron.shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (utils.is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}
electron.app.whenReady().then(() => {
  utils.electronApp.setAppUserModelId("com.electron");
  electron.app.on("browser-window-created", (_, window) => {
    utils.optimizer.watchWindowShortcuts(window);
  });
  electron.ipcMain.on("ping", () => console.log("pong"));
  electron.ipcMain.on("create-pictures-dir", (_event, arg) => {
    console.log(arg, "arg");
  });
  createWindow();
  electron.app.on("activate", function() {
    if (electron.BrowserWindow.getAllWindows().length === 0)
      createWindow();
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
