<template>
<div>
  <div class="room-evaluation" v-if="repairsData.length!==0">
    <el-row :gutter="30">
      <el-col v-for="repair in repairsData" :md="8" :key="repair.id" >
        <div class="repair-item">
          <div class="top" :style="{ background: getColor(repair.repairType) }">
            <div class="repairType">
              类型：<span>{{ repair.repairType }}</span>
            </div>
             <div class="level">{{ getLevel(repair.createdAt,repair.updatedAt) }}</div>
              <div class="finishDate">{{ getFinishDate(repair.createdAt,repair.updatedAt) | formatDate('YYYY年MM月DD日 HH:mm')}}</div>
          </div>
          <div class="center">
            <div class="content">问题描述：{{ repair.content }}</div>
          </div>
          <div class="bottom">
            <div class="creator">
              <span style="margin-right: 5px"
                >报修人: {{ repair.userName }}</span
              >
            
            </div>
            <div class="time">
              {{ repair.createdAt | formatDate('YYYY年MM月DD日 HH:mm') }}
            </div>
              <el-button
                :disabled="repair.userId !== userId"
                size="mini"
                type="danger"
                @click="handleDelete(repair.id)"
                >删除</el-button
              >
          </div>
        </div>
      </el-col>
    </el-row>
   
  </div>
   <div class="tips" v-else>= 暂无报修 =</div>
  </div>
</template>

<script>
import { removeRepair} from '@/api/repair'
export default {
  data() {
    return {
        
    }
  },
  props: {
    repairsData: {
     type:Array,
      required: true
    }
  },
  computed: {
    userId() {
      return this.$store.getters.allUserInfo.id
    }
  },
   mounted() {
    
   },
  methods: {
    getLevel(c,u) {
      if (c!== u) {
        return '完成'
      } else {
        return '待办'
      }
    },
    getFinishDate(c,u) {
      if (c!== u) {
        return  u 
      } else{
        return false
      }
    },
    getColor(repairType) {
      if (repairType == '水电维修') {
        return '#1890ff'
      } else if (repairType == '门窗维修') {
        return '#FFBA00'
      } else {
        return '#ff4949'
      }
    },
    handleDelete(repairId) {
      this.$confirm('确认要删除该条记录吗', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeRepair(repairId).then(() => {
          this.$message.success('删除成功')
          this.$emit('afterDel')
        })
      })
    },
    
    
  }
}
</script>

<style lang="scss" scoped>
.repair-item {
  background-color: #fff;
  margin-bottom: 30px;
  border-radius: 5px;
  overflow: hidden;
  .top {
    display: flex;
    position: relative;
    justify-content: space-between;
    font-size: 18px;
    padding: 20px;
    color: #fff;
    font-weight: bold;
     .finishDate{
        position: absolute;
        bottom:  0px;
        right: 1px;
        font-size: 6px;
        
      }
  }
  .center {
    min-height: 100px;
    padding: 0 20px;
    padding-top: 20px;
    box-sizing: content-box;
    background-color: #f5f5f5;
  }
  .bottom {
    padding: 20px;
    text-align: right;
    color: rgba($color: #000000, $alpha: 0.5);
    // display: flex;
    // justify-content: space-between;
    // align-items: center;
    background-color: #f5f5f5;
  }
}
.tips {
  width: 100%;
  background-color: #fff;
  padding: 20px;
  text-align: center;
  color: rgba($color: #000000, $alpha: 0.5);
}
</style>
