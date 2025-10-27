<template>
  <div class="layout">
    <Card class="intro-card">
      <template #title>30 题 MBTI 性格测试</template>
      <template #content>
        <p class="intro-text">
          请选择最贴近你真实想法的选项，本测验共 30 题，采用 5 点量表。完成答题后可生成 MBTI 类型报告。
        </p>
        <div class="progress-section">
          <ProgressBar :value="progressValue" :showValue="false" class="progress-bar" />
          <span class="progress-label">{{ progressValue }}% 已完成（{{ answeredCount }} / {{ questions.length }}）</span>
        </div>
      </template>
    </Card>

    <div class="question-list">
      <Card v-for="question in questions" :key="question.id" class="question-card">
        <template #title>第 {{ question.id }} 题</template>
        <template #content>
          <p class="question-text">{{ question.text }}</p>
          <div class="options-grid">
            <div v-for="option in likertOptions" :key="option.value" class="option-item">
              <RadioButton
                :inputId="`q-${question.id}-${option.value}`"
                v-model="responses[question.id]"
                :value="option.value"
              />
              <label :for="`q-${question.id}-${option.value}`">{{ option.label }}</label>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <Card class="actions-card">
      <template #content>
        <div class="actions">
          <Button
            label="生成测试结果"
            icon="pi pi-chart-line"
            :disabled="!allAnswered"
            @click="handleShowResults"
          />
          <Message
            v-if="showValidationMessage"
            severity="warn"
            class="validation-message"
            :closable="false"
          >
            仍有题目未作答，请完成全部 30 题再生成结果。
          </Message>
        </div>
      </template>
    </Card>

    <div v-if="showResults" class="result-wrapper">
      <Card class="result-card">
        <template #title>你的 MBTI 类型：{{ displayedMbtiType }}</template>
        <template #content>
          <p class="result-text">
            以下为每个维度的倾向与强度，仅供自我探索参考。
          </p>
          <Divider />
          <div class="dimension-grid">
            <Card
              v-for="(dimension, index) in dimensionSummaries"
              :key="dimension.key"
              class="dimension-card"
              :class="{ 'is-locked': !fullResultsUnlocked && index >= visibleDimensionCount }"
            >
              <template #title>{{ dimension.title }}（{{ dimension.letters[0] }} / {{ dimension.letters[1] }}）</template>
              <template #content>
                <div v-if="fullResultsUnlocked || index < visibleDimensionCount" class="dimension-body">
                  <ProgressBar :value="dimension.firstPercent" :showValue="false" class="dimension-progress" />
                  <div class="dimension-stats">
                    <span>{{ dimension.letters[0] }} {{ dimension.firstPercent }}% · {{ dimension.letters[1] }} {{ dimension.secondPercent }}%</span>
                    <span>偏好：{{ dimension.primaryLetter }}（强度 {{ dimension.strength }}%）</span>
                  </div>
                  <p class="dimension-description">{{ dimension.description }}</p>
                </div>
                <div v-else class="dimension-locked">
                  <i class="pi pi-lock"></i>
                  <p>完整分析已锁定</p>
                  <small>阅读两篇偏好文章即可解锁此维度的洞察。</small>
                </div>
              </template>
            </Card>
          </div>
          <template v-if="!fullResultsUnlocked">
            <Message severity="warn" class="insight-message" :closable="false">
              当前仅展示 50% 维度洞察。阅读以下两篇偏好拓展文章（预计共 3 分钟）即可解锁完整报告。
            </Message>
            <div class="insight-task-grid">
              <Card
                v-for="task in insightTaskDetails"
                :key="task.index"
                class="insight-task-card"
                :class="{ 'is-complete': task.completed && task.meetsDuration }"
              >
                <template #title>
                  <div class="insight-task-title">
                    <i :class="task.completed && task.meetsDuration ? 'pi pi-check-circle' : 'pi pi-book'" />
                    <span>{{ task.title }}</span>
                  </div>
                </template>
                <template #content>
                  <div class="insight-task-body">
                    <p class="insight-progress">
                      已阅读 {{ task.formattedDuration }} / 目标 {{ formatSeconds(task.requiredSeconds) }}
                    </p>
                    <p v-if="!task.meetsDuration" class="insight-remaining">
                      仍需约 {{ task.formattedRemaining }} 并完成文章内互动
                    </p>
                    <Button
                      label="打开文章"
                      icon="pi pi-external-link"
                      severity="help"
                      outlined
                      @click="openInsightArticle(task.index)"
                    />
                  </div>
                </template>
              </Card>
            </div>
            <div class="insight-actions">
              <Button
                label="刷新进度"
                icon="pi pi-refresh"
                severity="secondary"
                outlined
                @click="refreshInsightProgress"
              />
            </div>
          </template>
          <template v-else>
            <Divider />
            <div class="download-area">
              <Button label="下载报告（完全免费！）" icon="pi pi-download" severity="success" @click="beginGateFlow" />
            </div>
            <div v-if="wastedMessage" class="wasted-banner">
              {{ wastedMessage }}
            </div>
          </template>
        </template>
      </Card>
    </div>

    <Dialog
      v-model:visible="showGateDialog"
      modal
      :closable="false"
      class="gate-dialog"
      header="下载报告前的准备"
      :style="{ width: '560px', maxWidth: '90vw' }"
    >
      <div v-if="gateStep === 1" class="gate-step">
        <h3>步骤一：阅读《偏好差异实验笔记》</h3>
        <p>
          点击下方按钮在新标签页打开文章，完成其中的互动任务。系统会实时记录你的阅读时长与验证进度，达标后即可继续。
        </p>
        <Button
          label="打开文章任务（新窗口）"
          icon="pi pi-external-link"
          severity="help"
          outlined
          @click="openArticle"
        />
        <div class="article-status">
          <p class="article-duration">
            已累计阅读：<strong>{{ formattedArticleDuration }}</strong>
            <span class="article-required"> / 目标 {{ requiredArticleMinutes }} 分钟</span>
          </p>
          <Message :severity="articleCompleted ? 'success' : 'info'" :closable="false" class="gate-message">
            {{ articleStatusMessage }}
          </Message>
        </div>
      </div>

      <div v-else-if="gateStep === 2" class="gate-step">
        <h3>步骤二：逐行确认服务条款</h3>
        <p>请在滚动阅读完以下条款后勾选确认，方可继续下载流程。</p>
        <div class="terms-box">
          <p>
            我同意在未来七个工作日内每天回顾一次 MBTI 报告；我理解报告仅供个人反思，不构成专业建议；
            我授权平台在报告生成前提醒我完成所有准备事项；我确认已阅读所有细则并愿意承担未阅读导致的风险。
          </p>
          <p>
            若报告内容与现实不符，我将先进行自我复盘并记录 800 字学习心得，并在 48 小时内提交至平台。若未按时提交，视为自动放弃下载资格。
          </p>
        </div>
        <div class="checkbox-row">
          <Checkbox inputId="policy" v-model="policyChecked" binary />
          <label for="policy">我已完整阅读并同意以上条款</label>
        </div>
      </div>

      <div v-else-if="gateStep === 3" class="gate-step">
        <h3>步骤三：撰写分享文案</h3>
        <p>
          为了激励更多人参与测试，请写下你准备分享到社交平台的文案（至少 20 个字符）。
        </p>
        <IconField class="share-input" iconPosition="left">
          <InputIcon>
            <i class="pi pi-megaphone"></i>
          </InputIcon>
          <InputText v-model="shareText" placeholder="例：刚完成 30 题 MBTI 测试，快来挑战！" />
        </IconField>
        <small class="share-hint">已输入 {{ shareText.trim().length }} / 20 字</small>
      </div>

      <div v-else-if="gateStep === 4" class="gate-step">
        <h3>最终步骤：AI 正在生成报告</h3>
        <div class="thinking-status">
          <span class="thinking-highlight" :class="{ done: thinkingCompleted }">
            {{ thinkingCompleted ? `已思考 ${thinkingElapsed} 秒` : '思考中' }}
          </span>
        </div>
        <div class="thinking-loader" aria-hidden="true" v-if="!thinkingCompleted">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
        <ul class="thinking-messages">
          <li v-for="(message, index) in thinkingMessages" :key="index" class="thinking-message">
            {{ message }}
          </li>
        </ul>
        <p v-if="thinkingCompleted" class="thinking-ready">
          分析完成，点击下方按钮即可获取下载链接。
        </p>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <Button label="取消" icon="pi pi-times" severity="secondary" @click="closeGate" />
          <Button
            v-if="gateStep < 4"
            label="继续"
            icon="pi pi-arrow-right"
            :disabled="isContinueDisabled"
            @click="goToNextGate"
          />
          <Button
            v-else
            label="下载报告（完全免费！）"
            icon="pi pi-download"
            severity="success"
            :disabled="!thinkingCompleted"
            @click="finalizeGate"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Dialog from 'primevue/dialog'
