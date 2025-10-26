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

@media (max-width: 640px) {
  .home-layout {
    padding-top: 2rem;
  }

  .hero-lead {
    font-size: 1rem;
  }

  .hero-actions {
    flex-direction: column;
  }

  .hero-title {
    font-size: clamp(2.2rem, 9vw, 3rem);
  }
}
</style>
