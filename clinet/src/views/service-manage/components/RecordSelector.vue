<template>
  <div class="record-selector">
    <h1 class="main-title">筛选选择器</h1>
    <div class="main-card wrapper">
      <div class="input-group">
        <GroupSelector
          :selectorData="selectorData"
          v-if="$props.type === 'repair'"
        />
        <span style="margin-right: 22px" v-if="$props.type === 'notice'"
          >管理员</span
        >

        <AdminSearcher
          v-if="$props.type === 'notice'"
          :selectorData="selectorData"
        />
        <!-- <el-input v-model="input" placeholder="请输入内容" v-if="$props.type === 'notice'"></el-input> -->
      </div>
      <div class="input-group">
        <span style="margin-right: 22px">日期</span>
        <el-date-picker
          v-model="date"
          type="daterange"
          align="right"
          unlink-panels
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="pickerOptions"
        >
        </el-date-picker>
      </div>
      <div class="btn-wrapper">
        <el-button
          @click="handleSubmit"
          type="primary"
          icon="el-icon-search"
          circle
        ></el-button>
      </div>
    </div>
  </div>
</template>

<script>
import GroupSelector from '@/components/GroupSelector'
import AdminSearcher from './NoticeTable/AdminSearcher.vue'
import { searchAdmin } from '@/api/user'
export default {
  name: 'record-selector',
  components: {
    GroupSelector,
    AdminSearcher
  },
  data() {
    return {
      selectedAdminAccount: '',
      selectorData: {
        buildingId: null,
        floorId: null,
        roomId: null,
        userId: null,
        account: null
      },
      pickerOptions: {
        shortcuts: [
          {
            text: '最近一周',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            }
          }
        ]
      },
      date: []
    }
  },
  props: ['type'],
  methods: {
    handleSubmit() {
      const data = {}
      for (let key in this.selectorData) {
        if (this.selectorData[key]) {
          data[key] = this.selectorData[key]
        }
      }
      if (this.date) {
        data.startTime = (new Date(this.date[0])).toDateString();


        
        data.endTime =  (new Date(this.date[1])).toDateString()
        
      }
      const { buildingId, floorId, ...datas } = data
     
      // console.log(datas,'参数');
      this.$emit('onSubmit', datas)
    }
  }
}
</script>

<style lang="scss" scoped>
.wrapper {
  margin: 40px 0;
  position: relative;
  overflow: visible;
  .input-group:first-child {
    margin-bottom: 20px;
  }
  .btn-wrapper {
    position: absolute;
    right: 30px;
    bottom: -25px;
    .el-button {
      width: 50px;
      height: 50px;
      box-shadow: 0 3px 5px rgba($color: #000000, $alpha: 0.2);
    }
  }
}
</style>
