<template>
  <div id="RoomInfo" class="page-wrapper">
     <!-- <div class="wrapper">
      <PanelGroup :roomInfo="roomInfo" />
    </div> -->
    <!-- 宿舍基础信息 -->
    <h1 class="main-title">
      选择器
    </h1>
    <div class="wrapper ">

      <el-tabs type="border-card">
        <el-tab-pane label="按账号搜索">
          <RoomSearcher @getRoomsInfo='getRoomsInfo' />
          
        </el-tab-pane>

        <el-tab-pane label="级联选择">
          <GroupSelector :selectorData="selectorData" />
          <el-button
        type="primary"
        round
        @click="getRoomsInfo(selectorData)"
        >检索宿舍</el-button
      >
        </el-tab-pane>
      </el-tabs>
      
      
    </div>
   
    <!-- 宿舍基础信息 -->

    <!-- 宿舍成员 -->
    <h1 class="main-title">房间基本信息</h1>
    <div class="wrapper main-card">
      <RoomsTable :table-data="rooms" @getRoomInfo='fetchRoomInfo'/>
      <Pagination
        :total="count"
        :page="current"
        @pagination="handlePagination"
        
      />
    </div>
    <!-- 宿舍成员 -->

   
  </div>
</template>

<script>
import GroupSelector from '@/components/GroupSelector'
import PanelGroup from './components/PanelGroup'
import RoomsTable from './components/RoomsTable'
import Pagination from '@/components/Pagination'
import RoomSearcher from './components/RoomSearcher'

import _ from 'lodash'
import { getRoomInfo, getRooms } from '@/api/room'

export default {
  name: 'roomManage',
  components: {
    GroupSelector,
    PanelGroup,
    RoomsTable,
    Pagination,
    RoomSearcher
  },
  data() {
    return {
      roomInfo: {},
      buildingInfo: {},
      floorInfo: {},
      users: [],
      rooms: [],
      selectorData: {
        buildingId: null,
        floorId: null,
        roomId: null
      },
     current: 1,
      count: 0,
      step: 10,
      searchContent:'',
    }
  },
  watch: {
    '$route.query.roomId': function(newVal) {
      if (newVal && this.$route.name === 'roomManage') {
        this.getRoomsInfo({roomId:newVal})
      }
    }
  },
  mounted() {
    // const roomId = this.$route.query.roomId
    // if (roomId) {
    //  this.getRoomsInfo({roomId})
    // }
     this.getRoomsInfo()
  },
 
  methods: {
    async fetchRoomInfo(roomId) {
      const roomInfo = (await getRoomInfo(roomId)).data
      this.roomInfo = roomInfo
      this.buildingInfo = roomInfo.building
      this.users = roomInfo.users
     
    },
    handleSearchRoom() {
     
    },
   
  async  getRoomsInfo(params = {}) {
      params.page = this.current
      params.limit = this.step
     let {rooms,pageSize}= (await getRooms(params)).data
   
     this.rooms = _.cloneDeep(rooms);
     this.count=pageSize
      // console.log('rooms',this.rooms);
    },
      handlePagination({ page, limit }) {
      this.current = page
      this.step = limit
      this.getRoomsInfo()
    },
  }
}
</script>

<style lang="scss" scoped>
#RoomInfo {
  > .wrapper {
    margin: 40px 0;
  }
  .selector-wrapper {
    display: flex;
    justify-content: space-between;
  }
  .form-wrapper {
    margin-bottom: 40px;
    .btn-wrapper {
      display: flex;
      flex-direction: row-reverse;
    }
  }
  .el-tab-pane {
  display: flex;
  align-items: center;
}
}
</style>