import RadioButton from 'primevue/radiobutton'
import Checkbox from 'primevue/checkbox'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import ProgressBar from 'primevue/progressbar'
import Divider from 'primevue/divider'
import Message from 'primevue/message'

type DimensionKey = 'EI' | 'SN' | 'TF' | 'JP'

interface Question {
  id: number
  text: string
  dimension: DimensionKey
  orientation: 'first' | 'second'
}

const likertOptions = [
  { label: '非常不同意', value: 1 },
  { label: '不同意', value: 2 },
  { label: '中立', value: 3 },
  { label: '同意', value: 4 },
  { label: '非常同意', value: 5 }
]

const questions: Question[] = [
  { id: 1, text: '我在大型社交场合中会感到充满能量。', dimension: 'EI', orientation: 'first' },
  { id: 2, text: '社交结束后我需要独处来恢复精力。', dimension: 'EI', orientation: 'second' },
  { id: 3, text: '我常常主动与陌生人搭话。', dimension: 'EI', orientation: 'first' },
  { id: 4, text: '我更喜欢通过文字而非面对面表达想法。', dimension: 'EI', orientation: 'second' },
  { id: 5, text: '与大团队合作时我表现得更好。', dimension: 'EI', orientation: 'first' },
  { id: 6, text: '我通常会先默默想清楚再开口。', dimension: 'EI', orientation: 'second' },
  { id: 7, text: '身边的人形容我外向而热情。', dimension: 'EI', orientation: 'first' },
  { id: 8, text: '我倾向于关注具体的事实而非抽象概念。', dimension: 'SN', orientation: 'first' },
  { id: 9, text: '我喜欢畅想各种富有想象力的可能性。', dimension: 'SN', orientation: 'second' },
  { id: 10, text: '我更信赖久经验证的解决方案。', dimension: 'SN', orientation: 'first' },
  { id: 11, text: '我经常能发现别人忽视的模式与关联。', dimension: 'SN', orientation: 'second' },
  { id: 12, text: '我会用过往经验来指导当下的决定。', dimension: 'SN', orientation: 'first' },
  { id: 13, text: '我对面向未来的假设情景感到兴奋。', dimension: 'SN', orientation: 'second' },
  { id: 14, text: '相比哲学讨论，我更偏好实用的指导。', dimension: 'SN', orientation: 'first' },
  { id: 15, text: '我做决策时以客观分析为主要依据。', dimension: 'TF', orientation: 'first' },
  { id: 16, text: '我会优先考虑决定对他人情绪的影响。', dimension: 'TF', orientation: 'second' },
  { id: 17, text: '即便直率，我也愿意给出坦诚的反馈。', dimension: 'TF', orientation: 'first' },
  { id: 18, text: '为了维护团队和谐我愿意调整计划。', dimension: 'TF', orientation: 'second' },
  { id: 19, text: '我喜欢理性讨论观点并保持客观。', dimension: 'TF', orientation: 'first' },
  { id: 20, text: '在提出建议前我会先设身处地地共情。', dimension: 'TF', orientation: 'second' },
  { id: 21, text: '我认为公平意味着对所有人应用同一标准。', dimension: 'TF', orientation: 'first' },
  { id: 22, text: '开始做事前我习惯先制定详细计划。', dimension: 'JP', orientation: 'first' },
  { id: 23, text: '面对临时决定我通常也能从容应对。', dimension: 'JP', orientation: 'second' },
  { id: 24, text: '我会刻意保持工作环境的整洁有序。', dimension: 'JP', orientation: 'first' },
  { id: 25, text: '我希望日程保持弹性而不过度安排。', dimension: 'JP', orientation: 'second' },
  { id: 26, text: '我喜欢为项目设立清晰的里程碑。', dimension: 'JP', orientation: 'first' },
  { id: 27, text: '当出现新机会时我愿意即兴调整计划。', dimension: 'JP', orientation: 'second' },
  { id: 28, text: '计划被临时改变时我会感到压力。', dimension: 'JP', orientation: 'first' },
  { id: 29, text: '我常常在想法未成形前就先说出口。', dimension: 'EI', orientation: 'first' },
  { id: 30, text: '面对事实时我会探索背后的潜在含义。', dimension: 'SN', orientation: 'second' }
]

