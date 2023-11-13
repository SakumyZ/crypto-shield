import crypto from 'node:crypto'
import kleur from 'kleur'
import config from '../config.json'

const algorithm = 'aes-256-cbc'
const initVector = Buffer.from(config.initVector, 'utf-8')

let key = config.secretKey

if (key.length <= 32) {
  key += 'X'.repeat(32 - key.length)
} else {
  console.log(kleur.red('Secret key length must be less than 32'))
  process.exit(1)
}

const secretKey = Buffer.from(key, 'utf-8')

const REG_LETTER: RegExp = /[a-zA-Z]/

const enObfuscation = (encryptedData: string) => {
  let res = ''

  for (let index = 0; index < encryptedData.length; index++) {
    let element = encryptedData[index]

    // 判断是否为字母
    if (REG_LETTER.test(element) && index % 2 === 0) {
      // 将小写字母转为大写
      element = element.toUpperCase()

      // 将 f 转换为!
      element = element === 'F' ? '!' : element
    }

    res += element
  }

  return res
}

const deObfuscation = (encrypted: string) => {
  // 将生成代码中部分字母转为小写
  // 将 ! 转换为f
  let res = ''

  for (let index = 0; index < encrypted.length; index++) {
    let element = encrypted[index]

    // 将 ! 转换为 F
    if (element === '!') {
      element = 'F'
    }

    // 判断是否为字母
    if (REG_LETTER.test(element) && index % 2 === 0) {
      // 将小写字母转为大写

      element = element.toLowerCase()
    }

    res += element
  }

  return res
}

export const encrypt = (text: string) => {
  const cipher = crypto.createCipheriv(algorithm, secretKey, initVector)

  let encryptedData = cipher.update(text, 'utf-8', 'hex')

  encryptedData += cipher.final('hex')
  return enObfuscation(encryptedData)
}

export const decrypted = (encrypted: string) => {
  const res = deObfuscation(encrypted)

  const decipher = crypto.createDecipheriv(algorithm, secretKey, initVector)

  let decryptedData = decipher.update(res, 'hex', 'utf-8')

  decryptedData += decipher.final('utf8')

  return decryptedData
}

const run = () => {
  const params: string[] = process.argv.slice(2)

  if (params.length === 0) {
    console.log(kleur.red('Please enter the text to be encrypted'))
    process.exit(1)
  }

  const encrypted = encrypt(params[0])
  console.log(kleur.blue('Encrypted text:'), encrypted)
}

run()
