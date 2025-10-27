<template>
  <div class="article-wrapper">
    <Card class="article-card">
      <template #title>
        <div class="article-header">
          <span class="article-badge">MBTI Lab 深度指南</span>
          <h1 class="article-title">解锁偏好差异的三十种方式</h1>
        </div>
      </template>
      <template #content>
        <Message severity="info" class="article-message" :closable="false">
          系统将实时记录你的阅读与互动，至少需累计 {{ requiredMinutes }} 分钟并完成全部验证。
        </Message>

        <div class="article-timer">
          <span class="timer-label">阅读计时：</span>
          <span class="timer-value">{{ formattedElapsed }}</span>
          <span v-if="remainingSeconds > 0" class="timer-remaining">（仍需 {{ formattedRemaining }}）</span>
        </div>
        <ProgressBar :value="progressValue" :showValue="false" class="article-progress" />

        <p class="article-intro">
          MBTI 并非把人简单贴上“标签”，而是帮助我们识别在能量流向、信息获取、决策方式与生活节奏上的偏好模式。
          以下文章通过三十种微实验，引导你在真实情境中观察自身偏好，并倡导以成长心态对待差异。边读边操作，才能真正把概念内化为行动。
        </p>

        <Divider align="left">偏好观念实验</Divider>

        <section class="article-section">
          <h2>01. 偏好不是能力优劣</h2>
          <p>
            无论你更偏好外向还是内向、实感还是直觉，这些都不是能力的高低，而是你在处理信息时的默认轨道。
            在团队中，我们要学会把偏好视为互补力量，而非对立阵营。记录过去一周中让你感到舒适的互动，并思考原因。
          </p>
          <Button
            :severity="acknowledgements.foundation ? 'success' : 'info'"
            :outlined="!acknowledgements.foundation"
            :disabled="acknowledgements.foundation || elapsedSeconds < 20"
            icon="pi pi-check-circle"
            label="我已记录三个真实场景"
            @click="acknowledgements.foundation = true"
          />
          <small v-if="!acknowledgements.foundation" class="article-hint">阅读满 20 秒后才能确认。</small>
        </section>

        <section class="article-section">
          <h2>02. 观察偏好的触发器</h2>
          <p>
            当面对新任务时，你是先查阅事实数据，还是直接构想未来画面？请写下你最近一次的决策过程，圈出触发你思路的关键线索。
            这种觉察有助于把偏好从潜意识搬到台前，从而在需要时切换策略。
          </p>
          <Button
            :severity="acknowledgements.observation ? 'success' : 'info'"
            :outlined="!acknowledgements.observation"
            :disabled="acknowledgements.observation || elapsedSeconds < 45"
            icon="pi pi-check-circle"
            label="我已经完成触发器笔记"
            @click="acknowledgements.observation = true"
          />
          <small v-if="!acknowledgements.observation" class="article-hint">计时至少 45 秒后可确认。</small>
        </section>

        <section class="article-section">
          <h2>03. 设计一次偏好互换实验</h2>
          <p>
            尝试计划一次“偏好互换”：若你偏好判断（J），请安排一天完全不设闹钟与日程；若你偏好感知（P），请为明天设定三个具体的时间节点。
            通过刻意练习，我们才能真正理解不同偏好者的心理感受。
          </p>
          <Button
            :severity="acknowledgements.experiment ? 'success' : 'info'"
            :outlined="!acknowledgements.experiment"
            :disabled="acknowledgements.experiment || elapsedSeconds < 70"
            icon="pi pi-check-circle"
            label="我已经规划互换实验"
            @click="acknowledgements.experiment = true"
          />
          <small v-if="!acknowledgements.experiment" class="article-hint">阅读满 70 秒后才能确认。</small>
        </section>

        <Divider align="left">概念验证</Divider>

        <div class="quiz-block">
          <h3>验证一：请选出 MBTI 的四大维度组合</h3>
          <div class="quiz-options">
            <label class="quiz-option" v-for="option in dimensionOptions" :key="option.value">
              <RadioButton :inputId="option.value" v-model="dimensionAnswer" :value="option.value" />
              <span :for="option.value">{{ option.label }}</span>
            </label>
          </div>
        </div>

        <div class="quiz-block">
          <h3>验证二：当偏好产生冲突时，你会？</h3>
          <div class="quiz-options">
            <label class="quiz-option" v-for="option in strategyOptions" :key="option.value">
              <RadioButton :inputId="`strategy-${option.value}`" v-model="strategyAnswer" :value="option.value" />
              <span :for="`strategy-${option.value}`">{{ option.label }}</span>
            </label>
          </div>
        </div>

        <div class="quiz-block">
          <h3>验证三：写下你准备实践的一件小行动（至少 20 字）</h3>
          <Textarea
            v-model="reflectionText"
            rows="4"
            autoResize
            placeholder="例如：下周的团队例会上，我会先倾听每位成员的想法，再补充自己的概念…"
          />
          <small class="article-hint">当前字数：{{ reflectionText.trim().length }}</small>
        </div>

        <div class="quiz-block commitment-block">
          <Checkbox inputId="commit" v-model="shareCommitment" binary />
          <label for="commit">我承诺在实验后三天内与一位伙伴分享我的观察成果。</label>
        </div>

        <Message
          v-if="successVisible"
          severity="success"
          :closable="false"
          class="article-message success-message"
        >
          验证完成！请返回测试页面继续流程，系统已记录你的阅读时长。
        </Message>

        <Message
          v-if="validationMessage && !successVisible"
          severity="warn"
          :closable="false"
          class="article-message"
        >
          {{ validationMessage }}
        </Message>

        <div class="article-actions">
          <Button
            label="提交验证并返回"
            icon="pi pi-send"
            severity="success"
            :disabled="successVisible"
            @click="submitReading"
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

