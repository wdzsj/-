<template>
  <div class="app-container">
    <div v-if="user">
      <el-row :gutter="20">
        <el-col :span="6" :xs="24">
          <user-card
            :user="user"
            @getUser="getUser"
            :rentProgress="rentProgress"
          />
        </el-col>

        <el-col :span="18" :xs="24">
          <el-card>
            <el-tabs v-model="activeTab">
              <el-tab-pane label="修改密码" name="account">
                <account />
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 信息描述 -->
    <el-card style="margin-bottom:20px;">
      <div slot="header" class="clearfix">
        <span>用户详情</span>
      </div>

      <div class="user-profile">
        <div class="box-center">
          <el-descriptions class="margin-top" border>
            <template slot="extra">
              <el-button type="primary" size="small" @click="isEditing = true"
                >操作</el-button
              >
            </template>

            <el-descriptions-item
              labelStyle="width: 70px"
              contentStyle="width: 100px"
            >
              <template slot="label">
                <i class="el-icon-user"></i>
                姓名
              </template>
              {{ user.name }}
            </el-descriptions-item>

            <el-descriptions-item
              labelStyle="width: 70px"
              contentStyle="width: 80px"
            >
              <template slot="label">
                <i class="el-icon-orange"></i>
                年龄
              </template>
              {{ allUserInfo.age }}
            </el-descriptions-item>
            <el-descriptions-item
              labelStyle="width: 70px"
              contentStyle="width: 80px"
            >
              <template slot="label">
                <i
                  :class="
                    allUserInfo.sex === '男' ? 'el-icon-male' : 'el-icon-female'
                  "
                ></i>
                性别
              </template>
              {{ allUserInfo.sex }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template slot="label">
                <i class="el-icon-medal"></i> 备注
              </template>
              <el-tag size="small">{{ allUserInfo.role }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item
              labelStyle="width: 70px"
              contentStyle="width: 200px"
            >
              <template slot="label">
                <i class="el-icon-mobile-phone"></i> 手机号
              </template>
              {{ allUserInfo.phone }}
            </el-descriptions-item>
            <el-descriptions-item
              labelStyle="width: 70px"
              contentStyle="width: 200px"
            >
              <template slot="label">
                <i class="el-icon-location-outline"></i> 居住地
              </template>
              {{ building && building.name ? building.name : ''
              }}{{ floor && floor.layer ? floor.layer : ''
              }}{{ room && room.number ? room.number : '' }}
            </el-descriptions-item>
            <el-descriptions-item
              labelStyle="width: 70px"
              contentStyle="width: 150px"
            >
              <template slot="label">
                <i class="el-icon-date"></i> 租赁时间
              </template>
              {{ allUserInfo.checkTime?allUserInfo.checkTime:'未租赁' | formatDate('YYYY年MM月DD日 HH:mm') }}
            </el-descriptions-item>
            <el-descriptions-item
              labelStyle="width: 70px"
              contentStyle="width: 80px"
            >
              <template slot="label">
                <i class="el-icon-money"></i> 租金
              </template>
              {{ allUserInfo.rent }}
            </el-descriptions-item>
            <el-descriptions-item
              labelStyle="width: 70px"
              contentStyle="width: 80px"
            >
              <template slot="label">
                <i class="el-icon-odometer"></i> 租期
              </template>
              {{ allUserInfo.term }}
            </el-descriptions-item>

            <el-descriptions-item
              labelStyle="width: 70px"
              contentStyle="width: 250px"
            >
              <template slot="label">
                <i class="el-icon-s-check"></i> 注册时间
              </template>
              {{ allUserInfo.createdAt | formatDate('YYYY年MM月DD日 HH:mm') }}
            </el-descriptions-item>

            <el-descriptions-item
              labelStyle="width: 70px"
              contentStyle="width: 250px"
            >
              <template slot="label">
                <i class="el-icon-s-check"></i> 身份证
              </template>
              {{ allUserInfo.identity }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>

      <div class="user-bio">
        <el-dialog
          title="修改用户信息"
          :visible.sync="isEditing"
          width="410px"
          :close-on-click-modal="false"
        >
          <el-form
            :model="allUserInfo"
            ref="form"
            :rules="rules"
            label-width="80px"
          >
            <el-form-item label="姓名" prop="name">
              <el-input
                v-model="allUserInfo.name"
                placeholder="请输入姓名"
                style="width: 100px; height: 30px;"
              ></el-input>
            </el-form-item>

            <el-form-item label="手机号" prop="phone">
              <el-input
                v-model="allUserInfo.phone"
                placeholder="请输入手机号"
                style="width: 200px; height: 30px;"
              ></el-input>
            </el-form-item>
            <el-form-item label="身份证" prop="identity">
              <el-input
                v-model="allUserInfo.identity"
                placeholder="请输入身份证号"
                style="width: 250px; height: 30px;"
                :disabled="true"
              ></el-input>
            </el-form-item>
            <el-form-item label="备注" prop="role">
              <el-input
                v-model="allUserInfo.role"
                :disabled="true"
                style="width: 115px; height: 30px;"
              ></el-input>
            </el-form-item>
          </el-form>

          <div slot="footer" class="dialog-footer">
            <el-button @click="isEditing = false">取 消</el-button>
            <el-button type="primary" @click="submitForm">确 定</el-button>
          </div>
        </el-dialog>
      </div>
    </el-card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import UserCard from './components/UserCard'
import Account from './components/Account'
import PanThumb from '@/components/PanThumb'
import { updateInfo } from '@/api/user'
export default {
  name: 'Profile',
  components: { UserCard, Account, PanThumb },
  data() {
    return {
      user: {},
      activeTab: 'account',
      isEditing: false,
      rentProgress: 30,
      rules: {
        name: [{ message: '请输入姓名', trigger: 'blur' }],
        age: [{ message: '请输入年龄', trigger: 'blur' }],
        sex: [{ message: '请选择性别', trigger: 'change' }],
        phone: [{ message: '请输入手机号', trigger: 'blur' }],
        identity: [{ message: '请输入身份证号', trigger: 'blur' }],
        role: [{ required: false }]
      }
    }
  },
  computed: {
    ...mapGetters([
      'name',
      'avatar',
      'roles',
      'allUserInfo',
      'building',
      'floor',
      'room'
    ])
  },
  created() {
    this.getUser()
    this.calculateRentProgress()
  },
  methods: {
    getUser() {
      this.user = {
        name: this.name,
        role: this.roles.join(' | '),
        avatar: this.avatar
      }
    },

    editUser() {
      this.isEditing = true
      // Logic to edit user data
    },
    // 表单提交
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          // TODO: 提交表单数据
          updateInfo(this.allUserInfo).then(res => {
            console.log('更改成功')
          })
          this.isEditing = false
        }
      })
    },
    calculateRentProgress() {
      if (this.allUserInfo.checkTime) {
        const checkTime = new Date(this.allUserInfo.checkTime)
        const now = new Date()
        const timeDiff = now - checkTime
        const oneDayMs = 24 * 60 * 60 * 1000
        const daysDiff = Math.floor(timeDiff / oneDayMs)
        const avgDaysPerMonth = 30.4375 // 每个月的平均天数
        const totalDays = this.allUserInfo.term * avgDaysPerMonth
        const rentProgress = Math.round((daysDiff / totalDays) * 100)
        this.rentProgress = rentProgress
      } else {
        this.rentProgress = 100
      }
    }
  }
}
</script>

<style scoped>
.el-input {
  border: none;
  background-color: transparent;
  box-shadow: none;
  outline: none;
  padding: 0;
}
.no-border {
  border: none;
  background-color: transparent;
  /* 可以根据需要设置其他样式 */
}
</style>
