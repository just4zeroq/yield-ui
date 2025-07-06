// 引入 localforage
import localforage from 'localforage';

// 设置数据表名称
const STORE_NAME = 'account';

/**
 * 生成组合主键
 * @param {string} userId - 用户 id
 * @param {string} appKey - app 密钥
 * @returns {string} - 组合后的主键
 */
const generatePrimaryKey = (userId, appKey) => {
  return `${STORE_NAME}:${userId}:${appKey}`;
};

/**
 * 添加账户信息到 indexedDB
 * @param {Object} account - 账户对象，包含用户 id、app_key、app_sec
 * @returns {Promise} - 包含操作结果的 Promise 对象
 */
const addAccount = async (account) => {
  try {
    // 生成创建时间
    const createdAt = new Date().toISOString();
    const accountData = {
      ...account,
      createdAt
    };
    // 生成组合主键
    const key = generatePrimaryKey(account.userId, account.apiKey);
    // 将账户信息存入 indexedDB
    await localforage.setItem(key, accountData);
    return accountData;
  } catch (error) {
    console.error('添加账户信息时出错:', error);
    throw error;
  }
};

/**
 * 根据用户 id 和 app_key 获取账户信息
 * @param {string} userId - 用户 id
 * @param {string} appKey - app 密钥
 * @returns {Promise} - 包含账户信息的 Promise 对象
 */
const getAccount = async (userId, apiKey) => {
  try {
    // 生成组合主键
    const key = generatePrimaryKey(userId, apiKey);
    // 从 indexedDB 中获取账户信息
    return await localforage.getItem(key);
  } catch (error) {
    console.error('获取账户信息时出错:', error);
    throw error;
  }
};

/**
 * 获取所有账户信息
 * @returns {Promise} - 包含所有账户信息的 Promise 对象
 */
const getAllAccounts = async () => {
  try {
    const accounts = [];
    // 遍历 indexedDB 中的所有键值对
    await localforage.iterate((value, key) => {
      if (key.startsWith(STORE_NAME + ':')) {
        accounts.push(value);
      }
    });
    return accounts;
  } catch (error) {
    console.error('获取所有账户信息时出错:', error);
    throw error;
  }
};

/**
 * 根据用户 id 和 app_key 删除账户信息
 * @param {string} userId - 用户 id
 * @param {string} appKey - app 密钥
 * @returns {Promise} - 包含操作结果的 Promise 对象
 */
const deleteAccount = async (userId, appKey) => {
  try {
    // 生成组合主键
    const key = generatePrimaryKey(userId, appKey);
    // 从 indexedDB 中删除账户信息
    await localforage.removeItem(key);
  } catch (error) {
    console.error('删除账户信息时出错:', error);
    throw error;
  }
};

/**
 * 根据用户 id 获取用户的所有钱包信息
 * @param {string} userId - 用户 id
 * @returns {Promise<Array>} - 包含用户所有钱包信息的数组的 Promise 对象
 */
const getAllAccountsByUserId = async (userId) => {
  try {
    const wallets = [];
    const prefix = `${STORE_NAME}:${userId}:`;
    // 遍历 indexedDB 中的所有键值对
    await localforage.iterate((value, key) => {
      if (key.startsWith(prefix)) {
        wallets.push(value);
      }
    });
    return wallets;
  } catch (error) {
    console.error('根据用户 id 获取钱包信息时出错:', error);
    throw error;
  }
};

// 导出工具函数
export { addAccount, getAccount, getAllAccounts, deleteAccount, getAllAccountsByUserId };