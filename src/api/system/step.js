import request from '@/utils/request'

// 查询订单拆分大步骤列表
export function listStep(query) {
  return request({
    url: '/system/step/list',
    method: 'get',
    params: query
  })
}

// 查询订单拆分大步骤详细
export function getStep(id) {
  return request({
    url: '/system/step/' + id,
    method: 'get'
  })
}

// 新增订单拆分大步骤
export function addStep(data) {
  return request({
    url: '/system/step',
    method: 'post',
    data: data
  })
}

// 修改订单拆分大步骤
export function updateStep(data) {
  return request({
    url: '/system/step',
    method: 'put',
    data: data
  })
}
// 修改订单拆分大步骤
export function updateStepConfig(data) {
  return request({
    url: '/system/step/update_config',
    method: 'post',
    data: data
  })
}
// 删除订单拆分大步骤配置
export function delStep(id) {
  return request({
    url: '/system/step/' + id,
    method: 'delete'
  })
}
