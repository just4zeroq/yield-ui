import request from '@/utils/request'

// 查询订单信息列表
export function listOrder(query) {
  return request({
    url: '/system/order/list',
    method: 'get',
    params: query
  })
}
// 查询所有订单信息
export function listAllInvestments(query) {
  return request({
    url: '/system/order/invest_summary',
    method: 'get',
    params: query
  })
}
export function stakeToken(query) {
  return request({
    url: '/system/order/stake_token',
    method: 'post',
    params: query
  })
}
// 查询订单信息详细
export function getOrder(id) {
  return request({
    url: '/system/order/order/' + id,
    method: 'get'
  })
}

// 新增订单信息
export function addOrder(data) {
  return request({
    url: '/system/order',
    method: 'post',
    data: data
  })
}

// 新增订单信息
export function createOrder(data) {
  return request({
    url: '/system/order/create_order',
    method: 'post',
    data: data
  })
}

// 修改订单信息
export function updateOrder(data) {
  return request({
    url: '/system/order',
    method: 'put',
    data: data
  })
}

// 删除订单信息
export function delOrder(id) {
  return request({
    url: '/system/order/' + id,
    method: 'delete'
  })
}