const dimensionLetters: Record<DimensionKey, [string, string]> = {
  EI: ['E', 'I'],
  SN: ['S', 'N'],
  TF: ['T', 'F'],
  JP: ['J', 'P']
}

const dimensionInfo: Record<DimensionKey, { title: string; description: Record<string, string> }> = {
  EI: {
    title: '能量流向',
    description: {
      E: '倾向从互动中汲取能量，乐于快速表达与协作。',
      I: '倾向在独处中恢复精力，喜欢深度思考后再分享。'
    }
  },
  SN: {
    title: '信息获取',
    description: {
      S: '偏好务实的事实与经验，注重细节与可验证的证据。',
      N: '偏好洞察未来的可能性，善于发掘联系与隐含意义。'
    }
  },
  TF: {
    title: '决策方式',
    description: {
      T: '倾向运用逻辑推理和一致标准来权衡选项。',
      F: '倾向综合个人价值与他人感受来做出决定。'
    }
  },
  JP: {
    title: '生活节奏',
    description: {
      J: '偏好结构化的流程与明确计划，享受掌控感。',
      P: '偏好灵活开放的安排，乐于应对突发与变化。'
    }
  }
}

const dimensionOrder: DimensionKey[] = ['EI', 'SN', 'TF', 'JP']

const dimensionCounts = dimensionOrder.reduce<Record<DimensionKey, number>>((acc, key) => {
  acc[key] = questions.filter((question) => question.dimension === key).length
  return acc
}, { EI: 0, SN: 0, TF: 0, JP: 0 })

