export default (params) => {
  const { closeSuccessCallback, closeErrorCallback } = params
  if (!window.scanOpen) return
  window?.eslObj?.Close(function (isSuccess, result) {
    if (isSuccess == true) {
      console.log('关闭成功')
      window.scanOpen = false
      closeSuccessCallback && closeSuccessCallback()
      // callBack(true, saveResult)
      //  closeCallBack && closeCallBack()
    } else {
      closeErrorCallback && closeErrorCallback()
      // callBack(false, result)
    }
  })
}
