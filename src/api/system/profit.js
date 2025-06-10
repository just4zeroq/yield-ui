import request from '@/utils/request'

// 查询实际收益信息记录列表
export function listProfit(query) {
  return request({
    url: '/system/profit/list',
    method: 'get',
    params: query
  })
}

// 查询实际收益信息记录详细
export function getProfit(id) {
  return request({
    url: '/system/profit/' + id,
    method: 'get'
  })
}

// 查询实际收益信息记录详细
export function getLatestProfit() {
  return request({
    url: '/system/profit/latest_profit' ,
    method: 'get'
  })
}

// 新增实际收益信息记录
export function addProfit(data) {
  return request({
    url: '/system/profit',
    method: 'post',
    data: data
  })
}

// 修改实际收益信息记录
export function updateProfit(data) {
  return request({
    url: '/system/profit',
    method: 'put',
    data: data
  })
}

// 删除实际收益信息记录
export function delProfit(id) {
  return request({
    url: '/system/profit/' + id,
    method: 'delete'
  })
}
