import request from '@/utils/request'

export function getFloors(params) {
  return request({
    url: '/floor/getFloors',
    method: 'get',
    params
  })
}

export function getFloorsDetail(data) {
  return request({
    url: '/floor/getFloorsDetail',
    method: 'get',
    params: data
  })
}

export function addCleanerToFloor(floorId, cleanerId) {
  return request({
    url: '/floor/addCleanerToFloor',
    method: 'post',
    data: { floorId, cleanerId }
  })
}
