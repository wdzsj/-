<template>
  <div id="getup-record">
    <h1 class="main-title">报修</h1>
    <div class="top-wrapper">
      <div class="left-wrapper">
        <RecordButton
          btn-color="#1890ff"
          @updateData="handleSubmit"
        ></RecordButton>
      </div>
      <div class="right-wrapper">
        <RecordList
          @change="handleSelectedChange"
          :repairsData="repairsData"
          :roomId="roomId"
        ></RecordList>
      </div>
    </div>

    <div class="botttom-wrapper">
      <div class="main-card form-wrapper">
        <!-- 报修表单 -->
        <el-form :model="repairFrom" ref="repairFrom" label-width="100px">
          <el-form-item label="维修类型">
            <el-select
              v-model="repairFrom.repairType"
              placeholder="请选择维修类型"
            >
              <el-option label="电器故障" value="电器故障"></el-option>
              <el-option label="水电维修" value="水电维修"></el-option>
              <el-option label="门窗维修" value="门窗维修"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="问题描述" prop="content" required>
            <el-input type="textarea" v-model="repairFrom.content"></el-input>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <!-- 报修-->
    <h1 class="main-title">报修记录</h1>
    <div class="botttom-wrapper">
      <div class="main-card form-wrapper">
        <!-- 记录 -->
        <RepairItem
          :repairsData="repairsData"
          @afterDel="fetchRepairData({ roomId})"
        ></RepairItem>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import RecordButton from './component/RecordButton'
import RecordList from './component/RecordList'
import RepairItem from './component/RepairItem'
import { getRepairs, addRepair } from '@/api/repair'

export default {
  name: 'Repair',
  components: {
    RecordButton,
    RecordList,
    RepairItem
  },
  data() {
    return {
      reqData: {},
      repairsData: [],
      repairFrom: {
        content: '',
        repairType: ''
      },
      n: []
    }
  },
  computed: {
    userId() {
      return this.$store.getters.allUserInfo.id
    },
    roomId() {
      return this.$store.getters.allUserInfo.roomId
    }
  },
  watch: {},
  methods: {
    handleSelectedChange(val) {
      const now = new Date()
      const isDay = new Date(now.getTime() - val * 24 * 60 * 60 * 1000)
      // console.log(isDay,val+'天前')
      const obj =this.roomId? { roomId: this.roomId, isDay: isDay }:{userId: this.userId, isDay: isDay}
      this.fetchRepairData(obj)
    },

    handleSubmit() {
      if(!this.roomId){
        this.$message.error('请先租赁')
        return false
      }
      this.$refs.repairFrom.validate(result => {
        if (result) {
          addRepair({
            repairType: this.repairFrom.repairType,
            content: this.repairFrom.content,
            roomId: this.roomId
          }).then(() => {
            this.$message.success('报修已提交')
            this.fetchRepairData({roomId:this.roomId})
          })
        } else {
          this.$message.error('请填充完整信息')
        }
      })
    },
    async fetchRepairData(obj) {
      this.repairsData = (await getRepairs(obj)).data.repairs
      console.log(this.repairsData);
    }
  },

  mounted() {
    const obj = { roomId: this.roomId }
    if (this.roomId ) {
      this.fetchRepairData(obj)
    }
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
  }
}
</style>
