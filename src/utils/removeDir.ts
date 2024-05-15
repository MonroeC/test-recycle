const fs = require('fs')

// path：要删除的文件夹路径
const removeFileDir = (path) => {
  try {
    const files = fs.readdirSync(path)
    for (const item of files) {
      const stats = fs.statSync(`${path}/${item}`)
      if (stats.isDirectory()) {
        removeFileDir(`${path}/${item}`)
      } else {
        fs.unlinkSync(`${path}/${item}`)
      }
    }
    fs.rmdirSync(path)
  } catch (error) {
    console.log(error, 'remove-error')
  }
}
export default removeFileDir
