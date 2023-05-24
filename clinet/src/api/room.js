import request from '@/utils/request'

export function getRooms(params) {
  return request({
    url: '/room/getRooms',
    method: 'get',
    params
  })
}

export function getRoomInfo(roomId) {
  return request({
    url: '/room/getRoomInfo',
    method: 'get',
    params: { roomId }
  })
}
  export function setRoomTableData(roomData,id) {
    return request({
      url: '/room/setRoomTableData'+id,
      method: 'put',
     data:roomData,
     
    })

}
export function delRoomTableData(roomIds) {
  return request({
    url: '/room/delRoomTableData',
    method: 'post',
   data:{roomIds}
  })

}
export function getRoomType(params) {
  return request({
    url: '/room/getRoomType',
    method: 'get',
    params
  })
}

export function addRoomUser(userData,roomId) {
  return request({
    url: '/room/addRoomUser'+roomId,
    method: 'put',
   data:userData,
   
  })
}

export function searchRoom(keywords) {
  return request({
    url: '/room/searchRoom',
    method: 'get',
    params: { keywords }
  })
}

export function addRoom(data) {
  return request({
    url: '/room/addRoom',
    method: 'post',
   data
  })

}

export function roomOccupancy() {
  return request({
    url: '/room/roomOccupancy',
    method: 'get',
  })
}
export function userDistribution() {
  return request({
    url: '/room/userDistribution',
    method: 'get',
  })
}

export function getBuildingRoomData() {
  return request({
    url: '/room/getBuildingRoomData',
    method: 'get',
  })
}

