export default (params) => {
  const { filePath, saveSuccessCallback, saveErrorCallback } = params
  console.log(params, 888)
  const current_count = 1
  const current_fileFormat = ESLFunctions?.FF_JPEG

  /** 保存的对象 */
  const saveParam: any = {}
  /** 保存的文件格式 base64 本地文件 */
  saveParam.destination = ESLFunctions.DEST_FILE
  /** 文件格式 */
  saveParam.fileFormat = current_fileFormat
  saveParam.filePath = `${filePath}`
  saveParam.fileName = current_count
  window?.eslObj.Save(saveParam, function (isSuccess, result) {
    if (isSuccess == true) {
      if (result.eventType == ESLFunctions.EVENT_SAVEPAGE_COMPLETE) {
        // callBack(true, result)
      }
      if (result.eventType == ESLFunctions.EVENT_ALLSAVE_COMPLETE) {
        const saveResult = result
        console.log(saveParam, saveSuccessCallback, 'saveparam')
        saveSuccessCallback && saveSuccessCallback(saveResult)
        // callBack(true, saveResult)
        // window?.eslObj.Close(function (isSuccess, result) {
        //   if (isSuccess == true) {
        //     callBack(true, saveResult)
        //   } else {
        //     callBack(false, result)
        //   }
        // })
      }
    } else {
      console.log(window.errorCount, 'window.errorCount')
      saveErrorCallback && saveErrorCallback(result)
    }
  })
}