const ARTICLE_STORAGE_KEY = 'mbtiArticleProgress'
const ARTICLE_REQUIRED_SECONDS = 120

const elapsedSeconds = ref(0)
const timer = ref<number | undefined>()
const successVisible = ref(false)
const hasSubmitted = ref(false)
const validationMessage = ref('')

const router = useRouter()

const acknowledgements = reactive({
  foundation: false,
  observation: false,
  experiment: false
})

const dimensionAnswer = ref('')
const strategyAnswer = ref('')
const reflectionText = ref('')
const shareCommitment = ref(false)

const dimensionOptions = [
  {
    label: '能量流向 / 信息获取 / 决策方式 / 生活节奏',
    value: 'four-dimensions'
  },
  {
    label: '外貌特征 / 兴趣爱好 / 睡眠时长 / 鞋码',
    value: 'random-facts'
  }
]

const strategyOptions = [
  {
    label: '记录冲突时的偏好触发点，并与队友复盘',
    value: 'revisit'
  },
  {
    label: '立即坚持自己的做法，不需沟通',
    value: 'insist'
  }
]

const requiredMinutes = computed(() => Math.ceil(ARTICLE_REQUIRED_SECONDS / 60))
const progressValue = computed(() => Math.min(Math.round((elapsedSeconds.value / ARTICLE_REQUIRED_SECONDS) * 100), 100))
const remainingSeconds = computed(() => Math.max(ARTICLE_REQUIRED_SECONDS - elapsedSeconds.value, 0))
const formattedElapsed = computed(() => formatSeconds(elapsedSeconds.value))
const formattedRemaining = computed(() => formatSeconds(remainingSeconds.value))

const canSubmit = computed(() => {
  const sectionsDone = acknowledgements.foundation && acknowledgements.observation && acknowledgements.experiment
  const quizOk = dimensionAnswer.value === 'four-dimensions' && strategyAnswer.value === 'revisit'
  const reflectionOk = reflectionText.value.trim().length >= 20
  const commitmentOk = shareCommitment.value
  const timeOk = elapsedSeconds.value >= ARTICLE_REQUIRED_SECONDS
  return sectionsDone && quizOk && reflectionOk && commitmentOk && timeOk
})

