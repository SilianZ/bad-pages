<template>
  <div class="home-layout">
    <section class="hero">
      <Card class="hero-card">
        <template #title>
          <div class="hero-title-block">
            <span class="hero-kicker">MBTI LAB SPECIAL</span>
            <h1 class="hero-title">点亮你的专属性格光谱</h1>
          </div>
        </template>
        <template #content>
          <p class="hero-lead">
            30 题专业测评，结合最新性格偏好研究，帮助你洞察社交、决策与工作节奏的差异，打造更契合自己的成长路径。
          </p>
          <div class="hero-actions">
            <Button label="立即开始测试" icon="pi pi-play" @click="goToTest" />
            <Button label="了解测评原理" icon="pi pi-book" severity="secondary" outlined @click="scrollToAbout" />
          </div>
        </template>
      </Card>
    </section>

    <section ref="aboutSection" class="about-section">
      <Card class="about-card">
        <template #title>为什么值得一测？</template>
        <template #content>
          <Divider />
          <div class="feature-grid">
            <Card class="feature-card" v-for="feature in features" :key="feature.title">
              <template #title>
                <span class="feature-icon" :aria-label="feature.title">
                  <i :class="feature.icon"></i>
                </span>
                {{ feature.title }}
              </template>
              <template #content>
                <p class="feature-text">{{ feature.description }}</p>
              </template>
            </Card>
          </div>
        </template>
      </Card>
    </section>

    <section class="testimonial-section">
      <Card class="testimonial-card">
        <template #title>他们说 MBTI Lab 改写了人生剧本</template>
        <template #content>
          <Divider />
          <Carousel
            :value="testimonials"
            :numVisible="1"
            :numScroll="1"
            circular
            :autoplayInterval="6000"
            class="testimonial-carousel"
          >
            <template #item="{ data }">
              <Card class="quote-card">
                <template #title>
                  <div class="quote-header">
                    <div class="quote-avatar-wrapper">
                      <Avatar :label="data.initials[0]" class="quote-avatar" shape="circle" />
                    </div>
                    <div class="quote-meta">
                      <span class="quote-name">{{ data.name }}</span>
                      <Tag :value="data.highlight" severity="info" rounded />
                      <span class="quote-role">{{ data.role }}</span>
                    </div>
                  </div>
                </template>
                <template #content>
                  <p class="quote-message">{{ data.quote }}</p>
                </template>
              </Card>
            </template>
          </Carousel>
        </template>
      </Card>
    </section>

    <section class="privacy-section">
      <Card class="privacy-card">
        <template #title>我们的隐私护盾：夸张但让人踏实</template>
        <template #content>
          <Divider />
          <div class="privacy-grid">
            <Card class="privacy-card-item" v-for="item in privacyHighlights" :key="item.title">
              <template #title>
                <div class="privacy-title">
                  <i :class="item.icon"></i>
                  <span>{{ item.title }}</span>
                </div>
              </template>
              <template #content>
                <p class="privacy-text">{{ item.description }}</p>
              </template>
            </Card>
          </div>
        </template>
      </Card>
    </section>

    <section class="cta-section">
      <Card class="cta-card">
        <template #title>给自己 15 分钟，换来长期的清晰感</template>
        <template #content>
          <p class="cta-text">
            完成测评后，你将在逐步挑战中加深对偏好的理解。当你准备好时，我们将引导你进入报告下载流程（惊喜等着你）。
          </p>
          <Button label="我准备好了" icon="pi pi-arrow-right" @click="goToTest" />
        </template>
      </Card>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Divider from 'primevue/divider'
import Tag from 'primevue/tag'
import Avatar from 'primevue/avatar'
import Carousel from 'primevue/carousel'

const router = useRouter()

const aboutSection = ref<HTMLElement | null>(null)

const goToTest = () => {
  router.push({ name: 'Test' })
}

const scrollToAbout = () => {
  aboutSection.value?.scrollIntoView({ behavior: 'smooth' })
}

const features = [
  {
    title: '结构化维度分析',
    description: '覆盖能量流向、信息获取、决策方式与生活节奏四大维度，以进阶问题揭示真实偏好。',
    icon: 'pi pi-sliders-h'
  },
  {
    title: '动态进度提示',
    description: '实时记录答题进度并可中途返回修改，确保你有充足时间思考每一道题。',
    icon: 'pi pi-bolt'
  },
  {
    title: '独特下载关卡',
    description: '在报告解锁前设置沉浸式任务，帮助巩固收获，避免“一看就忘”。',
    icon: 'pi pi-shield'
  }
]

const testimonials = [
  {
    name: '夜航鲸落',
    role: '产品带头人',
    quote:
      '“我把团队整合三个月都没成功，MBTI Lab 让我一夜之间写出偏好协议，第二天办公室就像换了个宇宙。”',
    highlight: '办公室换宇宙',
    initials: '夜航'
  },
  {
    name: '棉花拿铁',
    role: '独立播客主',
    quote: '“原本节目播放量持续下滑，测完之后我在节目里开诚布公聊偏好冲突，当周就冲上榜单。”',
    highlight: '榜单逆袭',
    initials: '棉花'
  },
  {
    name: '午夜木吉他',
    role: '自由编剧',
    quote: '“Lab 让我识别直觉偏好带来的剧情漏洞，如今的剧本连我自己都追着看。”',
    highlight: '剧本自来水',
    initials: '午夜'
  },
  {
    name: '凌晨黑胶仓',
    role: '音频修复工程师',
    quote: '“在下载关卡被迫写下的分享承诺，竟成了我修复 1950 年代唱片的灵感录音。”',
    highlight: '灵感录音',
    initials: '黑胶'
  }
]

