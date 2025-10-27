<template>
  <div class="insight-wrapper">
    <Card class="insight-card">
      <template #title>
        <div class="header">
          <span class="badge">延伸阅读 · 01</span>
          <h1 class="title">洞察偏好与沟通错位</h1>
        </div>
      </template>
      <template #content>
        <Message severity="info" :closable="false" class="info-message">
          至少阅读 {{ requiredMinutes }} 分钟，并完成所有互动确认。系统将自动记录你的时长与反馈。
        </Message>

        <div class="timer-row">
          <span class="timer-label">阅读计时：</span>
          <span class="timer-value">{{ formattedElapsed }}</span>
          <span v-if="remainingSeconds > 0" class="timer-need">（仍需 {{ formattedRemaining }}）</span>
        </div>
        <ProgressBar :value="progressValue" :showValue="false" class="progress" />

        <p class="intro">
          当沟通进入“错位”状态时，往往是偏好差异未被识别：外向偏好者需要即刻交流，内向偏好者寻求缓冲；
          实感偏好者需要背景事实，直觉偏好者期待愿景画面。本篇引导你拆解错位讯号，并练习建立桥梁语言。
        </p>

        <Divider align="left">观测练习</Divider>
        <section class="section">
          <h2>活动 1：回放最近一次沟通卡顿</h2>
          <p>
            记录一次双方都感到不满意的沟通情境，描述当时的情绪、环境，以及你注意到的关键词。
            阅读 20 秒后才能提交确认。
          </p>
          <Button
            :outlined="!acknowledgements.recall"
            :severity="acknowledgements.recall ? 'success' : 'info'"
            icon="pi pi-check-circle"
            label="我已完成回放记录"
            :disabled="acknowledgements.recall || elapsedSeconds < 20"
            @click="acknowledgements.recall = true"
          />
          <small v-if="!acknowledgements.recall" class="hint">继续阅读至 20 秒后再确认。</small>
        </section>

        <section class="section">
          <h2>活动 2：标记偏好信号</h2>
          <p>
            匹配以下对话特征与可能的偏好需求。至少选择两个才算完成，45 秒后方可提交。
          </p>
          <div class="checklist">
            <Checkbox v-model="signals.fastPace" inputId="signal-fast" binary />
            <label for="signal-fast">对方语速快、话题跳跃 —— 可能期待直觉式对话</label>
          </div>
          <div class="checklist">
            <Checkbox v-model="signals.detailSearch" inputId="signal-detail" binary />
            <label for="signal-detail">不断追问细节 —— 可能需要更多实感证据</label>
          </div>
          <div class="checklist">
            <Checkbox v-model="signals.silence" inputId="signal-silence" binary />
            <label for="signal-silence">对方沉默反思 —— 可能需要内向式缓冲时间</label>
          </div>
          <Button
            :outlined="!acknowledgements.signals"
            :severity="acknowledgements.signals ? 'success' : 'info'"
            icon="pi pi-check-circle"
            label="我已标记偏好信号"
            :disabled="acknowledgements.signals || elapsedSeconds < 45 || !signalsCompleted"
            @click="acknowledgements.signals = true"
          />
          <small v-if="!acknowledgements.signals" class="hint">至少选择两个选项，且阅读满 45 秒。</small>
        </section>

        <Divider align="left">桥梁语言草稿</Divider>
        <section class="section">
          <h2>活动 3：写下桥梁语句</h2>
          <p>围绕上一阶段的情境，写一句能够换位、兼顾双方偏好的桥梁语句（不少于 25 字）。</p>
          <Textarea v-model="bridgeText" autoResize rows="4" placeholder="示例：我先把现状与背景梳理清楚，再一起想象我们想要到达的画面…" />
          <small class="hint">当前字数：{{ bridgeText.trim().length }}</small>
        </section>

        <section class="section">
          <h2>活动 4：承诺实践</h2>
          <p>勾选你准备在下一次沟通中尝试的行为。</p>
          <div class="checklist">
            <Checkbox v-model="commitments.previewAgenda" inputId="commit-agenda" binary />
            <label for="commit-agenda">提前发送讨论框架，给对方预热时间</label>
          </div>
          <div class="checklist">
            <Checkbox v-model="commitments.mirrorLanguage" inputId="commit-mirror" binary />
            <label for="commit-mirror">用对方偏好的语言重述一次关键结论</label>
          </div>
          <div class="checklist">
            <Checkbox v-model="commitments.feedbackLoop" inputId="commit-feedback" binary />
            <label for="commit-feedback">会议后开启 10 分钟双向反馈，确认舒适度</label>
          </div>
        </section>

        <Message v-if="successVisible" severity="success" :closable="false" class="info-message">
          已达成要求！请返回测试页面，系统已记录阅读进度。
        </Message>
        <Message v-if="validationMessage && !successVisible" severity="warn" :closable="false" class="info-message">
          {{ validationMessage }}
        </Message>

        <div class="actions">
          <Button
            label="提交验证并返回"
            icon="pi pi-send"
            severity="success"
            :disabled="successVisible"
            @click="submit"
          />
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Checkbox from 'primevue/checkbox'
import Divider from 'primevue/divider'
import Message from 'primevue/message'
import ProgressBar from 'primevue/progressbar'
import Textarea from 'primevue/textarea'

const STORAGE_KEY = 'mbtiInsightAlpha'
const REQUIRED_SECONDS = 90

const elapsedSeconds = ref(0)
const timer = ref<number | undefined>()
const successVisible = ref(false)
const validationMessage = ref('')
const hasSubmitted = ref(false)

const router = useRouter()

const acknowledgements = reactive({
  recall: false,
  signals: false
})

