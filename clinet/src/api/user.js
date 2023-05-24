import request from '@/utils/request'

export function register(data) {
  return request({
    url: '/user/register',
    method: 'post',
    data
  })
}

export function login(data) {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}

export function getInfo() {
  return request({
    url: '/user/info',
    method: 'get'
  })
}

export function updateInfo(data) {
  return request({
    url: '/user/updateInfo',
    method: 'post',
    data
  })
}

/**
 * 获取用户，传递的 url query 分为以下情况：
  1. 空参数：获取系统内所有的学生用户
  2. ?buildingId=[]: 获取对应宿舍楼的用户
  3. ?floorId=[]: 获取对应楼层的用户
  4. ?roomId=[]: 获取对应房间的用户
 */
export function getUsers(params) {
  return request({
    url: '/user/getUsers',
    method: 'get',
    params
  })
}

export function searchAdmin(keywords) {
  return request({
    url: '/user/searchAdmin',
    method: 'get',
    params: { keywords }
  })
}

export function searchUser(keywords) {
  return request({
    url: '/user/searchUser',
    method: 'get',
    params: { keywords }
  })
}

export function addAdmin({ name, account, phone, password, role }) {
  return request({
    url: '/user/addAdmin',
    method: 'post',
    data: { name, account, phone, password, role }
  })
}

export function getAdminTableData() {
  return request({
    url: '/user/getAdminTableData',
    method: 'get'
  })
}

export function setAdminTableData(newAdmin) {
  return request({
    url: '/user/setAdminTableData',
    method: 'post',
    data:newAdmin
  })
}

export function delAdminTableData(id) {
  return request({
    url: '/user/delAdminTableData',
    method: 'post',
    data:{id}
  })
}

export function getUserInfoByIdOrAccount({ type = 'id', value }) {
  console.log('value: ', value)
  return request({
    url: '/user/getUserInfoByIdOrAccount',
    method: 'get',
    params: { type, value }
  })
}

export function addCheckUser(userData,id) {
  return request({
    url: '/user/addCheckUser'+id,
    method: 'put',
   data:userData,
   
  })
}

export function removeCheckUser(id) {
  return request({
    url: '/user/removeCheckUser'+id,
    method: 'put',
   
  })
}

export function addTerm(ids,term) {
  return request({
    url: '/user/addTerm',
    method: 'post',
    data:{ids,term},
  })
}

export function removeUser(id) {
  return request({
    url: '/user/removeUser',
    method: 'post',
    data:{id},
  })
}

export function updateUserInfo(data) {
  return request({
    url: '/user/updateUserInfo',
    method: 'post',
    data,
  })
}

export function createUser(data,option={}) {
  return request({
    url: '/user/createUser',
    method: 'post',
    data:{data,option},
  })
}

export function getUserInfoForExport() {
  return request({
    url: '/user/getUserInfoForExport',
    method: 'get'
  })
}

export function exportTemplate() {
  return request({
    url: '/user/exportTemplate',
    method: 'get'
  })
}

export function applyRelet(id) {
  return request({
    url: '/user/applyRelet'+id,
    method: 'put'
  })
}

export function getReletUser() {
  return request({
    url: '/user/getReletUser',
    method: 'get'
  })
}

export function handleRelet(ids) {
  return request({
    url: '/user/handleRelet',
    method: 'post',
    data:{ids}
  })
}