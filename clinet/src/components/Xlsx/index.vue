<template>
  <el-dropdown>
    <span class="el-dropdown-link"
      >导出 Excel<i class="el-icon-arrow-down el-icon--right"></i
    ></span>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item>
        <span @click="exportCurrent">导出当前</span></el-dropdown-item
      >
      <el-dropdown-item>
        <span @click="exportAll">导出全部</span></el-dropdown-item
      >
    </el-dropdown-menu>
  </el-dropdown>

  <!-- <el-button type="primary" @click="importExcel">导入 Excel</el-button>
    <input
      type="file"
      ref="fileInput"
      style="display:none"
      @change="handleFileChange"
    /> -->
</template>

<script>
import XLSX from 'xlsx'
import { getBuildingRoomData } from '@/api/room'
import { getUserInfoForExport } from '@/api/user'
export default {
  data() {
    return {
      tableData: [], // 表格数据
      title: '房间表'
    }
  },
  props: {
    data: {
      type: Array,
      default: () => []
    },
    headers: {
      type: Array,
      default: () => []
    },
    type: {
      type: String,
      required: true
    }
  },
  //  computed: {
  //   tableData() {
  //     return this.transformDataForExport(this.data)
  //   }
  // },

  methods: {
    // 数据转化
    transformDataForExport(data) {
      if (this.type === 'room') {
        const rows = data.map(obj => [
          obj.number,
          obj.buildingName,
          obj.peopleNum,
          obj.rent
        ])
        return [this.headers, ...rows]
      } else if (this.type === 'user') {
         const rows = data.map(obj => [
          obj.account,
          obj.name,
          obj.roomNumber,
          obj.phone,
          obj.rent
        ])
         return [this.headers, ...rows]
      }
    },
    // 导出 Excel
    exportCurrent() {
      const data = this.transformDataForExport(this.data)

      const ws = XLSX.utils.json_to_sheet(data)
      ws['A1'] = { t: 's', v: `房间信息` } // 直接设置单元格的值
      ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: data[0].length } }] // 合并单元格
      ws['A1'].s = { bold: true, alignment: { horizontal: 'center' } } // 设置单元格样式
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
      XLSX.writeFile(wb, 'table.xlsx')
    },

    async exportAll() {
      // const data = {}
     let title=''
      if (this.type === 'room') {
        this.tableData = (await getBuildingRoomData()).data
        title=`房间信息`
      } else if (this.type === 'user') {
       this.tableData  =(await getUserInfoForExport()).data
        title=`用户信息`
      }
      console.log(this.tableData);
      const wb = XLSX.utils.book_new() // 创建空的工作簿
      for (const groupName in this.tableData ) {
        const ws = XLSX.utils.json_to_sheet(this.tableData [groupName]) // 将每个组的数据转换为工作表对象
        ws['A1'] = { t: 's', v: groupName+title} // 直接设置单元格的值
        ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: groupName[0].length } }] // 合并单元格
        ws['A1'].s = { bold: true, alignment: { horizontal: 'center' } } // 设置单元格样式
        XLSX.utils.book_append_sheet(wb, ws, groupName) // 将工作表添加到工作簿中，工作表名称为组名
        XLSX.writeFile(wb, 'table.xlsx') // 导出Excel文件
      }
    },

    // 导入 Excel
    importExcel() {
      this.$refs.fileInput.click()
    },
    // 处理文件变化
    handleFileChange(e) {
      const files = e.target.files
      if (files && files.length > 0) {
        const reader = new FileReader()
        reader.onload = e => {
          const data = e.target.result
          const workbook = XLSX.read(data, { type: 'binary' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet)
          this.tableData = jsonData
        }
        reader.readAsBinaryString(files[0])
      }
    }
  }
}
</script>
<style scoped>
.el-dropdown-link {
  cursor: pointer;
}
</style>
