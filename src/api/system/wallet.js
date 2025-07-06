import request from '@/utils/request'

// 查询钱包管理列表
export function listWallet(query) {
  return request({
    url: '/system/wallet/list',
    method: 'get',
    params: query
  })
}
// 查询钱包管理列表
export function listWalletByRole(query) {
  return request({
    url: '/system/wallet/list',
    method: 'get',
    params: query
  })
}

// 查询钱包管理详细
export function getWallet(id) {
  return request({
    url: '/system/wallet/' + id,
    method: 'get'
  })
}

// 新增钱包管理
export function addWallet(data) {
  return request({
    url: '/system/wallet',
    method: 'post',
    data: data
  })
}

// 修改钱包管理
export function updateWallet(data) {
  return request({
    url: '/system/wallet',
    method: 'put',
    data: data
  })
}

// 删除钱包管理
export function delWallet(id) {
  return request({
    url: '/system/wallet/' + id,
    method: 'delete'
  })
}
export function getWalletBalance(query) {
  return request({
    url: '/system/wallet/get_wallet_balance',
    method: 'get',
    params: query
  })
}
export function buySymbol(data) {
  return request({
    url: '/system/wallet/buy_symbol',
    method: 'post',
    data: data
  })
}