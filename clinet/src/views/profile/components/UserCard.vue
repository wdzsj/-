<template>
  <el-card style="margin-bottom:20px;">
    <div slot="header" class="clearfix">
      <span>关于用户</span>
    </div>

    <div class="user-profile">
      <div class="box-center "  style="position: relative;">
        <div class="tag"  style="position: absolute;top: -19px;left:15px">
          <el-upload
            style="text-align: center"
            class="upload-demo"
            action="http://localhost:8080/api/user/upload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
            :headers="{
              Authorization: Authorization
            }"
          >
            <el-tag type="info" >更换头像</el-tag>
          </el-upload>
        </div>

        <PanThumb
          :image="user.avatar"
          :height="'100px'"
          :width="'100px'"
          :hoverable="false"
        >
          <div>Hello</div>
           <!-- <div>帅照</div> -->
        </PanThumb>
      </div>
      <div class="box-center">
        <div class="user-name text-center">{{ user.name }}</div>
        <div class="user-role text-center text-muted">
          {{ user.role | uppercaseFirst }}
        </div>
      </div>
    </div>

    <div class="user-bio">
      <div class="user-skills user-bio-section">
        <div class="user-bio-section-header">
          <svg-icon icon-class="skill" /><span>进度栏</span>
        </div>
        <div class="user-bio-section-body">
          <div class="progress-item">
            <span>租赁进度</span>
            <el-progress :percentage="rentProgress" />
          </div>
          <div class="progress-item">
            <span>守信度</span>
            <el-progress :percentage="100" />
          </div>
          <div class="progress-item">
            <span>今天消耗</span>
            <el-progress :percentage="todayProgress" />
          </div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script>
import PanThumb from '@/components/PanThumb'
import { getToken } from '@/utils/auth'
import { getInfo } from '@/api/user'
export default {
  components: { PanThumb },
  props: {
    user: {
      type: Object,
      default: () => {
        return {
          name: '',
          email: '',
          avatar: '',
          role: '',
          imageUrl: '',
          Authorization: '',
          todayProgress:50
        }
      }
    },
     rentProgress: {
    type: Number,
    default: 0,
    validator: function(value) {
      return value >= 0 && value <= 100;
    }
  }
  },
  data() {
    return {}
  },
  created() {
    this.Authorization = getToken()
     this.calculateTodayProgress();
  },
  methods: {
  async  handleAvatarSuccess(res, file) {
  const newAvatar=  (await getInfo()).data.avatar
this.$store.commit('user/SET_AVATAR', newAvatar)
    this.$emit('getUser')
  
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      return isJPG && isLt2M
    },
      calculateTodayProgress() {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const elapsedHours = (now - todayStart) / (1000 * 60 * 60);
      this.todayProgress = ((elapsedHours / 24) * 100).toFixed(0)*1;
    },
  }
}
</script>

<style lang="scss" scoped>
.box-center {
  margin: 0 auto;
  display: table;
}

.text-muted {
  color: #777;
}

.user-profile {
  .user-name {
    font-weight: bold;
  }

  .box-center {
    padding-top: 10px;
  }

  .user-role {
    padding-top: 10px;
    font-weight: 400;
    font-size: 14px;
  }

  .box-social {
    padding-top: 30px;

    .el-table {
      border-top: 1px solid #dfe6ec;
    }
  }

  .user-follow {
    padding-top: 20px;
  }
}

.user-bio {
  margin-top: 20px;
  color: #606266;

  span {
    padding-left: 4px;
  }

  .user-bio-section {
    font-size: 14px;
    padding: 15px 0;

    .user-bio-section-header {
      border-bottom: 1px solid #dfe6ec;
      padding-bottom: 10px;
      margin-bottom: 10px;
      font-weight: bold;
    }
  }
}
</style>
