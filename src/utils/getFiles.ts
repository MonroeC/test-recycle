const fs = require('fs')
const path = require('path')
const getFiles = function (dir) {
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
  return res
}

export default getFiles