const responses = reactive<Record<number, number>>({})

const answeredCount = computed(() => questions.filter((question) => responses[question.id] !== undefined).length)
const progressValue = computed(() => Math.round((answeredCount.value / questions.length) * 100))
const allAnswered = computed(() => answeredCount.value === questions.length)

const dimensionTotals = computed(() => {
  const totals: Record<DimensionKey, number> = { EI: 0, SN: 0, TF: 0, JP: 0 }

  questions.forEach((question) => {
    const response = responses[question.id]
    if (response === undefined) {
      return
    }
    const delta = response - 3
    const weighted = question.orientation === 'first' ? delta : -delta
    totals[question.dimension] += weighted
  })

  return totals
})

const dimensionSummaries = computed(() => {
  return dimensionOrder.map((key) => {
    const [firstLetter, secondLetter] = dimensionLetters[key]
    const score = dimensionTotals.value[key]
    const maxScore = dimensionCounts[key] * 2
    const firstPercent = Math.round(((score + maxScore) / (2 * maxScore)) * 100)
    const primaryLetter = score >= 0 ? firstLetter : secondLetter
    const strength = Math.round((Math.abs(score) / maxScore) * 100)

    return {
      key,
      title: dimensionInfo[key].title,
      letters: [firstLetter, secondLetter] as [string, string],
      firstPercent,
      secondPercent: 100 - firstPercent,
      primaryLetter,
      strength,
      description: dimensionInfo[key].description[primaryLetter],
      score
    }
  })
})

const fullMbtiType = computed(() =>
  dimensionOrder
    .map((key) => dimensionSummaries.value.find((summary) => summary.key === key)!.primaryLetter)
    .join('')
)

const showResults = ref(false)
const showValidationMessage = ref(false)

const handleShowResults = () => {
  if (allAnswered.value) {
    showResults.value = true
    showValidationMessage.value = false
    return
  }
  showValidationMessage.value = true
}

const router = useRouter()

const ARTICLE_STORAGE_KEY = 'mbtiArticleProgress'
const ARTICLE_REQUIRED_SECONDS = 120

const showGateDialog = ref(false)
const gateStep = ref(0)
const policyChecked = ref(false)
const shareText = ref('')

const articleReadDuration = ref(0)
const articleCompleted = ref(false)
const articleProgressInterval = ref<number | undefined>()
let articleListenersAttached = false

const FULL_RESULTS_STORAGE_KEY = 'mbtiFullResultsUnlocked'
let insightsResetPerformed = false

const INSIGHT_ARTICLES = [
  {
    storageKey: 'mbtiInsightAlpha',
    routeName: 'InsightOne',
    title: '文章一：洞察偏好与沟通错位',
    requiredSeconds: 90
  },
  {
    storageKey: 'mbtiInsightBeta',
    routeName: 'InsightTwo',
    title: '文章二：为偏好设计辅助习惯',
    requiredSeconds: 90
  }
]

const insightStates = reactive(
  INSIGHT_ARTICLES.map(() => ({
    duration: 0,
    completed: false
  }))
)

const resetInsightStates = (options?: { clearStorage?: boolean }) => {
  insightStates.forEach((state) => {
    state.duration = 0
    state.completed = false
  })
  if (options?.clearStorage && typeof window !== 'undefined') {
    INSIGHT_ARTICLES.forEach((article) => {
      try {
        localStorage.removeItem(article.storageKey)
      } catch (error) {
        console.warn(`无法清除 ${article.storageKey} 进度`, error)
      }
    })
  }
}

const insightMonitorInterval = ref<number | undefined>()
let insightListenersAttached = false
let globalListenersAttached = false

const thinkingDuration = ref(0)
const thinkingElapsed = ref(0)
const thinkingCompleted = ref(false)
const thinkingMessages = ref<string[]>([])
const thinkingInterval = ref<number | undefined>()
const thinkingMessageInterval = ref<number | undefined>()

const formStartTime = ref<number | null>(null)
const wastedMessage = ref('')
const fullResultsUnlocked = ref(false)

const formatSeconds = (value: number) => {
  const minutes = Math.floor(value / 60)
  const seconds = Math.max(value % 60, 0)
  const minutePart = minutes > 0 ? `${minutes} 分 ` : ''
  return `${minutePart}${seconds} 秒`
}

