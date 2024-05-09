var ESLFunctions = {
  ESLCreate: function () {
    return new ESLClass()
  },

  // Kinds of scanning/saving event
  EVENT_NONE: 0,
  EVENT_SCANPAGE_COMPLETE: 1,
  EVENT_SAVEPAGE_COMPLETE: 2,
  EVENT_ALLSCAN_COMPLETE: 3,
  EVENT_ALLSAVE_COMPLETE: 4,

  // Document Source definitions
  SRC_AUTO: -1,
  SRC_FLATBED: 0,
  SRC_FEEDER_SIMPLEX: 1,
  SRC_FEEDER_DUPLEX: 2,

  // Image Type definitions
  IT_AUTO: -1,
  IT_COLOR: 0,
  IT_GRAY: 1,
  IT_MONO: 2,

  // Document Side definitions
  DS_AUTO_LONG: -2,
  DS_AUTO: -1,
  DS_USER: 0,
  DS_A3: 0x01,
  DS_A4: 0x02,
  DS_A5: 0x03,
  DS_B4: 0x11,
  DS_B5: 0x12,
  DS_US_LEDGER: 0x21,
  DS_US_LEGAL: 0x22,
  DS_US_LETTER: 0x23,

  // Size Unit definitions
  SU_INCH: 0,
  SU_CENTIMETER: 1,
  SU_PIXEL: 2,

  // Document Rotation definitions
  DR_AUTO: -1,
  DR_NONE: 0,
  DR_R90: 1,
  DR_R180: 2,
  DR_R270: 3,

  // Color Filter definitions
  CF_NONE: 0x00000000,
  CF_DROPOUT_RED: 0x00000001,
  CF_DROPOUT_GREEN: 0x00000002,
  CF_DROPOUT_BLUE: 0x00000003,
  CF_DROPOUT_PINK: 0x00000004,
  CF_DROPOUT_PURPLE: 0x00000005,
  CF_DROPOUT_YELLOW: 0x00000006,
  CF_DROPOUT_ORANGE: 0x00000007,
  CF_DROPOUT_EXPBLACK: 0x00000008,
  CF_ENHANCE_RED: 0x00000011,
  CF_ENHANCE_GREEN: 0x00000012,
  CF_ENHANCE_BLUE: 0x00000013,
  CF_ENHANCE_PINK: 0x00000014,
  CF_ENHANCE_PURPLE: 0x00000015,
  CF_ENHANCE_YELLOW: 0x00000016,
  CF_ENHANCE_ORANGE: 0x00000017,
  CF_ENHANCE_EXPBLACK: 0x00000018,

  // Document Enhance definitions
  DE_NONE: 0x00000000,
  DE_TET_STD: 0x00000001,
  DE_TET_HIGH: 0x00000002,
  DE_AAS: 0x00000011,

  // Double Feed Detection definitions
  DFD_NONE: 0,
  DFF_LOW: 1,
  DFD_HIGH: 2,

  // Blank Page Skip definitions
  BPS_NONE: 0,
  BPS_VERY_LOW: 1,
  BPS_LOW: 2,
  BPS_MEDIUM: 3,
  BPS_HIGH: 4,

  //Image Filter
  ESL_IMGFILTER_USM: 0x00000001,
  ESL_IMGFILTER_DESCREENING: 0x00000002,

  // Punch Hole Remove definitions
  PHR_NONE: 0,
  PHR_ON: 1,

  // Skew Correction definitions
  SC_NONE: 0,
  SC_EDGE: 1,
  SC_CONTENTS: 2,
  SC_BOTH: 3,

  // Edge Fill definitions
  EF_NONE: 0,
  EF_WHITE: 1,
  EF_BLACK: 2,

  // Automatic Feeding Mode
  AFM_NONE: 0,
  AFM_ON: 1,

  // LaminateCard Mode
  LCM_NONE: 0,
  LCM_ON: 1,

  // Destionation
  DEST_BASE64: 0,
  DEST_FILE: 1,

  // Save format
  FF_BMP: 0,
  FF_JPEG: 1,
  FF_TIFF: 2,
  FF_MULTITIFF: 3,
  FF_PDF: 4,

  // File name type
  FN_PREFIX: 0,
  FN_BARCODE: 1,
  FN_OCR: 2,

  // Time format
  TF_NONE: 0,
  TF_YYYYMMDD: 1,
  TF_MMDDYYYY: 2,
  TF_DDMMYYYY: 3,
  TF_YYYYMMDD_HHMMSS: 4,
  TF_MMDDYYYY_HHMMSS: 5,
  TF_DDMMYYYY_HHMMSS: 6,

  // PDF Type
  PT_NORMAL: 0, // Normal PDF document
  PT_PDF_A: 1, // Make PDF/A document
  PT_HIGHCOMP: 2, // HIgh Compression ADF document (Efficient for Color/Gray only)

  // OCR language
  OL_NONE: 0,
  OL_OCR_A: 1, // OCR A Font (Not used for Searchable PDF)
  OL_OCR_B: 2, // OCR B Font (Not used for Searchable PDF)
  OL_EN: 0x10, // English
  OL_JA: 0x11, // Japanese
  OL_ZH_TW: 0x12, // Simplified Chinese
  OL_ZH_CN: 0x13, // Traditional Chinese
  OL_KO: 0x14, // Korean
  OL_FR: 0x15, // French
  OL_IT: 0x16, // Italian
  OL_DE: 0x17, // German
  OL_ES: 0x18, // Spanish
  OL_PT: 0x19, // Portuguese
  OL_NL: 0x1a, // Dutch
  OL_RU: 0x1b, // Russian
  OL_UK: 0x1c, // Ukrainian

  DEFAULT_SERVER_URL: 'http://localhost:51000'
}

