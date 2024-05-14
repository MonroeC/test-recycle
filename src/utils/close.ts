export default (params) => {
  const { closeSuccessCallback, closeErrorCallback } = params
  if (!window.scanOpen) return
  console.log('close')
  window?.eslObj?.Close(function (isSuccess, result) {
    if (isSuccess == true) {
      console.log('关闭成功')
      window.scanOpen = false
      closeSuccessCallback && closeSuccessCallback()
    } else {
      closeErrorCallback && closeErrorCallback()
    }
  })
}