const privacyHighlights = [
  {
    title: '量子切片存储',
    description:
      '我们将原始答题数据切成 1024 份并散落在以星座命名的节点里，任何请求都必须得到七重授权。每个节点都装配"健忘芯片"，30 秒不活跃就自动失忆。',
    icon: 'pi pi-lock'
  },
  {
    title: '自毁缓存计划',
    description:
      '算法生成报告后 3 秒内销毁所有中间态，服务器连自己的记忆都得排队申请。我们甚至设定了"尴尬指数"，超过阈值的缓存直接焚化。',
    icon: 'pi pi-trash'
  },
  {
    title: '偏好护卫巡逻',
    description:
      '每 17 分钟触发一次安全巡逻脚本，检查是否有人试图通过读心术解析你的回答轨迹。脚本会伪装成你的 MBTI 分身，与窥探者展开无穷对话。',
    icon: 'pi pi-shield'
  },
  {
    title: '离线回忆保险箱',
    description:
      '所有下载后的报告被自动配送至"离线保险箱"，需要双因素（本人情绪密码+AI 唱名验证）才能再次开启。',
    icon: 'pi pi-inbox'
  },
  {
    title: '匿名偏好裂变',
    description:
      '用户可选择把报告匿名拆分给朋友，系统会伪造十段看似真实的偏好轨迹，确保你永远是"人群里最神秘的那一个"。',
    icon: 'pi pi-users'
  },
  {
    title: '量子纠缠防火墙',
    description:
      '采用量子纠缠技术，使得数据传输的每个比特都在两个量子态间瞬时切换，任何监控者永远无法捕捉到完整信息。在数据包穿越全球网络时，它同时存在和不存在。',
    icon: 'pi pi-bolt'
  }
]
</script>

<style scoped>
.home-layout {
  display: flex;
  flex-direction: column;
  gap: 3rem;
  padding: 3rem 1rem 4rem;
  max-width: 1000px;
  margin: 0 auto;
}

.hero {
  display: flex;
  justify-content: center;
}

.hero-card {
  width: 100%;
  text-align: left;
}

.hero-title-block {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.hero-kicker {
  font-size: 0.85rem;
  letter-spacing: 0.38em;
  font-weight: 600;
  color: rgba(15, 23, 42, 0.65);
}

.hero-title {
  margin: 0;
  font-size: clamp(2.5rem, 5vw, 3.75rem);
  line-height: 1.1;
  font-weight: 800;
  background: linear-gradient(120deg, #2563eb 0%, #ec4899 45%, #f59e0b 90%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  text-shadow: rgba(59, 130, 246, 0.25) 0 10px 30px;
}

.hero-lead {
  margin-top: 1rem;
  font-size: 1.125rem;
  line-height: 1.9;
  color: #334155;
}

.hero-actions {
  margin-top: 2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.about-section {
  scroll-margin-top: 120px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.feature-card {
  border-radius: 1rem;
  overflow: hidden;
}

.feature-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #22d3ee);
  color: white;
  margin-right: 0.75rem;
  font-size: 1.25rem;
}

.feature-text {
  color: #475569;
  line-height: 1.8;
}

.cta-section {
  display: flex;
  justify-content: center;
}

.cta-card {
  width: 100%;
  text-align: center;
}

.cta-text {
  margin: 1rem 0 2rem;
  color: #334155;
  line-height: 1.8;
}

.testimonial-carousel {
  margin-top: 1.5rem;
}

.testimonial-section,
.privacy-section {
  display: flex;
  justify-content: center;
}

.testimonial-card,
.privacy-card {
  width: 100%;
}

.quote-card {
  border-radius: 1.25rem;
}

.quote-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  width: 100%;
}

.quote-avatar-wrapper {
  flex-shrink: 0;
}

.quote-avatar {
  background: linear-gradient(135deg, #6366f1, #22d3ee);
  color: #fff;
}

.quote-meta {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex: 1;
}

.quote-name {
  font-weight: 600;
  color: #0f172a;
  font-size: 1rem;
}

.quote-message {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.7;
}

.quote-role {
  font-size: 0.85rem;
  color: #475569;
}

.quote-meta :deep(.p-tag) {
  width: fit-content;
}

.privacy-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.privacy-card-item {
  border-radius: 1.1rem;
}

.privacy-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #0f172a;
}

.privacy-title i {
  color: #2563eb;
}

.privacy-text {
  margin: 0;
  line-height: 1.75;
  color: #475569;
}

@media (max-width: 640px) {
  .hero-actions {
    flex-direction: column;
  }

  .hero-title {
    font-size: clamp(2.2rem, 9vw, 3rem);
  }

  .privacy-grid {
    grid-template-columns: 1fr;
  }
}
</style>