var ESLClass = function () {}

ESLClass.prototype.Cancel = function (callback) {
  var requestXML = new XMLHttpRequest()
  requestXML.onreadystatechange = function () {
    if (requestXML.readyState === 4) {
      if (requestXML.status == 200) {
        callback(true, JSON.parse(requestXML.responseText))
      } else {
        callback(false, null)
      }
    }
  }

  requestXML.open('POST', this.serverURL + '/Cancel', true)
  requestXML.setRequestHeader('Content-Type', 'text/plain')
  requestXML.send(null)
}

ESLClass.prototype.StripTrailingSlash = function (str) {
  if (str.substr(-1) === '/') {
    return str.substr(0, str.length - 1)
  }
  return str
}

ESLClass.prototype.Open = function (params, callback) {
  if (params.deviceName == null) {
    alert('error deviceName cannot be null')
  }

  this.serverURL = ESLFunctions.DEFAULT_SERVER_URL
  if (params.serverURL) {
    this.serverURL = params.serverURL
  }
  this.serverURL = this.StripTrailingSlash(this.serverURL)

  var requestXML = new XMLHttpRequest()
  requestXML.onreadystatechange = function () {
    if (requestXML.readyState === 4) {
      if (requestXML.status == 200) {
        callback(true, JSON.parse(requestXML.responseText))
      } else {
        callback(false, null)
      }
    }
  }

  requestXML.open('POST', this.serverURL + '/Open', true)
  requestXML.setRequestHeader('Content-Type', 'text/plain')
  var json = JSON.stringify(params)
  requestXML.send(json)
}

ESLClass.prototype.Close = function (callback) {
  var requestXML = new XMLHttpRequest()
  requestXML.onreadystatechange = function () {
    if (requestXML.readyState === 4) {
      if (requestXML.status == 200) {
        callback(true, JSON.parse(requestXML.responseText))
      } else {
        callback(false, null)
      }
    }
  }

  requestXML.open('POST', this.serverURL + '/Close', true)
  requestXML.setRequestHeader('Content-Type', 'text/plain')
  requestXML.send()
}

ESLClass.prototype.GetInfo = function (callback) {
  var requestXML = new XMLHttpRequest()
  requestXML.onreadystatechange = function () {
    if (requestXML.readyState === 4) {
      if (requestXML.status == 200) {
        callback(true, JSON.parse(requestXML.responseText))
      } else {
        callback(false, null)
      }
    }
  }

  requestXML.open('POST', this.serverURL + '/GetInfo', true)
  requestXML.setRequestHeader('Content-Type', 'text/plain')
  requestXML.send()
}

