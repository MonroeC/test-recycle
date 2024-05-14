import uuid from 'node-uuid'
const fs = require('fs')
const path = require('path')
const moveFiles = (sourceDir, targetDir, callBack, db) => {
  try {
    // 确保目标文件夹存在
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir)
    }
    const files = fs.readdirSync(sourceDir)

    // 过滤出图片文件，这里假设是jpeg格式，可根据需要调整
    const images = files.filter((file) => path.extname(file).toLowerCase() === '.jpg')
    console.log(images, 'images')
    // 每两个文件一组进行处理

    for (let i = 0; i < images.length; i += 2) {
      // 为这一组创建一个新的目录
      const uuidTemp = uuid.v4()
      const groupFolder = path.join(targetDir, uuidTemp)
      fs.mkdirSync(groupFolder)
      // 将这两张图片移动到新目录
      for (let j = 0; j < 2; j++) {
        if (i + j < images.length) {
          const sourceFile = path.join(sourceDir, images[i + j])
          const targetFile = path.join(groupFolder, images[i + j])
          db.get('recycleInfos')
            .push({
              isUpload: 0,
              filePath: targetFile,
              parentPath: `${targetDir}/${uuidTemp}`
            })
            .write()
          fs.renameSync(sourceFile, targetFile)
          console.log('remove')
        }
      }
    }
    callBack()
  } catch (error) {
    console.log(error, 'error')
  }
}
export default moveFiles
