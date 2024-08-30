const wmic = require("node-wmic");
const crypto = require('crypto');
const biosFun = async () => {
  let [bios_item] = await wmic.BIOS()
  console.log('BIOS.SerialNumber=' + bios_item.SerialNumber);
  // cpu序列号
  let [cpus_item] = await wmic.CPU()
  console.log('CPU.ProcessorId=' + cpus_item.ProcessorId)
  // 计算机序列号
  let disks_item = await wmic.DiskDrive()
  let disksString = '';
  disks_item.forEach((element, index) => {
    disksString = disksString + (index == 0 ? '' : '@') + element.SerialNumber
  });
  console.log('DiskDrive[0].SerialNumber=' + disks_item[0].SerialNumber);
  // 主板 uuid
  let [csproduct_item] = await wmic.CSProduct()
  console.log('CSProduct.UUID=' + csproduct_item.UUID);
  const License = bios_item.SerialNumber.replace(/\s*/g, '') + cpus_item.ProcessorId.replace(/\s*/g, '') + disksString.replace(/\s*/g, '') + csproduct_item.UUID.replace(/\s*/g, '')
  const hash = crypto.createHash('md5').update(License).digest('hex');
  return {
    uuid: hash
  }
}

export default biosFun