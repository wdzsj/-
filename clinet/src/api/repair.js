import request from '@/utils/request'


export function getRepairs(params) {
  return request({
    url: '/repair/getRepairs',
    method: 'get',
    params
  })
}


export function removeRepair(ids) {
  return request({
    url: '/repair/removeRepairs',
    method: 'post',
    data: { ids } // 传入要删除的 ids 数组
  })
}


export function handleRepair(ids) {
  return request({
    url: '/repair/handleRepairs',
    method: 'put',
   data:{ids},
   
  })

}

export function updateRepair(id,repairData) {
  return request({
    url: '/repair/updateRepair'+id,
    method: 'put',
   data:repairData
  })
}

export function addRepair(data) {
 
  return request({
    url: '/repair/addRepair',
    method: 'post',
    data,
  })
}