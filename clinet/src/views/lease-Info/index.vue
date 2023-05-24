<template>
  <div id="getup-record">
    <h1 class="main-title">房屋信息</h1>

    <div class="botttom-wrapper">
      <!-- 选择器 -->
      <el-tabs type="border-card">
        <el-tab-pane label="搜索">
          <RoomSearcher v-model="searchContent" :table-data="roomLeaseInfo" />
          <el-button
            type="primary"
            @click="fetchRoomTypeData({ rent: searchContent })"
            >搜索</el-button
          >
        </el-tab-pane>
        <el-tab-pane label="租赁">
          <div>
            <el-button type="primary" @click="applyRelet">{{relet?'已提交申请':'申请续租'}}</el-button>
            <el-button type="danger" @click="exportContract"
              >导出合同</el-button
            >
            <span>首次租赁或合同已过期请完善个人信息，联系管理员签合同</span>
          </div>
        </el-tab-pane>
      </el-tabs>
      <!-- 选择器 -->
      <Table :table-data="roomLeaseInfo" @change="fetchRoomTypeData"></Table>
    </div>
  </div>
</template>

<script>
import RoomSearcher from './component/RoomSearcher.vue'
import Table from './component/Table'
import { getRoomType } from '@/api/room.js'

import { exportTemplate, applyRelet,getInfo } from '@/api/user'
export default {
  name: 'BackRecord',
  components: {
    Table,
    RoomSearcher
  },
  data() {
    return {
      btnDisable: true,
      searchContent: '',
      selectorData: {
        buildingId: null,
        floorId: null,
        roomId: null,
        userId: null
      },
      roomLeaseInfo: []
    }
  },
  computed: {
    userId() {
      return this.$store.getters.allUserInfo.id
    },
    roomId() {
      return this.$store.getters.allUserInfo.roomId
    },
    relet() {
      return this.$store.getters.allUserInfo.relet
    }
  },
  watch: {
    userBackRecords(newVal) {
      if (newVal[0].time) {
        this.btnDisable = true
      } else {
        this.btnDisable = false
      }
    }
  },
  methods: {
    async exportContract() {
      const res = (await exportTemplate()).data.url
      window.location.href = res
    },
    async fetchRoomTypeData(obj = {}) {
      const res = (await getRoomType(obj)).data.rooms
      this.roomLeaseInfo = res
      
    },
    handleSelectedChange(value) {
      this.days = value
    },
    async applyRelet() {
      if(!this.relet){
        await applyRelet(this.userId)
      const res=  (await getInfo()).data
      this.$store.commit('user/SET_ALLUSERINFO', res)
      }
      
    }
  },
  mounted() {
    this.fetchRoomTypeData()
  }
}
</script>

<style lang="scss" scoped>
#getup-record {
  padding: 50px 60px 0px;
  .top-wrapper {
    display: flex;
    margin: 40px 0;
    .left-wrapper {
      background-color: #fff;
      border-radius: 5px;
      padding: 30px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .right-wrapper {
      background-color: #fff;
      margin-left: 20px;
      border-radius: 5px;
      width: 100%;
      padding: 20px;
    }
  }
  .botttom-wrapper {
    margin: 40px 0;
    background-color: #fff;
    border-radius: 5px;
    padding: 20px;
    text-align: center;
  }
  .el-tab-pane {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }
  >>> .el-tabs__content {
    padding: 40px 20px;
    width: 100%;
  }
}
</style>
