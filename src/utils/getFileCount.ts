const fs = require('fs')
const path = require('path')
const getFileCount = function (dir) {
  const res: any = []
  function traverse(dir) {
    fs.readdirSync(dir).forEach((file) => {
      const pathname = path.join(dir, file)
      if (fs.statSync(pathname).isDirectory()) {
        traverse(pathname)
      } else {
        res.push(pathname)
      }
    })
  }
  traverse(dir)
  return res?.length
}
// 获取文件个数的函数
// const getFileCount = (filePath: any) => {
//   try {
//     const files = fs.readdirSync(filePath)
//     const fileCount = files.length
//     return fileCount
//   } catch (error) {
//     console.error('Error reading directory:', error)
//     return 0
//   }
// }
export default getFileCount