ESLClass.prototype.GetScanAndSaveEvent = function (callback) {
  var requestXML = new XMLHttpRequest()
  requestXML.onreadystatechange = function () {
    if (requestXML.readyState === 4) {
      if (requestXML.status == 200) {
        callback(true, JSON.parse(requestXML.responseText))
      } else {
        callback(false, null)
      }
    }
  }

  requestXML.open('POST', this.serverURL + '/GetScanAndSaveEvent', true)
  requestXML.setRequestHeader('Content-Type', 'text/plain')

  requestXML.send(null)
}

ESLClass.prototype.Scan = function (params, callback) {
  var protypeThis = this

  var requestXML = new XMLHttpRequest()
  requestXML.onreadystatechange = function () {
    if (requestXML.readyState === 4) {
      if (requestXML.status == 200) {
        var checkScanStatus = function () {
          protypeThis.GetScanAndSaveEvent(function (isSuccess, result) {
            if (isSuccess) {
              if (result.eventType == ESLFunctions.EVENT_NONE) {
                setTimeout(checkScanStatus, 1)
              }

              if (result.eventType == ESLFunctions.EVENT_SCANPAGE_COMPLETE) {
                callback(true, result)
                setTimeout(checkScanStatus, 1)
              }
              if (result.eventType == ESLFunctions.EVENT_ALLSCAN_COMPLETE) {
                if (result.errorCode == 0) {
                  callback(true, result)
                } else {
                  callback(false, result)
                }
              }
            } else {
              callback(false, null)
            }
          })
        }
        setTimeout(checkScanStatus, 1)
      } else {
        callback(false, null)
      }
    }
  }

  requestXML.open('POST', this.serverURL + '/Scan', true)
  requestXML.setRequestHeader('Content-Type', 'text/plain')

  var json = JSON.stringify(params)
  requestXML.send(json)
}

ESLClass.prototype.Save = function (params, callback) {
  var protypeThis = this

  var requestXML = new XMLHttpRequest()
  requestXML.onreadystatechange = function () {
    if (requestXML.readyState === 4) {
      if (requestXML.status == 200) {
        var checkSaveStatus = function () {
          protypeThis.GetScanAndSaveEvent(function (isSuccess, result) {
            if (isSuccess) {
              if (result.eventType == ESLFunctions.EVENT_NONE) {
                setTimeout(checkSaveStatus, 2)
              }

              if (result.eventType == ESLFunctions.EVENT_SAVEPAGE_COMPLETE) {
                callback(true, result)
                setTimeout(checkSaveStatus, 2)
              }
              if (result.eventType == ESLFunctions.EVENT_ALLSAVE_COMPLETE) {
                callback(true, result)
              }
            } else {
              callback(false, null)
            }
          })
        }
        setTimeout(checkSaveStatus, 2)
      } else {
        callback(false, null)
      }
    }
  }

  requestXML.open('POST', this.serverURL + '/Save', true)
  requestXML.setRequestHeader('Content-Type', 'text/plain')

  var json = JSON.stringify(params)
  requestXML.send(json)
}

ESLClass.prototype.ScanAndSave_Simple = function (connectionParam, scanParam, saveParam, callBack) {
  var eslObj = ESLFunctions.ESLCreate()
  eslObj.Open(connectionParam, function (isSuccess, result) {
    if (isSuccess == true) {
      eslObj.Scan(scanParam, function (isSuccess, result) {
        if (isSuccess) {
          if (result.eventType == ESLFunctions.EVENT_SCANPAGE_COMPLETE) {
            callBack(true, result)
          }

          if (result.eventType == ESLFunctions.EVENT_ALLSCAN_COMPLETE) {
            callBack(true, result)

            eslObj.Save(saveParam, function (isSuccess, result) {
              if (isSuccess == true) {
                if (result.eventType == ESLFunctions.EVENT_SAVEPAGE_COMPLETE) {
                  callBack(true, result)
                }
                if (result.eventType == ESLFunctions.EVENT_ALLSAVE_COMPLETE) {
                  var saveResult = result
                  eslObj.Close(function (isSuccess, result) {
                    if (isSuccess == true) {
                      callBack(true, saveResult)
                    } else {
                      callBack(false, result)
                    }
                  })
                }
              } else {
                callBack(false, result)
                eslObj.Close(function (isSuccess, result) {})
              }
            })
          }
        } else {
          callBack(false, result)
          eslObj.Close(function (isSuccess, result) {})
        }
      })
    } else {
      callBack(false, result)
    }
  })
}