const formatDurationLong = (value: number) => {
  const minutes = Math.floor(value / 60)
  const seconds = Math.max(value % 60, 0)
  const minutePart = minutes > 0 ? `${minutes} 分` : ''
  const secondPart = `${seconds} 秒`
  return minutePart ? `${minutePart} ${secondPart}` : secondPart
}

const formattedArticleDuration = computed(() => formatSeconds(articleReadDuration.value))
const requiredArticleMinutes = computed(() => Math.ceil(ARTICLE_REQUIRED_SECONDS / 60))
const remainingArticleSeconds = computed(() => Math.max(ARTICLE_REQUIRED_SECONDS - articleReadDuration.value, 0))
const formattedArticleRemaining = computed(() => formatSeconds(remainingArticleSeconds.value))
const articleStatusMessage = computed(() => {
  if (articleCompleted.value) {
    return `验证完成：已累计阅读 ${formattedArticleDuration.value} 并通过所有互动。`
  }
  if (articleReadDuration.value > 0) {
    return `已读取 ${formattedArticleDuration.value}，再坚持 ${formattedArticleRemaining.value} 并完成互动验证即可继续。`
  }
  return '点击上方按钮在新标签页打开任务，完成互动并返回后即可解锁下一步。'
})

const visibleDimensionCount = computed(() => Math.ceil(dimensionSummaries.value.length / 2))

const displayedMbtiType = computed(() => {
  if (fullResultsUnlocked.value) {
    return fullMbtiType.value
  }
  const letters = dimensionOrder.map((key, index) => {
    const summary = dimensionSummaries.value.find((item) => item.key === key)
    if (!summary) {
      return '?'
    }
    if (index < visibleDimensionCount.value) {
      return summary.primaryLetter
    }
    return '?'
  })
  return letters.join('')
})

const insightCompletionStates = computed(() =>
  insightStates.map((state, index) => {
    const article = INSIGHT_ARTICLES[index]
    const meetsDuration = state.duration >= article.requiredSeconds
    return {
      ...state,
      meetsDuration,
      requiredSeconds: article.requiredSeconds,
      title: article.title
    }
  })
)

const insightTaskDetails = computed(() =>
  insightCompletionStates.value.map((state, index) => {
    const remaining = Math.max(state.requiredSeconds - state.duration, 0)
    return {
      ...state,
      index,
      formattedDuration: formatSeconds(state.duration),
      formattedRemaining: formatSeconds(remaining),
      remaining
    }
  })
)

const insightsCompleted = computed(() => insightCompletionStates.value.every((state) => state.completed && state.meetsDuration))

const thinkingMessagesPool = [
  '正在对四个偏好维度进行归一化处理…',
  '对照 200+ 历史案例，分析回答倾向…',
  '调优外向／内向的概率权重…',
  '检测直觉与实感答案的一致性…',
  '评估情感与思考维度的分布曲线…',
  '计算判断与感知之间的置信区间…',
  '生成个性化反馈语料候选…',
  '综合交叉验证结果，构建最终报告草稿…'
]

const isContinueDisabled = computed(() => {
  if (gateStep.value === 1) {
    return !articleCompleted.value
  }
  if (gateStep.value === 2) {
    return !policyChecked.value
  }
  if (gateStep.value === 3) {
    return shareText.value.trim().length < 20
  }
  return false
})

const openArticle = () => {
  if (typeof window === 'undefined') {
    return
  }
  const articleUrl = router.resolve({ name: 'Article' }).href
  window.open(articleUrl, '_blank', 'noopener')
}

const attachGlobalListeners = () => {
  if (globalListenersAttached || typeof window === 'undefined') {
    return
  }
  window.addEventListener('storage', handleStorageEvent)
  window.addEventListener('focus', handleWindowFocus)
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange)
  }
  globalListenersAttached = true
}

const detachGlobalListeners = () => {
  if (globalListenersAttached && !articleListenersAttached && !insightListenersAttached && typeof window !== 'undefined') {
    window.removeEventListener('storage', handleStorageEvent)
    window.removeEventListener('focus', handleWindowFocus)
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
    globalListenersAttached = false
  }
}

const stopArticleMonitoring = () => {
  if (articleProgressInterval.value !== undefined && typeof window !== 'undefined') {
    window.clearInterval(articleProgressInterval.value)
  }
  articleProgressInterval.value = undefined
  articleListenersAttached = false
  detachGlobalListeners()
}

