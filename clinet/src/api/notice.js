import request from '@/utils/request'

/**
 * ，传入的 url query 分为以下情况：
  1. ?userId=[] 获取创建者创建的评价
  2. ?roomId=[] 获取该房间的评价
 */
export function getNotices(params) {
  return request({
    url: '/notice/getNotices',
    method: 'get',
    params
  })
}

export function destroyNotice(id) {
  return request({
    url: '/notice/destroyNotice',
    method: 'post',
    data:{id}
  })
}

export function restoreNotice(id) {
  return request({
    url: '/notice/restoreNotice',
    method: 'put',
   data:{id}
  })
}

export function removeNotice(id) {
  return request({
    url: '/notice/removeNotice',
    method: 'post',
   data:{id}
  })
}

export function addNotice(data) {
  return request({
    url: '/notice/addNotice',
    method: 'post',
    data,
  })
}

export function updateNotice(id,noticeData) {
  return request({
    url: '/notice/updateNotice'+id,
    method: 'put',
   data:noticeData
  })
}