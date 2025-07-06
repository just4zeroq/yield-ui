import JSEncrypt from 'jsencrypt/bin/jsencrypt.min'
import MD5 from 'crypto-js/md5';
import * as CryptoJS from 'crypto-js'
// 密钥对生成 http://web.chacuo.net/netrsakeypair

const publicKey = 'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKoR8mX0rGKLqzcWmOzbfj64K8ZIgOdH\n' +
  'nzkXSOVOZbFu/TJhZ7rFAN+eaGkl3C4buccQd/EjEsj9ir7ijT7h96MCAwEAAQ=='

const privateKey = 'MIIBVAIBADANBgkqhkiG9w0BAQEFAASCAT4wggE6AgEAAkEAqhHyZfSsYourNxaY\n' +
  '7Nt+PrgrxkiA50efORdI5U5lsW79MmFnusUA355oaSXcLhu5xxB38SMSyP2KvuKN\n' +
  'PuH3owIDAQABAkAfoiLyL+Z4lf4Myxk6xUDgLaWGximj20CUf+5BKKnlrK+Ed8gA\n' +
  'kM0HqoTt2UZwA5E2MzS4EI2gjfQhz5X28uqxAiEA3wNFxfrCZlSZHb0gn2zDpWow\n' +
  'cSxQAgiCstxGUoOqlW8CIQDDOerGKH5OmCJ4Z21v+F25WaHYPxCFMvwxpcw99Ecv\n' +
  'DQIgIdhDTIqD2jfYjPTY8Jj3EDGPbH2HHuffvflECt3Ek60CIQCFRlCkHpi7hthh\n' +
  'YhovyloRYsM+IS9h/0BzlEAuO0ktMQIgSPT3aFAgJYwKpqRYKlLDVcflZFCKY7u3\n' +
  'UP8iWi1Qw0Y='

// 加密
export function encrypt(txt) {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(publicKey) // 设置公钥
  return encryptor.encrypt(txt) // 对数据进行加密
}

// 解密
export function decrypt(txt) {
  const encryptor = new JSEncrypt()
  encryptor.setPrivateKey(privateKey) // 设置私钥
  return encryptor.decrypt(txt) // 对数据进行解密
}

export function hashString(input) {
  return MD5(input).toString();
}

// 加密函数
export function aesEncrypt(plainText, passwd) {
  // 处理密码长度：不足补0，超过截取前16位
  const processedPasswd = passwd.padEnd(16, '0').slice(0, 16);
  
  const key = CryptoJS.enc.Utf8.parse(processedPasswd);
  const iv = CryptoJS.enc.Utf8.parse(processedPasswd);
  
  const encrypted = CryptoJS.AES.encrypt(
    CryptoJS.enc.Utf8.parse(plainText),
    key,
    { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
  );
  
  return encrypted.toString();
}

// 解密函数
export function aesDecrypt(cipherText, passwd) {
  // 处理密码长度：不足补0，超过截取前16位
  const processedPasswd = passwd.padEnd(16, '0').slice(0, 16);
  
  const key = CryptoJS.enc.Utf8.parse(processedPasswd);
  const iv = CryptoJS.enc.Utf8.parse(processedPasswd);
  
  try {
    const decrypted = CryptoJS.AES.decrypt(
      cipherText,
      key,
      { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
    );
    
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    console.error('解密失败:', e);
    return '';
  }
}