const updateArticleProgress = () => {
  if (typeof window === 'undefined') {
    return
  }
  try {
    const raw = localStorage.getItem(ARTICLE_STORAGE_KEY)
    if (!raw) {
      articleReadDuration.value = 0
      articleCompleted.value = false
      return
    }
    const data = JSON.parse(raw) as { completed?: boolean; duration?: number }
    const duration = typeof data.duration === 'number' ? Math.max(0, Math.floor(data.duration)) : 0
    articleReadDuration.value = duration
    const meetsTime = duration >= ARTICLE_REQUIRED_SECONDS
    articleCompleted.value = Boolean(data.completed) && meetsTime
  } catch (error) {
    console.warn('无法读取文章进度', error)
  }
}

const updateInsightProgress = () => {
  if (typeof window === 'undefined') {
    return
  }
  INSIGHT_ARTICLES.forEach((article, index) => {
    try {
      const raw = localStorage.getItem(article.storageKey)
      if (!raw) {
        insightStates[index].duration = 0
        insightStates[index].completed = false
        return
      }
      const data = JSON.parse(raw) as { completed?: boolean; duration?: number }
      const duration = typeof data.duration === 'number' ? Math.max(0, Math.floor(data.duration)) : 0
      insightStates[index].duration = duration
      insightStates[index].completed = Boolean(data.completed)
    } catch (error) {
      console.warn(`无法读取 ${article.storageKey} 进度`, error)
    }
  })
}

const handleStorageEvent = (event: StorageEvent) => {
  if (!event.key || event.key === ARTICLE_STORAGE_KEY) {
    updateArticleProgress()
  }
  if (!event.key || INSIGHT_ARTICLES.some((article) => article.storageKey === event.key)) {
    updateInsightProgress()
  }
}

const handleVisibilityChange = () => {
  if (typeof document !== 'undefined' && !document.hidden) {
    updateArticleProgress()
    updateInsightProgress()
  }
}

const handleWindowFocus = () => {
  updateArticleProgress()
  updateInsightProgress()
}

const startArticleMonitoring = () => {
  if (typeof window === 'undefined') {
    return
  }
  stopArticleMonitoring()
  updateArticleProgress()
  attachGlobalListeners()
  articleListenersAttached = true
  articleProgressInterval.value = window.setInterval(updateArticleProgress, 1000)
}

const startInsightMonitoring = () => {
  if (typeof window === 'undefined') {
    return
  }
  stopInsightMonitoring()
  updateInsightProgress()
  attachGlobalListeners()
  insightListenersAttached = true
  insightMonitorInterval.value = window.setInterval(updateInsightProgress, 1000)
}

const stopInsightMonitoring = () => {
  if (insightMonitorInterval.value !== undefined && typeof window !== 'undefined') {
    window.clearInterval(insightMonitorInterval.value)
  }
  insightMonitorInterval.value = undefined
  insightListenersAttached = false
  detachGlobalListeners()
}

const persistFullResultsUnlock = () => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        FULL_RESULTS_STORAGE_KEY,
        JSON.stringify({ unlocked: true, timestamp: Date.now() })
      )
    }
  } catch (error) {
    console.warn('无法记录完整报告解锁状态', error)
  }
}

const initializeFullResultsState = () => {
  if (typeof window === 'undefined') {
    return
  }
  try {
    const raw = localStorage.getItem(FULL_RESULTS_STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw) as { unlocked?: boolean }
      if (data.unlocked) {
        fullResultsUnlocked.value = true
      }
    }
  } catch (error) {
    console.warn('无法读取完整报告解锁状态', error)
  }
  if (!fullResultsUnlocked.value) {
    updateInsightProgress()
    if (insightsCompleted.value) {
      fullResultsUnlocked.value = true
      persistFullResultsUnlock()
    }
  }
}

const openInsightArticle = (index: number) => {
  const article = INSIGHT_ARTICLES[index]
  if (!article || typeof window === 'undefined') {
    return
  }
  const url = router.resolve({ name: article.routeName }).href
  window.open(url, '_blank', 'noopener')
}

const refreshInsightProgress = () => {
  updateInsightProgress()
}

const resetArticleState = (options?: { clearStorage?: boolean }) => {
  stopArticleMonitoring()
  articleReadDuration.value = 0
  articleCompleted.value = false
  if (options?.clearStorage) {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(ARTICLE_STORAGE_KEY)
      }
    } catch (error) {
      console.warn('无法清除文章进度', error)
    }
  }
}

const clearFullResultsPersistence = () => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(FULL_RESULTS_STORAGE_KEY)
    }
  } catch (error) {
    console.warn('无法清除完整报告解锁记录', error)
  }
}

const resetGateState = (options?: { clearStorage?: boolean }) => {
  gateStep.value = 0
  policyChecked.value = false
  shareText.value = ''
  resetArticleState({ clearStorage: options?.clearStorage })
  clearThinkingProcess()
}

const beginGateFlow = () => {
  resetGateState({ clearStorage: true })
  gateStep.value = 1
  showGateDialog.value = true
  startArticleMonitoring()
}

