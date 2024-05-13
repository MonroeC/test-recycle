export default ({ closeCallBack }) => {
  window?.eslObj?.Close(function (isSuccess, result) {
    if (isSuccess == true) {
      // callBack(true, saveResult)
      closeCallBack && closeCallBack()
    } else {
      // callBack(false, result)
    }
  })
}
