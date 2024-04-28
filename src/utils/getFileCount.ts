const fs = require('fs')
const path = require('path')

// 获取文件个数的函数
const getFileCount = (filePath: any) => {
  try {
    const files = fs.readdirSync(filePath)
    const fileCount = files.length
    return fileCount
  } catch (error) {
    console.error('Error reading directory:', error)
    return 0
  }
}
export default getFileCount