const goToNextGate = () => {
  if (gateStep.value === 1 && !articleCompleted.value) {
    return
  }
  if (gateStep.value === 2 && !policyChecked.value) {
    return
  }
  if (gateStep.value === 3 && shareText.value.trim().length < 20) {
    return
  }

  if (gateStep.value === 1) {
    stopArticleMonitoring()
  }

  gateStep.value += 1
}

const stopThinkingIntervals = () => {
  if (thinkingInterval.value !== undefined) {
    window.clearInterval(thinkingInterval.value)
    thinkingInterval.value = undefined
  }
  if (thinkingMessageInterval.value !== undefined) {
    window.clearInterval(thinkingMessageInterval.value)
    thinkingMessageInterval.value = undefined
  }
}

const clearThinkingProcess = () => {
  stopThinkingIntervals()
  thinkingDuration.value = 0
  thinkingElapsed.value = 0
  thinkingCompleted.value = false
  thinkingMessages.value = []
}

const startThinkingProcess = () => {
  clearThinkingProcess()
  thinkingDuration.value = Math.floor(30 + Math.random() * 31)
  const pool = [...thinkingMessagesPool].sort(() => Math.random() - 0.5)
  let messageIndex = 0
  if (pool.length > 0) {
    thinkingMessages.value = [pool[messageIndex]]
    messageIndex += 1
  }

  thinkingMessageInterval.value = window.setInterval(() => {
    if (messageIndex >= pool.length || thinkingCompleted.value) {
      return
    }
    thinkingMessages.value = [...thinkingMessages.value, pool[messageIndex]]
    messageIndex += 1
  }, 4000)

  thinkingElapsed.value = 0
  thinkingInterval.value = window.setInterval(() => {
    if (thinkingElapsed.value < thinkingDuration.value) {
      thinkingElapsed.value += 1
      if (thinkingElapsed.value >= thinkingDuration.value) {
        stopThinkingIntervals()
        thinkingCompleted.value = true
        thinkingMessages.value = [
          ...thinkingMessages.value,
          '分析完成：已将你的回答映射至 16 种人格模型。'
        ]
      }
      return
    }
  }, 1000)
}

const finalizeGate = () => {
  stopArticleMonitoring()
  stopThinkingIntervals()
  resetGateState({ clearStorage: true })
  showGateDialog.value = false
  const downloadUrl = 'https://wdf.ink/6OUp'
  if (typeof window !== 'undefined') {
    window.open(downloadUrl, '_blank', 'noopener')
  }
  const endTimestamp = Date.now()
  if (formStartTime.value === null) {
    formStartTime.value = endTimestamp
  }
  const elapsedMs = endTimestamp - (formStartTime.value ?? endTimestamp)
  const elapsedSeconds = Math.max(0, Math.floor(elapsedMs / 1000))
  wastedMessage.value = `恭喜你成功浪费了你人生中的 ${formatDurationLong(elapsedSeconds)}`
}

const closeGate = () => {
  stopArticleMonitoring()
  showGateDialog.value = false
  resetGateState({ clearStorage: true })
}

onMounted(() => {
  if (!insightsResetPerformed) {
    clearFullResultsPersistence()
    resetInsightStates({ clearStorage: true })
    insightsResetPerformed = true
  }
  initializeFullResultsState()
  if (showResults.value && !fullResultsUnlocked.value) {
    startInsightMonitoring()
  }
})

watch(gateStep, (value, previous) => {
  if (value === 1) {
    startArticleMonitoring()
  }
  if (previous === 1 && value !== 1) {
    stopArticleMonitoring()
  }
  if (value === 4) {
    startThinkingProcess()
  }
  if (previous === 4 && value !== 4) {
    clearThinkingProcess()
  }
})

watch(showResults, (value) => {
  if (value) {
    updateInsightProgress()
    if (!fullResultsUnlocked.value) {
      startInsightMonitoring()
    }
  } else {
    stopInsightMonitoring()
  }
})

watch(insightsCompleted, (value) => {
  if (value) {
    if (!fullResultsUnlocked.value) {
      fullResultsUnlocked.value = true
    }
    persistFullResultsUnlock()
    stopInsightMonitoring()
  }
})

watch(answeredCount, (value, previous) => {
  if (value > 0 && (formStartTime.value === null || previous === 0)) {
    formStartTime.value = Date.now()
  }
})

onBeforeUnmount(() => {
  stopArticleMonitoring()
  stopInsightMonitoring()
  stopThinkingIntervals()
})
</script>

