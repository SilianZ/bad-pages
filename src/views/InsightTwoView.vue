<template>
  <div class="insight-wrapper">
    <Card class="insight-card">
      <template #title>
        <div class="header">
          <span class="badge">延伸阅读 · 02</span>
          <h1 class="title">为偏好设计辅助习惯</h1>
        </div>
      </template>
      <template #content>
        <Message severity="info" :closable="false" class="info-message">
          阅读满 {{ requiredMinutes }} 分钟，并完成所有互动任务即可记入进度。
        </Message>

        <div class="timer-row">
          <span class="timer-label">阅读计时：</span>
          <span class="timer-value">{{ formattedElapsed }}</span>
          <span v-if="remainingSeconds > 0" class="timer-need">（仍需 {{ formattedRemaining }}）</span>
        </div>
        <ProgressBar :value="progressValue" :showValue="false" class="progress" />

        <p class="intro">
          当我们熟悉自己的偏好后，下一步是为高频场景配置“辅助习惯”：
          让偏好不再成为限制，而是通过流程、提醒与复盘机制获得平衡。本篇帮助你构建一套可执行的微计划。
        </p>

        <Divider align="left">场景盘点</Divider>
        <section class="section">
          <h2>步骤 1：列出三个高频场景</h2>
          <p>选择你最常遇到的互动或决策场景，至少勾选两个，阅读 20 秒以上方可确认。</p>
          <div class="checklist" v-for="option in scenarioOptions" :key="option.id">
            <Checkbox v-model="option.checked" :inputId="`scenario-${option.id}`" binary />
            <label :for="`scenario-${option.id}`">{{ option.label }}</label>
          </div>
          <Button
            :outlined="!acknowledgements.scenarios"
            :severity="acknowledgements.scenarios ? 'success' : 'info'"
            icon="pi pi-check-circle"
            label="我已确认场景"
            :disabled="acknowledgements.scenarios || elapsedSeconds < 20 || !scenarioCompleted"
            @click="acknowledgements.scenarios = true"
          />
          <small v-if="!acknowledgements.scenarios" class="hint">至少勾选两个场景并阅读满 20 秒。</small>
        </section>

        <Divider align="left">习惯设计</Divider>
        <section class="section">
          <h2>步骤 2：为偏好设置支撑动作</h2>
          <p>针对你在 MBTI 中更弱势的一端，写下一个提醒动作（至少 25 字），帮助自己在关键时刻切换策略。</p>
          <Textarea
            v-model="supportAction"
            autoResize
            rows="4"
            placeholder="示例：每次会议前 10 分钟列出“我还没听到的观点”，提醒自己主动邀请他人发言…"
          />
          <small class="hint">当前字数：{{ supportAction.trim().length }}</small>
        </section>

        <section class="section">
          <h2>步骤 3：设置外部提醒</h2>
          <p>选择你准备启用的提醒机制，可多选。</p>
          <div class="checklist">
            <Checkbox v-model="reminders.calendar" inputId="reminder-calendar" binary />
            <label for="reminder-calendar">在日历中添加固定提醒与回顾时间</label>
          </div>
          <div class="checklist">
            <Checkbox v-model="reminders.accountability" inputId="reminder-accountability" binary />
            <label for="reminder-accountability">与伙伴互换“提醒词”，建立责任机制</label>
          </div>
          <div class="checklist">
            <Checkbox v-model="reminders.journal" inputId="reminder-journal" binary />
            <label for="reminder-journal">使用习惯追踪器记录每天的践行情况</label>
          </div>
        </section>

        <Divider align="left">复盘问答</Divider>
        <section class="section">
          <h2>步骤 4：回答自检问题</h2>
          <p>请选择最能代表你计划的答案，并补充一句总结。</p>
          <div class="radio-group">
            <label v-for="option in evaluationOptions" :key="option.value" class="radio-option">
              <RadioButton :value="option.value" v-model="evaluationAnswer" :inputId="`evaluation-${option.value}`" />
              <span :for="`evaluation-${option.value}`">{{ option.label }}</span>
            </label>
          </div>
          <Textarea v-model="evaluationSummary" autoResize rows="3" placeholder="我的总结：" />
          <small class="hint">当前字数：{{ evaluationSummary.trim().length }}</small>
        </section>

        <Message v-if="successVisible" severity="success" :closable="false" class="info-message">
          进度已记录，请返回测试页面继续流程。
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
import RadioButton from 'primevue/radiobutton'
import Textarea from 'primevue/textarea'