const signals = reactive({
  fastPace: false,
  detailSearch: false,
  silence: false
})

const commitments = reactive({
  previewAgenda: false,
  mirrorLanguage: false,
  feedbackLoop: false
})

const bridgeText = ref('')

const signalsCompleted = computed(() => {
  const values = [signals.fastPace, signals.detailSearch, signals.silence]
  return values.filter(Boolean).length >= 2
})

const requiredMinutes = computed(() => Math.ceil(REQUIRED_SECONDS / 60))
const progressValue = computed(() => Math.min(Math.round((elapsedSeconds.value / REQUIRED_SECONDS) * 100), 100))
const remainingSeconds = computed(() => Math.max(REQUIRED_SECONDS - elapsedSeconds.value, 0))
const formattedElapsed = computed(() => formatSeconds(elapsedSeconds.value))
const formattedRemaining = computed(() => formatSeconds(remainingSeconds.value))

const commitmentsCompleted = computed(() =>
  commitments.previewAgenda || commitments.mirrorLanguage || commitments.feedbackLoop
)

const canSubmit = computed(() => {
  const bridgeOk = bridgeText.value.trim().length >= 25
  return (
    acknowledgements.recall &&
    acknowledgements.signals &&
    signalsCompleted.value &&
    commitmentsCompleted.value &&
    bridgeOk &&
    elapsedSeconds.value >= REQUIRED_SECONDS
  )
})

const formatSeconds = (value: number) => {
  const minutes = Math.floor(value / 60)
  const seconds = value % 60
  const minutePart = minutes > 0 ? `${minutes} 分 ` : ''
  return `${minutePart}${seconds} 秒`
}

const persistProgress = (completed: boolean) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        completed,
        duration: elapsedSeconds.value,
        timestamp: Date.now()
      })
    )
  } catch (error) {
    console.warn('无法写入 InsightOne 进度', error)
  }
}

const startTimer = () => {
  stopTimer()
  timer.value = window.setInterval(() => {
    if (document.hidden) {
      return
    }
    elapsedSeconds.value += 1
    if (!hasSubmitted.value) {
      persistProgress(false)
    }
  }, 1000)
}

const stopTimer = () => {
  if (timer.value !== undefined) {
    window.clearInterval(timer.value)
    timer.value = undefined
  }
}

const submit = () => {
  if (!canSubmit.value) {
    const issues: string[] = []
    if (elapsedSeconds.value < REQUIRED_SECONDS) {
      issues.push(`继续阅读至少 ${REQUIRED_SECONDS - elapsedSeconds.value} 秒`)
    }
    if (!acknowledgements.recall) {
      issues.push('完成“沟通回放”确认')
    }
    if (!acknowledgements.signals || !signalsCompleted.value) {
      issues.push('至少勾选两个偏好信号并提交确认')
    }
    if (bridgeText.value.trim().length < 25) {
      issues.push('补充不少于 25 字的桥梁语句')
    }
    if (!commitmentsCompleted.value) {
      issues.push('勾选至少一项实践承诺')
    }
    validationMessage.value = `请先完成：${issues.join('、')}。`
    return
  }

  validationMessage.value = ''
  hasSubmitted.value = true
  stopTimer()
  persistProgress(true)
  successVisible.value = true
  navigateBackToTest()
}

const navigateBackToTest = () => {
  if (typeof window !== 'undefined' && window.opener && !window.opener.closed) {
    window.close()
    return
  }
  router.push({ name: 'Test' })
}

onMounted(() => {
  localStorage.removeItem(STORAGE_KEY)
  persistProgress(false)
  startTimer()
})

onBeforeUnmount(() => {
  stopTimer()
  if (!hasSubmitted.value) {
    persistProgress(false)
  }
})

watch(
  [
    () => acknowledgements.recall,
    () => acknowledgements.signals,
    () => signals.fastPace,
    () => signals.detailSearch,
    () => signals.silence,
    () => bridgeText.value,
    () => commitments.previewAgenda,
    () => commitments.mirrorLanguage,
    () => commitments.feedbackLoop,
    () => elapsedSeconds.value
  ],
  () => {
    if (validationMessage.value && canSubmit.value) {
      validationMessage.value = ''
    }
  }
)
</script>

<style scoped>
.insight-wrapper {
  padding: 3rem 1rem 4rem;
  display: flex;
  justify-content: center;
}

.insight-card {
  max-width: 820px;
  width: 100%;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 1.5rem;
  box-shadow: 0 24px 55px rgba(15, 23, 42, 0.12);
  backdrop-filter: blur(14px);
}

.header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.badge {
  align-self: flex-start;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.12);
  color: #1d4ed8;
  font-weight: 600;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
}

.title {
  margin: 0;
  font-size: clamp(2rem, 4vw, 2.75rem);
  font-weight: 800;
  color: #0f172a;
}

.info-message {
  margin-bottom: 1.25rem;
}

.timer-row {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.75rem;
}

.timer-label {
  color: #0f172a;
  font-weight: 700;
}

.timer-value {
  font-size: 1.25rem;
  color: #2563eb;
}

.timer-need {
  font-size: 0.875rem;
  color: #ef4444;
}

.progress {
  height: 0.75rem;
  border-radius: 999px;
  margin-bottom: 1.5rem;
}

.intro {
  color: #4b5563;
  line-height: 1.7;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.75rem;
  color: #1f2937;
}

.section h2 {
  margin: 0;
  font-size: 1.3rem;
}

.hint {
  color: #6b7280;
  font-size: 0.85rem;
}

.checklist {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  line-height: 1.4;
}

.actions {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 640px) {
  .insight-card {
    border-radius: 1.2rem;
  }

  .section h2 {
    font-size: 1.15rem;
  }
}
</style>
