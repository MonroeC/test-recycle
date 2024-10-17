export const updateDb = (data): void => {
  window.electronApi.updateDb(data).then((response) => {
    console.log('DB updated:', response)
  })
}

export const updateImgs = (data): void => {
  window.electronApi.updateImgs(data).then((response) => {
    console.log('DB updated:', response)
  })
}
/**
 * 
 * @param key 需要获取的是哪个字段的数据
 * @returns 
 */
export const getDb = async (key): Promise<void> => {
  const response = await window.electronApi.getDb(key)
  console.log(response, 'res')
  return Promise.resolve(response)
}

/**
 * @description 更新摄像头配置
 * @param data
 */
export const updateVideoConfig = (data): void => {
  window.electronApi.updateVideoConfig(data).then((response) => {
    console.log('DB updated:', response)
  })
}