const persistProgress = (completed: boolean) => {
  try {
    localStorage.setItem(
      ARTICLE_STORAGE_KEY,
      JSON.stringify({
        completed,
        duration: elapsedSeconds.value,
        timestamp: Date.now()
      })
    )
  } catch (error) {
    console.warn('无法写入阅读进度', error)
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

const submitReading = () => {
  if (!canSubmit.value) {
    const issues: string[] = []
    if (elapsedSeconds.value < ARTICLE_REQUIRED_SECONDS) {
      issues.push(`继续阅读至少 ${Math.max(ARTICLE_REQUIRED_SECONDS - elapsedSeconds.value, 0)} 秒`)
    }
    if (!acknowledgements.foundation) {
      issues.push('完成“真实场景”确认')
    }
    if (!acknowledgements.observation) {
      issues.push('完成“触发器笔记”确认')
    }
    if (!acknowledgements.experiment) {
      issues.push('完成“偏好互换实验”确认')
    }
    if (dimensionAnswer.value !== 'four-dimensions') {
      issues.push('选择正确的 MBTI 四大维度组合')
    }
    if (strategyAnswer.value !== 'revisit') {
      issues.push('选择冲突处理策略：记录并复盘')
    }
    if (reflectionText.value.trim().length < 20) {
      issues.push('补充至少 20 字的实践小行动')
    }
    if (!shareCommitment.value) {
      issues.push('勾选分享承诺')
    }
    validationMessage.value = `请先完成以下事项：${issues.join('、')}。`
    return
  }
  validationMessage.value = ''
  hasSubmitted.value = true
  persistProgress(true)
  stopTimer()
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
  localStorage.removeItem(ARTICLE_STORAGE_KEY)
  persistProgress(false)
  startTimer()
})

onBeforeUnmount(() => {
  stopTimer()
  if (!hasSubmitted.value) {
    persistProgress(false)
  }
})

const formatSeconds = (value: number) => {
  const minutes = Math.floor(value / 60)
  const seconds = value % 60
  const minutePart = minutes > 0 ? `${minutes} 分 ` : ''
  return `${minutePart}${seconds} 秒`
}

watch(
  [
    () => acknowledgements.foundation,
    () => acknowledgements.observation,
    () => acknowledgements.experiment,
    () => dimensionAnswer.value,
    () => strategyAnswer.value,
    () => reflectionText.value,
    () => shareCommitment.value,
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
.article-wrapper {
  padding: 3rem 1rem 4rem;
  display: flex;
  justify-content: center;
}

.article-card {
  max-width: 860px;
  width: 100%;
  backdrop-filter: blur(18px);
  background: rgba(255, 255, 255, 0.9);
  border-radius: 1.5rem;
  box-shadow: 0 30px 70px rgba(15, 23, 42, 0.2);
}

.article-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.article-badge {
  align-self: flex-start;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.12);
  color: #1d4ed8;
  font-weight: 600;
  letter-spacing: 0.1em;
  font-size: 0.75rem;
}

.article-title {
  margin: 0;
  font-size: clamp(2.2rem, 5vw, 3rem);
  line-height: 1.15;
  font-weight: 800;
  color: #0f172a;
}

.article-message {
  margin-bottom: 1.5rem;
}

.article-timer {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.75rem;
}

.timer-label {
  font-weight: 700;
  color: #0f172a;
}

.timer-value {
  font-size: 1.25rem;
  color: #2563eb;
}

.timer-remaining {
  font-size: 0.875rem;
  color: #ef4444;
}

.article-progress {
  height: 0.75rem;
  border-radius: 999px;
  margin-bottom: 1.5rem;
}

.article-intro {
  color: #334155;
  line-height: 1.8;
  margin-bottom: 2rem;
}

.article-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  border-radius: 1.25rem;
  background: rgba(248, 250, 252, 0.75);
  border: 1px solid rgba(148, 163, 184, 0.35);
}

.article-section h2 {
  margin: 0;
  font-size: 1.35rem;
  color: #1f2937;
}

.article-section p {
  margin: 0;
  color: #475569;
  line-height: 1.8;
}

.article-hint {
  color: #64748b;
  font-size: 0.85rem;
}

.quiz-block {
  margin-bottom: 2rem;
  padding: 1.5rem;
  border-radius: 1.25rem;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(148, 163, 184, 0.3);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.quiz-block h3 {
  margin: 0;
  color: #1f2937;
}

.quiz-options {
  display: grid;
  gap: 0.75rem;
}

.quiz-option {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  color: #334155;
}

.commitment-block {
  align-items: center;
}

.success-message {
  margin-top: 1rem;
}

.article-actions {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .article-card {
    border-radius: 1rem;
  }

  .article-section,
  .quiz-block {
    padding: 1.25rem;
  }

  .article-title {
    font-size: clamp(1.8rem, 8vw, 2.5rem);
  }
}
</style>
