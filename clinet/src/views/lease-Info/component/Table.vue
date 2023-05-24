<template>
  <div class="table">
    <div class="tag">
       <el-tag @click="toggleData">{{ dataLabel }}</el-tag>
    </div>
   

    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="peopleNum" label="户型" sortable></el-table-column>
      <el-table-column prop="rent" label="租金" sortable> </el-table-column>
      <el-table-column prop="term" label="租期/月"> 1</el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isData1: 0,
      text: '',
    }
  },
  props: {
    tableData: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    dataLabel() {
      switch (this.isData1) {
        case 0:
          this.text = '全部'
          break
        case 1:
          this.text = '整租'
          break
        case 2:
          this.text = '合租'
          break
        default:
          break
      }
      return this.text
    }
  },
  methods: {
    toggleData() {
      this.isData1 += 1
      if (this.isData1 > 2) {
        this.isData1 = 0
      }
      // 发送请求更新数据
       switch (this.isData1) {
        case 0:
          this.text = '全部'
          this.$emit('change')
          break
        case 1:
          this.text = '整租'
          this.$emit('change',{peopleNum:1})
          break
        case 2:
          this.text = '合租'
          this.$emit('change',{peopleNum:2})
          break
        default:
          break
      }
    },
   
  }
}
</script>

<style lang="scss" scoped>
.table{
  position: relative;
  // padding: 1px;
  padding-top: 20px;
  .tag {
  
  position: absolute;
  left: 0px;
  top: 30px;
  z-index: 10;
  cursor: pointer;
  
  .el-tag{
         background-color: #f5f5f5;
         border: none;
  }
}
}

</style>