<style scoped>
.layout {
  max-width: 960px;
  margin: 2rem auto;
  padding: 0 1rem 4rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.intro-card {
  position: sticky;
  top: 5rem;
  z-index: 1;
}

.intro-text {
  margin-bottom: 1rem;
  color: #4b5563;
}

.progress-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-bar {
  height: 0.75rem;
}

.progress-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.question-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.question-card {
  box-shadow: none;
}

.question-text {
  margin-bottom: 1rem;
  color: #1f2937;
}

.options-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 1.5rem;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.actions-card {
  box-shadow: none;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: flex-start;
}

.validation-message {
  width: 100%;
}

.result-card {
  box-shadow: none;
}

.result-text {
  color: #4b5563;
}

.dimension-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  align-items: stretch;
}

.dimension-card {
  box-shadow: none;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.dimension-card.is-locked {
  opacity: 0.75;
}

.dimension-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.dimension-progress {
  height: 0.75rem;
}

.dimension-stats {
  display: flex;
  flex-direction: column;
  font-size: 0.875rem;
  color: #374151;
  gap: 0.25rem;
}

.dimension-description {
  font-size: 0.875rem;
  color: #6b7280;
}

.dimension-locked {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1rem;
  gap: 0.5rem;
  color: rgba(15, 23, 42, 0.7);
  text-align: center;
  font-weight: 600;
}

.dimension-locked i {
  font-size: 1.75rem;
  color: #6366f1;
}

.insight-message {
  margin-top: 1.5rem;
}

.insight-task-grid {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.25rem;
}

.insight-task-card {
  background: rgba(255, 255, 255, 0.85);
  border: none;
  border-radius: 18px;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.12);
}

.insight-task-card.is-complete {
  box-shadow: 0 24px 60px rgba(34, 197, 94, 0.22);
}

.insight-task-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
}

.insight-task-title i {
  font-size: 1.1rem;
  color: #6366f1;
}

.insight-task-card.is-complete .insight-task-title i {
  color: #22c55e;
}

.insight-task-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.insight-progress {
  margin: 0;
  font-weight: 600;
  color: rgba(15, 23, 42, 0.85);
}

.insight-remaining {
  margin: 0;
  color: rgba(15, 23, 42, 0.65);
}

.insight-actions {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
}

.download-area {
  display: flex;
  justify-content: center;
}

.wasted-banner {
  margin-top: 2rem;
  padding: 2rem;
  border-radius: 1.5rem;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.18), rgba(236, 72, 153, 0.2));
  color: #0f172a;
  font-size: clamp(1.5rem, 5vw, 2.25rem);
  font-weight: 800;
  text-align: center;
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.15);
  backdrop-filter: blur(6px);
}

.gate-dialog ::v-deep(.p-dialog-content) {
  padding-top: 1.5rem;
}

.gate-step {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.article-status {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.article-duration {
  margin: 0;
  font-weight: 600;
  color: #1f2937;
}

.article-duration strong {
  color: #1d4ed8;
}

.article-required {
  font-size: 0.85rem;
  color: #64748b;
}

.gate-message {
  width: 100%;
}

.terms-box {
  max-height: 160px;
  overflow-y: auto;
  padding: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.75rem;
  background: #f9fafb;
  color: #374151;
  line-height: 1.6;
}

.checkbox-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.share-input {
  width: 100%;
  display: block;
}

.share-input :deep(.p-inputtext) {
  width: 100%;
}

.share-hint {
  font-size: 0.75rem;
  color: #6b7280;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.thinking-status {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.thinking-highlight {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(96, 165, 250, 0.25), rgba(14, 165, 233, 0.35));
  color: #0f172a;
  font-weight: 600;
  transition: all 0.3s ease;
}

.thinking-highlight.done {
  background: linear-gradient(90deg, rgba(16, 185, 129, 0.3), rgba(59, 130, 246, 0.35));
}

.thinking-dots {
  font-weight: 600;
  letter-spacing: 0.15rem;
  color: #38bdf8;
}

.thinking-loader {
  display: inline-flex;
  gap: 0.25rem;
  margin-top: 0.75rem;
}

.thinking-loader .dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: #38bdf8;
  animation: pulse 1.2s infinite ease-in-out;
}

.thinking-loader .dot:nth-child(2) {
  animation-delay: 0.15s;
}

.thinking-loader .dot:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(0.75);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}

.thinking-messages {
  list-style: none;
  margin: 1rem 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 200px;
  overflow-y: auto;
}

.thinking-message {
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  background: rgba(226, 232, 240, 0.55);
  color: #1f2937;
  font-size: 0.9rem;
  line-height: 1.5;
}

.thinking-ready {
  margin-top: 0.5rem;
  color: #047857;
  font-weight: 600;
}

@media (max-width: 640px) {
  .layout {
    margin-top: 1rem;
  }

  .intro-card {
    position: static;
  }

  .options-grid {
    flex-direction: column;
  }

  .dimension-grid,
  .insight-task-grid {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }
}
</style>