const STORAGE_KEY = 'mbtiInsightBeta'
const REQUIRED_SECONDS = 90

const elapsedSeconds = ref(0)
const timer = ref<number | undefined>()
const successVisible = ref(false)
const validationMessage = ref('')
const hasSubmitted = ref(false)

const router = useRouter()

const acknowledgements = reactive({
  scenarios: false
})

const scenarioOptions = reactive([
  { id: 1, label: '项目例会 / 汇报讨论', checked: false },
  { id: 2, label: '双人协作 / 结对工作', checked: false },
  { id: 3, label: '向上沟通 / 向下反馈', checked: false },
  { id: 4, label: '高强度决策 / 临时事件', checked: false }
])

const reminders = reactive({
  calendar: false,
  accountability: false,
  journal: false
})

const supportAction = ref('')
const evaluationAnswer = ref('')
const evaluationSummary = ref('')

const evaluationOptions = [
  {
    label: '我已经明确“偏好不足”时的备用动作',
    value: 'alternate-action'
  },
  {
    label: '我需要伙伴提醒并愿意建立监督机制',
    value: 'accountability'
  },
  {
    label: '我将用数据与记录来观察偏好改变',
    value: 'metrics'
  }
]

const scenarioCompleted = computed(() => scenarioOptions.filter((option) => option.checked).length >= 2)

const remindersCompleted = computed(() => reminders.calendar || reminders.accountability || reminders.journal)

const requiredMinutes = computed(() => Math.ceil(REQUIRED_SECONDS / 60))
const progressValue = computed(() => Math.min(Math.round((elapsedSeconds.value / REQUIRED_SECONDS) * 100), 100))
const remainingSeconds = computed(() => Math.max(REQUIRED_SECONDS - elapsedSeconds.value, 0))
const formattedElapsed = computed(() => formatSeconds(elapsedSeconds.value))
const formattedRemaining = computed(() => formatSeconds(remainingSeconds.value))

const canSubmit = computed(() => {
  const supportOk = supportAction.value.trim().length >= 25
  const evaluationOk = evaluationAnswer.value !== '' && evaluationSummary.value.trim().length >= 20
  return (
    acknowledgements.scenarios &&
    scenarioCompleted.value &&
    remindersCompleted.value &&
    supportOk &&
    evaluationOk &&
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
    console.warn('无法写入 InsightTwo 进度', error)
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
    if (!acknowledgements.scenarios || !scenarioCompleted.value) {
      issues.push('勾选至少两个高频场景并确认')
    }
    if (supportAction.value.trim().length < 25) {
      issues.push('补充不少于 25 字的支撑动作')
    }
    if (!remindersCompleted.value) {
      issues.push('选择至少一种外部提醒')
    }
    if (evaluationAnswer.value === '' || evaluationSummary.value.trim().length < 20) {
      issues.push('完成复盘问答并写满 20 字总结')
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
    () => acknowledgements.scenarios,
    () => scenarioOptions.map((option) => option.checked),
    () => supportAction.value,
    () => reminders.calendar,
    () => reminders.accountability,
    () => reminders.journal,
    () => evaluationAnswer.value,
    () => evaluationSummary.value,
    () => elapsedSeconds.value
  ],
  () => {
    if (validationMessage.value && canSubmit.value) {
      validationMessage.value = ''
    }
  },
  { deep: true }
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

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 0.6rem;
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
