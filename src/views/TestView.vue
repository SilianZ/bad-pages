<template>
  <div class="layout">
    <Silian_Card class="intro-card">
      <template #title>30 题 MBTI 性格测试</template>
      <template #content>
        <p class="intro-text">
          请选择最贴近你真实想法的选项，本测验共 30 题，采用 5 点量表。完成答题后可生成 MBTI 类型报告。
        </p>
        <div class="progress-section">
          <Silian_ProgressBar :value="Silian_progressValue" :showValue="false" class="progress-bar" />
          <span class="progress-label">{{ Silian_progressValue }}% 已完成（{{ Silian_answeredCount }} / {{ Silian_questions.length }}）</span>
        </div>
      </template>
    </Silian_Card>

    <div class="question-list">
      <Silian_Card v-for="Silian_question in Silian_questions" :key="Silian_question.id" class="question-card">
        <template #title>第 {{ Silian_question.id }} 题</template>
        <template #content>
          <p class="question-text">{{ Silian_question.text }}</p>
          <div class="options-grid">
            <div v-for="Silian_option in Silian_likertOptions" :key="Silian_option.value" class="option-item">
              <Silian_RadioButton
                :inputId="`q-${Silian_question.id}-${Silian_option.value}`"
                v-model="Silian_responses[Silian_question.id]"
                :value="Silian_option.value"
              />
              <label :for="`q-${Silian_question.id}-${Silian_option.value}`">{{ Silian_option.label }}</label>
            </div>
          </div>
        </template>
      </Silian_Card>
    </div>

    <Silian_Card class="actions-card">
      <template #content>
        <div class="actions">
          <Silian_Button
            label="生成测试结果"
            icon="pi pi-chart-line"
            :disabled="!Silian_allAnswered"
            @click="Silian_handleShowResults"
          />
          <Silian_Message
            v-if="Silian_showValidationMessage"
            severity="warn"
            class="validation-message"
            :closable="false"
          >
            仍有题目未作答，请完成全部 30 题再生成结果。
          </Silian_Message>
        </div>
      </template>
    </Silian_Card>

    <div v-if="Silian_showResults" class="result-wrapper">
      <Silian_Card class="result-card">
        <template #title>你的 MBTI 类型：{{ Silian_displayedMbtiType }}</template>
        <template #content>
          <p class="result-text">
            以下为每个维度的倾向与强度，仅供自我探索参考。
          </p>
          <Silian_Divider />
          <div class="dimension-grid">
            <Silian_Card
              v-for="(Silian_dimension, Silian_index) in Silian_dimensionSummaries"
              :key="Silian_dimension.key"
              class="dimension-card"
              :class="{ 'is-locked': !Silian_fullResultsUnlocked && Silian_index >= Silian_visibleDimensionCount }"
            >
              <template #title>{{ Silian_dimension.title }}（{{ Silian_dimension.letters[0] }} / {{ Silian_dimension.letters[1] }}）</template>
              <template #content>
                <div v-if="Silian_fullResultsUnlocked || Silian_index < Silian_visibleDimensionCount" class="dimension-body">
                  <Silian_ProgressBar :value="Silian_dimension.firstPercent" :showValue="false" class="dimension-progress" />
                  <div class="dimension-stats">
                    <span>{{ Silian_dimension.letters[0] }} {{ Silian_dimension.firstPercent }}% · {{ Silian_dimension.letters[1] }} {{ Silian_dimension.secondPercent }}%</span>
                    <span>偏好：{{ Silian_dimension.primaryLetter }}（强度 {{ Silian_dimension.strength }}%）</span>
                  </div>
                  <p class="dimension-description">{{ Silian_dimension.description }}</p>
                </div>
                <div v-else class="dimension-locked">
                  <i class="pi pi-lock"></i>
                  <p>完整分析已锁定</p>
                  <small>阅读两篇偏好文章即可解锁此维度的洞察。</small>
                </div>
              </template>
            </Silian_Card>
          </div>
          <template v-if="!Silian_fullResultsUnlocked">
            <Silian_Message severity="warn" class="insight-message" :closable="false">
              当前仅展示 50% 维度洞察。阅读以下两篇偏好拓展文章（预计共 3 分钟）即可解锁完整报告。
            </Silian_Message>
            <div class="insight-task-grid">
              <Silian_Card
                v-for="Silian_task in Silian_insightTaskDetails"
                :key="Silian_task.index"
                class="insight-task-card"
                :class="{ 'is-complete': Silian_task.completed && Silian_task.meetsDuration }"
              >
                <template #title>
                  <div class="insight-task-title">
                    <i :class="Silian_task.completed && Silian_task.meetsDuration ? 'pi pi-check-circle' : 'pi pi-book'" />
                    <span>{{ Silian_task.title }}</span>
                  </div>
                </template>
                <template #content>
                  <div class="insight-task-body">
                    <p class="insight-progress">
                      已阅读 {{ Silian_task.formattedDuration }} / 目标 {{ Silian_formatSeconds(Silian_task.requiredSeconds) }}
                    </p>
                    <p v-if="!Silian_task.meetsDuration" class="insight-remaining">
                      仍需约 {{ Silian_task.formattedRemaining }} 并完成文章内互动
                    </p>
                    <Silian_Button
                      label="打开文章"
                      icon="pi pi-external-link"
                      severity="help"
                      outlined
                      @click="Silian_openInsightArticle(Silian_task.index)"
                    />
                  </div>
                </template>
              </Silian_Card>
            </div>
            <div class="insight-actions">
              <Silian_Button
                label="刷新进度"
                icon="pi pi-refresh"
                severity="secondary"
                outlined
                @click="Silian_refreshInsightProgress"
              />
            </div>
          </template>
          <template v-else>
            <Silian_Divider />
            <div class="download-area">
              <Silian_Button label="下载报告（完全免费！）" icon="pi pi-download" severity="success" @click="Silian_beginGateFlow" />
            </div>
            <div v-if="Silian_wastedMessage" class="wasted-banner">
              {{ Silian_wastedMessage }}
            </div>
          </template>
        </template>
      </Silian_Card>
    </div>

    <Silian_Dialog
      v-model:visible="Silian_showGateDialog"
      modal
      :closable="false"
      class="gate-dialog"
      header="下载报告前的准备"
      :style="{ width: '560px', maxWidth: '90vw' }"
    >
      <div v-if="Silian_gateStep === 1" class="gate-step">
        <h3>步骤一：阅读《偏好差异实验笔记》</h3>
        <p>
          点击下方按钮在新标签页打开文章，完成其中的互动任务。系统会实时记录你的阅读时长与验证进度，达标后即可继续。
        </p>
        <Silian_Button
          label="打开文章任务（新窗口）"
          icon="pi pi-external-link"
          severity="help"
          outlined
          @click="Silian_openArticle"
        />
        <div class="article-status">
          <p class="article-duration">
            已累计阅读：<strong>{{ Silian_formattedArticleDuration }}</strong>
            <span class="article-required"> / 目标 {{ Silian_requiredArticleMinutes }} 分钟</span>
          </p>
          <Silian_Message :severity="Silian_articleCompleted ? 'success' : 'info'" :closable="false" class="gate-message">
            {{ Silian_articleStatusMessage }}
          </Silian_Message>
        </div>
      </div>

      <div v-else-if="Silian_gateStep === 2" class="gate-step">
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
          <Silian_Checkbox inputId="policy" v-model="Silian_policyChecked" binary />
          <label for="policy">我已完整阅读并同意以上条款</label>
        </div>
      </div>

      <div v-else-if="Silian_gateStep === 3" class="gate-step">
        <h3>步骤三：撰写分享文案</h3>
        <p>
          为了激励更多人参与测试，请写下你准备分享到社交平台的文案（至少 20 个字符）。
        </p>
        <Silian_IconField class="share-input" iconPosition="left">
          <Silian_InputIcon>
            <i class="pi pi-megaphone"></i>
          </Silian_InputIcon>
          <Silian_InputText v-model="Silian_shareText" placeholder="例：刚完成 30 题 MBTI 测试，快来挑战！" />
        </Silian_IconField>
        <small class="share-hint">已输入 {{ Silian_shareText.trim().length }} / 20 字</small>
      </div>

      <div v-else-if="Silian_gateStep === 4" class="gate-step">
        <h3>最终步骤：AI 正在生成报告</h3>
        <div class="thinking-status">
          <span class="thinking-highlight" :class="{ done: Silian_thinkingCompleted }">
            {{ Silian_thinkingCompleted ? `已思考 ${Silian_thinkingElapsed} 秒` : '思考中' }}
          </span>
        </div>
        <div class="thinking-loader" aria-hidden="true" v-if="!Silian_thinkingCompleted">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
        <ul class="thinking-messages">
          <li v-for="(Silian_message, Silian_index) in Silian_thinkingMessages" :key="Silian_index" class="thinking-message">
            {{ Silian_message }}
          </li>
        </ul>
        <p v-if="Silian_thinkingCompleted" class="thinking-ready">
          分析完成，点击下方按钮即可获取下载链接。
        </p>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <Silian_Button label="取消" icon="pi pi-times" severity="secondary" @click="Silian_closeGate" />
          <Silian_Button
            v-if="Silian_gateStep < 4"
            label="继续"
            icon="pi pi-arrow-right"
            :disabled="Silian_isContinueDisabled"
            @click="Silian_goToNextGate"
          />
          <Silian_Button
            v-else
            label="下载报告（完全免费！）"
            icon="pi pi-download"
            severity="success"
            :disabled="!Silian_thinkingCompleted"
            @click="Silian_finalizeGate"
          />
        </div>
      </template>
    </Silian_Dialog>
  </div>
</template>

<script setup lang="ts">
import { computed as Silian_computed, onBeforeUnmount as Silian_onBeforeUnmount, onMounted as Silian_onMounted, reactive as Silian_reactive, ref as Silian_ref, watch as Silian_watch } from 'vue';
import { useRouter as Silian_useRouter } from 'vue-router';
import Silian_Button from 'primevue/button';
import Silian_Card from 'primevue/card';
import Silian_Dialog from 'primevue/dialog';
import Silian_RadioButton from 'primevue/radiobutton';
import Silian_Checkbox from 'primevue/checkbox';
import Silian_InputText from 'primevue/inputtext';
import Silian_IconField from 'primevue/iconfield';
import Silian_InputIcon from 'primevue/inputicon';
import Silian_ProgressBar from 'primevue/progressbar';
import Silian_Divider from 'primevue/divider';
import Silian_Message from 'primevue/message';
type Silian_DimensionKey = 'EI' | 'SN' | 'TF' | 'JP';
interface Silian_Question {
    id: number;
    text: string;
    dimension: Silian_DimensionKey;
    orientation: 'first' | 'second';
}
const Silian_likertOptions = [
    { label: '非常不同意', value: 1 },
    { label: '不同意', value: 2 },
    { label: '中立', value: 3 },
    { label: '同意', value: 4 },
    { label: '非常同意', value: 5 }
];
const Silian_questions: Silian_Question[] = [
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
];
const Silian_dimensionLetters: Record<Silian_DimensionKey, [
    string,
    string
]> = {
    EI: ['E', 'I'],
    SN: ['S', 'N'],
    TF: ['T', 'F'],
    JP: ['J', 'P']
};
const Silian_dimensionInfo: Record<Silian_DimensionKey, {
    title: string;
    description: Record<string, string>;
}> = {
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
};
const Silian_dimensionOrder: Silian_DimensionKey[] = ['EI', 'SN', 'TF', 'JP'];
const Silian_dimensionCounts = Silian_dimensionOrder.reduce<Record<Silian_DimensionKey, number>>((Silian_acc, Silian_key) => {
    Silian_acc[Silian_key] = Silian_questions.filter((Silian_question) => Silian_question.dimension === Silian_key).length;
    return Silian_acc;
}, { EI: 0, SN: 0, TF: 0, JP: 0 });
const Silian_responses = Silian_reactive<Record<number, number>>({});
const Silian_answeredCount = Silian_computed(() => Silian_questions.filter((Silian_question) => Silian_responses[Silian_question.id] !== undefined).length);
const Silian_progressValue = Silian_computed(() => Math.round((Silian_answeredCount.value / Silian_questions.length) * 100));
const Silian_allAnswered = Silian_computed(() => Silian_answeredCount.value === Silian_questions.length);
const Silian_dimensionTotals = Silian_computed(() => {
    const Silian_totals: Record<Silian_DimensionKey, number> = { EI: 0, SN: 0, TF: 0, JP: 0 };
    Silian_questions.forEach((Silian_question) => {
        const Silian_response = Silian_responses[Silian_question.id];
        if (Silian_response === undefined) {
            return;
        }
        const Silian_delta = Silian_response - 3;
        const Silian_weighted = Silian_question.orientation === 'first' ? Silian_delta : -Silian_delta;
        Silian_totals[Silian_question.dimension] += Silian_weighted;
    });
    return Silian_totals;
});
const Silian_dimensionSummaries = Silian_computed(() => {
    return Silian_dimensionOrder.map((Silian_key) => {
        const [Silian_firstLetter, Silian_secondLetter] = Silian_dimensionLetters[Silian_key];
        const Silian_score = Silian_dimensionTotals.value[Silian_key];
        const Silian_maxScore = Silian_dimensionCounts[Silian_key] * 2;
        const Silian_firstPercent = Math.round(((Silian_score + Silian_maxScore) / (2 * Silian_maxScore)) * 100);
        const Silian_primaryLetter = Silian_score >= 0 ? Silian_firstLetter : Silian_secondLetter;
        const Silian_strength = Math.round((Math.abs(Silian_score) / Silian_maxScore) * 100);
        return {
            key: Silian_key,
            title: Silian_dimensionInfo[Silian_key].title,
            letters: [Silian_firstLetter, Silian_secondLetter] as [
                string,
                string
            ],
            firstPercent: Silian_firstPercent,
            secondPercent: 100 - Silian_firstPercent,
            primaryLetter: Silian_primaryLetter,
            strength: Silian_strength,
            description: Silian_dimensionInfo[Silian_key].description[Silian_primaryLetter],
            score: Silian_score
        };
    });
});
const Silian_fullMbtiType = Silian_computed(() => Silian_dimensionOrder.map((Silian_key) => Silian_dimensionSummaries.value.find((Silian_summary) => Silian_summary.key === Silian_key)!.primaryLetter)
    .join(''));
const Silian_showResults = Silian_ref(false);
const Silian_showValidationMessage = Silian_ref(false);
const Silian_handleShowResults = () => {
    if (Silian_allAnswered.value) {
        Silian_showResults.value = true;
        Silian_showValidationMessage.value = false;
        return;
    }
    Silian_showValidationMessage.value = true;
};
const Silian_router = Silian_useRouter();
const Silian_ARTICLE_STORAGE_KEY = 'mbtiArticleProgress';
const Silian_ARTICLE_REQUIRED_SECONDS = 120;
const Silian_showGateDialog = Silian_ref(false);
const Silian_gateStep = Silian_ref(0);
const Silian_policyChecked = Silian_ref(false);
const Silian_shareText = Silian_ref('');
const Silian_articleReadDuration = Silian_ref(0);
const Silian_articleCompleted = Silian_ref(false);
const Silian_articleProgressInterval = Silian_ref<number | undefined>();
let Silian_articleListenersAttached = false;
const Silian_FULL_RESULTS_STORAGE_KEY = 'mbtiFullResultsUnlocked';
let Silian_insightsResetPerformed = false;
const Silian_INSIGHT_ARTICLES = [
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
];
const Silian_insightStates = Silian_reactive(Silian_INSIGHT_ARTICLES.map(() => ({
    duration: 0,
    completed: false
})));
const Silian_resetInsightStates = (Silian_options?: {
    clearStorage?: boolean;
}) => {
    Silian_insightStates.forEach((Silian_state) => {
        Silian_state.duration = 0;
        Silian_state.completed = false;
    });
    if (Silian_options?.clearStorage && typeof window !== 'undefined') {
        Silian_INSIGHT_ARTICLES.forEach((Silian_article) => {
            try {
                localStorage.removeItem(Silian_article.storageKey);
            }
            catch (Silian_error) {
                console.warn(`无法清除 ${Silian_article.storageKey} 进度`, Silian_error);
            }
        });
    }
};
const Silian_insightMonitorInterval = Silian_ref<number | undefined>();
let Silian_insightListenersAttached = false;
let Silian_globalListenersAttached = false;
const Silian_thinkingDuration = Silian_ref(0);
const Silian_thinkingElapsed = Silian_ref(0);
const Silian_thinkingCompleted = Silian_ref(false);
const Silian_thinkingMessages = Silian_ref<string[]>([]);
const Silian_thinkingInterval = Silian_ref<number | undefined>();
const Silian_thinkingMessageInterval = Silian_ref<number | undefined>();
const Silian_formStartTime = Silian_ref<number | null>(null);
const Silian_wastedMessage = Silian_ref('');
const Silian_fullResultsUnlocked = Silian_ref(false);
const Silian_formatSeconds = (Silian_value: number) => {
    const Silian_minutes = Math.floor(Silian_value / 60);
    const Silian_seconds = Math.max(Silian_value % 60, 0);
    const Silian_minutePart = Silian_minutes > 0 ? `${Silian_minutes} 分 ` : '';
    return `${Silian_minutePart}${Silian_seconds} 秒`;
};
const Silian_formatDurationLong = (Silian_value: number) => {
    const Silian_minutes = Math.floor(Silian_value / 60);
    const Silian_seconds = Math.max(Silian_value % 60, 0);
    const Silian_minutePart = Silian_minutes > 0 ? `${Silian_minutes} 分` : '';
    const Silian_secondPart = `${Silian_seconds} 秒`;
    return Silian_minutePart ? `${Silian_minutePart} ${Silian_secondPart}` : Silian_secondPart;
};
const Silian_formattedArticleDuration = Silian_computed(() => Silian_formatSeconds(Silian_articleReadDuration.value));
const Silian_requiredArticleMinutes = Silian_computed(() => Math.ceil(Silian_ARTICLE_REQUIRED_SECONDS / 60));
const Silian_remainingArticleSeconds = Silian_computed(() => Math.max(Silian_ARTICLE_REQUIRED_SECONDS - Silian_articleReadDuration.value, 0));
const Silian_formattedArticleRemaining = Silian_computed(() => Silian_formatSeconds(Silian_remainingArticleSeconds.value));
const Silian_articleStatusMessage = Silian_computed(() => {
    if (Silian_articleCompleted.value) {
        return `验证完成：已累计阅读 ${Silian_formattedArticleDuration.value} 并通过所有互动。`;
    }
    if (Silian_articleReadDuration.value > 0) {
        return `已读取 ${Silian_formattedArticleDuration.value}，再坚持 ${Silian_formattedArticleRemaining.value} 并完成互动验证即可继续。`;
    }
    return '点击上方按钮在新标签页打开任务，完成互动并返回后即可解锁下一步。';
});
const Silian_visibleDimensionCount = Silian_computed(() => Math.ceil(Silian_dimensionSummaries.value.length / 2));
const Silian_displayedMbtiType = Silian_computed(() => {
    if (Silian_fullResultsUnlocked.value) {
        return Silian_fullMbtiType.value;
    }
    const Silian_letters = Silian_dimensionOrder.map((Silian_key, Silian_index) => {
        const Silian_summary = Silian_dimensionSummaries.value.find((Silian_item) => Silian_item.key === Silian_key);
        if (!Silian_summary) {
            return '?';
        }
        if (Silian_index < Silian_visibleDimensionCount.value) {
            return Silian_summary.primaryLetter;
        }
        return '?';
    });
    return Silian_letters.join('');
});
const Silian_insightCompletionStates = Silian_computed(() => Silian_insightStates.map((Silian_state, Silian_index) => {
    const Silian_article = Silian_INSIGHT_ARTICLES[Silian_index];
    const Silian_meetsDuration = Silian_state.duration >= Silian_article.requiredSeconds;
    return {
        ...Silian_state,
        meetsDuration: Silian_meetsDuration,
        requiredSeconds: Silian_article.requiredSeconds,
        title: Silian_article.title
    };
}));
const Silian_insightTaskDetails = Silian_computed(() => Silian_insightCompletionStates.value.map((Silian_state, Silian_index) => {
    const Silian_remaining = Math.max(Silian_state.requiredSeconds - Silian_state.duration, 0);
    return {
        ...Silian_state,
        index: Silian_index,
        formattedDuration: Silian_formatSeconds(Silian_state.duration),
        formattedRemaining: Silian_formatSeconds(Silian_remaining),
        remaining: Silian_remaining
    };
}));
const Silian_insightsCompleted = Silian_computed(() => Silian_insightCompletionStates.value.every((Silian_state) => Silian_state.completed && Silian_state.meetsDuration));
const Silian_thinkingMessagesPool = [
    '正在对四个偏好维度进行归一化处理…',
    '对照 200+ 历史案例，分析回答倾向…',
    '调优外向／内向的概率权重…',
    '检测直觉与实感答案的一致性…',
    '评估情感与思考维度的分布曲线…',
    '计算判断与感知之间的置信区间…',
    '生成个性化反馈语料候选…',
    '综合交叉验证结果，构建最终报告草稿…'
];
const Silian_isContinueDisabled = Silian_computed(() => {
    if (Silian_gateStep.value === 1) {
        return !Silian_articleCompleted.value;
    }
    if (Silian_gateStep.value === 2) {
        return !Silian_policyChecked.value;
    }
    if (Silian_gateStep.value === 3) {
        return Silian_shareText.value.trim().length < 20;
    }
    return false;
});
const Silian_openArticle = () => {
    if (typeof window === 'undefined') {
        return;
    }
    const Silian_articleUrl = Silian_router.resolve({ name: 'Article' }).href;
    window.open(Silian_articleUrl, '_blank', 'noopener');
};
const Silian_attachGlobalListeners = () => {
    if (Silian_globalListenersAttached || typeof window === 'undefined') {
        return;
    }
    window.addEventListener('storage', Silian_handleStorageEvent);
    window.addEventListener('focus', Silian_handleWindowFocus);
    if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', Silian_handleVisibilityChange);
    }
    Silian_globalListenersAttached = true;
};
const Silian_detachGlobalListeners = () => {
    if (Silian_globalListenersAttached && !Silian_articleListenersAttached && !Silian_insightListenersAttached && typeof window !== 'undefined') {
        window.removeEventListener('storage', Silian_handleStorageEvent);
        window.removeEventListener('focus', Silian_handleWindowFocus);
        if (typeof document !== 'undefined') {
            document.removeEventListener('visibilitychange', Silian_handleVisibilityChange);
        }
        Silian_globalListenersAttached = false;
    }
};
const Silian_stopArticleMonitoring = () => {
    if (Silian_articleProgressInterval.value !== undefined && typeof window !== 'undefined') {
        window.clearInterval(Silian_articleProgressInterval.value);
    }
    Silian_articleProgressInterval.value = undefined;
    Silian_articleListenersAttached = false;
    Silian_detachGlobalListeners();
};
const Silian_updateArticleProgress = () => {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        const Silian_raw = localStorage.getItem(Silian_ARTICLE_STORAGE_KEY);
        if (!Silian_raw) {
            Silian_articleReadDuration.value = 0;
            Silian_articleCompleted.value = false;
            return;
        }
        const Silian_data = JSON.parse(Silian_raw) as {
            completed?: boolean;
            duration?: number;
        };
        const Silian_duration = typeof Silian_data.duration === 'number' ? Math.max(0, Math.floor(Silian_data.duration)) : 0;
        Silian_articleReadDuration.value = Silian_duration;
        const Silian_meetsTime = Silian_duration >= Silian_ARTICLE_REQUIRED_SECONDS;
        Silian_articleCompleted.value = Boolean(Silian_data.completed) && Silian_meetsTime;
    }
    catch (Silian_error) {
        console.warn('无法读取文章进度', Silian_error);
    }
};
const Silian_updateInsightProgress = () => {
    if (typeof window === 'undefined') {
        return;
    }
    Silian_INSIGHT_ARTICLES.forEach((Silian_article, Silian_index) => {
        try {
            const Silian_raw = localStorage.getItem(Silian_article.storageKey);
            if (!Silian_raw) {
                Silian_insightStates[Silian_index].duration = 0;
                Silian_insightStates[Silian_index].completed = false;
                return;
            }
            const Silian_data = JSON.parse(Silian_raw) as {
                completed?: boolean;
                duration?: number;
            };
            const Silian_duration = typeof Silian_data.duration === 'number' ? Math.max(0, Math.floor(Silian_data.duration)) : 0;
            Silian_insightStates[Silian_index].duration = Silian_duration;
            Silian_insightStates[Silian_index].completed = Boolean(Silian_data.completed);
        }
        catch (Silian_error) {
            console.warn(`无法读取 ${Silian_article.storageKey} 进度`, Silian_error);
        }
    });
};
const Silian_handleStorageEvent = (Silian_event: StorageEvent) => {
    if (!Silian_event.key || Silian_event.key === Silian_ARTICLE_STORAGE_KEY) {
        Silian_updateArticleProgress();
    }
    if (!Silian_event.key || Silian_INSIGHT_ARTICLES.some((Silian_article) => Silian_article.storageKey === Silian_event.key)) {
        Silian_updateInsightProgress();
    }
};
const Silian_handleVisibilityChange = () => {
    if (typeof document !== 'undefined' && !document.hidden) {
        Silian_updateArticleProgress();
        Silian_updateInsightProgress();
    }
};
const Silian_handleWindowFocus = () => {
    Silian_updateArticleProgress();
    Silian_updateInsightProgress();
};
const Silian_startArticleMonitoring = () => {
    if (typeof window === 'undefined') {
        return;
    }
    Silian_stopArticleMonitoring();
    Silian_updateArticleProgress();
    Silian_attachGlobalListeners();
    Silian_articleListenersAttached = true;
    Silian_articleProgressInterval.value = window.setInterval(Silian_updateArticleProgress, 1000);
};
const Silian_startInsightMonitoring = () => {
    if (typeof window === 'undefined') {
        return;
    }
    Silian_stopInsightMonitoring();
    Silian_updateInsightProgress();
    Silian_attachGlobalListeners();
    Silian_insightListenersAttached = true;
    Silian_insightMonitorInterval.value = window.setInterval(Silian_updateInsightProgress, 1000);
};
const Silian_stopInsightMonitoring = () => {
    if (Silian_insightMonitorInterval.value !== undefined && typeof window !== 'undefined') {
        window.clearInterval(Silian_insightMonitorInterval.value);
    }
    Silian_insightMonitorInterval.value = undefined;
    Silian_insightListenersAttached = false;
    Silian_detachGlobalListeners();
};
const Silian_persistFullResultsUnlock = () => {
    try {
        if (typeof window !== 'undefined') {
            localStorage.setItem(Silian_FULL_RESULTS_STORAGE_KEY, JSON.stringify({ unlocked: true, timestamp: Date.now() }));
        }
    }
    catch (Silian_error) {
        console.warn('无法记录完整报告解锁状态', Silian_error);
    }
};
const Silian_initializeFullResultsState = () => {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        const Silian_raw = localStorage.getItem(Silian_FULL_RESULTS_STORAGE_KEY);
        if (Silian_raw) {
            const Silian_data = JSON.parse(Silian_raw) as {
                unlocked?: boolean;
            };
            if (Silian_data.unlocked) {
                Silian_fullResultsUnlocked.value = true;
            }
        }
    }
    catch (Silian_error) {
        console.warn('无法读取完整报告解锁状态', Silian_error);
    }
    if (!Silian_fullResultsUnlocked.value) {
        Silian_updateInsightProgress();
        if (Silian_insightsCompleted.value) {
            Silian_fullResultsUnlocked.value = true;
            Silian_persistFullResultsUnlock();
        }
    }
};
const Silian_openInsightArticle = (Silian_index: number) => {
    const Silian_article = Silian_INSIGHT_ARTICLES[Silian_index];
    if (!Silian_article || typeof window === 'undefined') {
        return;
    }
    const Silian_url = Silian_router.resolve({ name: Silian_article.routeName }).href;
    window.open(Silian_url, '_blank', 'noopener');
};
const Silian_refreshInsightProgress = () => {
    Silian_updateInsightProgress();
};
const Silian_resetArticleState = (Silian_options?: {
    clearStorage?: boolean;
}) => {
    Silian_stopArticleMonitoring();
    Silian_articleReadDuration.value = 0;
    Silian_articleCompleted.value = false;
    if (Silian_options?.clearStorage) {
        try {
            if (typeof window !== 'undefined') {
                localStorage.removeItem(Silian_ARTICLE_STORAGE_KEY);
            }
        }
        catch (Silian_error) {
            console.warn('无法清除文章进度', Silian_error);
        }
    }
};
const Silian_clearFullResultsPersistence = () => {
    try {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(Silian_FULL_RESULTS_STORAGE_KEY);
        }
    }
    catch (Silian_error) {
        console.warn('无法清除完整报告解锁记录', Silian_error);
    }
};
const Silian_resetGateState = (Silian_options?: {
    clearStorage?: boolean;
}) => {
    Silian_gateStep.value = 0;
    Silian_policyChecked.value = false;
    Silian_shareText.value = '';
    Silian_resetArticleState({ clearStorage: Silian_options?.clearStorage });
    Silian_clearThinkingProcess();
};
const Silian_beginGateFlow = () => {
    Silian_resetGateState({ clearStorage: true });
    Silian_gateStep.value = 1;
    Silian_showGateDialog.value = true;
    Silian_startArticleMonitoring();
};
const Silian_goToNextGate = () => {
    if (Silian_gateStep.value === 1 && !Silian_articleCompleted.value) {
        return;
    }
    if (Silian_gateStep.value === 2 && !Silian_policyChecked.value) {
        return;
    }
    if (Silian_gateStep.value === 3 && Silian_shareText.value.trim().length < 20) {
        return;
    }
    if (Silian_gateStep.value === 1) {
        Silian_stopArticleMonitoring();
    }
    Silian_gateStep.value += 1;
};
const Silian_stopThinkingIntervals = () => {
    if (Silian_thinkingInterval.value !== undefined) {
        window.clearInterval(Silian_thinkingInterval.value);
        Silian_thinkingInterval.value = undefined;
    }
    if (Silian_thinkingMessageInterval.value !== undefined) {
        window.clearInterval(Silian_thinkingMessageInterval.value);
        Silian_thinkingMessageInterval.value = undefined;
    }
};
const Silian_clearThinkingProcess = () => {
    Silian_stopThinkingIntervals();
    Silian_thinkingDuration.value = 0;
    Silian_thinkingElapsed.value = 0;
    Silian_thinkingCompleted.value = false;
    Silian_thinkingMessages.value = [];
};
const Silian_startThinkingProcess = () => {
    Silian_clearThinkingProcess();
    Silian_thinkingDuration.value = Math.floor(30 + Math.random() * 31);
    const Silian_pool = [...Silian_thinkingMessagesPool].sort(() => Math.random() - 0.5);
    let Silian_messageIndex = 0;
    if (Silian_pool.length > 0) {
        Silian_thinkingMessages.value = [Silian_pool[Silian_messageIndex]];
        Silian_messageIndex += 1;
    }
    Silian_thinkingMessageInterval.value = window.setInterval(() => {
        if (Silian_messageIndex >= Silian_pool.length || Silian_thinkingCompleted.value) {
            return;
        }
        Silian_thinkingMessages.value = [...Silian_thinkingMessages.value, Silian_pool[Silian_messageIndex]];
        Silian_messageIndex += 1;
    }, 4000);
    Silian_thinkingElapsed.value = 0;
    Silian_thinkingInterval.value = window.setInterval(() => {
        if (Silian_thinkingElapsed.value < Silian_thinkingDuration.value) {
            Silian_thinkingElapsed.value += 1;
            if (Silian_thinkingElapsed.value >= Silian_thinkingDuration.value) {
                Silian_stopThinkingIntervals();
                Silian_thinkingCompleted.value = true;
                Silian_thinkingMessages.value = [
                    ...Silian_thinkingMessages.value,
                    '分析完成：已将你的回答映射至 16 种人格模型。'
                ];
            }
            return;
        }
    }, 1000);
};
const Silian_finalizeGate = () => {
    Silian_stopArticleMonitoring();
    Silian_stopThinkingIntervals();
    Silian_resetGateState({ clearStorage: true });
    Silian_showGateDialog.value = false;
    const Silian_downloadUrl = 'https://wdf.ink/6OUp';
    if (typeof window !== 'undefined') {
        window.open(Silian_downloadUrl, '_blank', 'noopener');
    }
    const Silian_endTimestamp = Date.now();
    if (Silian_formStartTime.value === null) {
        Silian_formStartTime.value = Silian_endTimestamp;
    }
    const Silian_elapsedMs = Silian_endTimestamp - (Silian_formStartTime.value ?? Silian_endTimestamp);
    const Silian_elapsedSeconds = Math.max(0, Math.floor(Silian_elapsedMs / 1000));
    Silian_wastedMessage.value = `恭喜你成功浪费了你人生中的 ${Silian_formatDurationLong(Silian_elapsedSeconds)}`;
};
const Silian_closeGate = () => {
    Silian_stopArticleMonitoring();
    Silian_showGateDialog.value = false;
    Silian_resetGateState({ clearStorage: true });
};
Silian_onMounted(() => {
    if (!Silian_insightsResetPerformed) {
        Silian_clearFullResultsPersistence();
        Silian_resetInsightStates({ clearStorage: true });
        Silian_insightsResetPerformed = true;
    }
    Silian_initializeFullResultsState();
    if (Silian_showResults.value && !Silian_fullResultsUnlocked.value) {
        Silian_startInsightMonitoring();
    }
});
Silian_watch(Silian_gateStep, (Silian_value, Silian_previous) => {
    if (Silian_value === 1) {
        Silian_startArticleMonitoring();
    }
    if (Silian_previous === 1 && Silian_value !== 1) {
        Silian_stopArticleMonitoring();
    }
    if (Silian_value === 4) {
        Silian_startThinkingProcess();
    }
    if (Silian_previous === 4 && Silian_value !== 4) {
        Silian_clearThinkingProcess();
    }
});
Silian_watch(Silian_showResults, (Silian_value) => {
    if (Silian_value) {
        Silian_updateInsightProgress();
        if (!Silian_fullResultsUnlocked.value) {
            Silian_startInsightMonitoring();
        }
    }
    else {
        Silian_stopInsightMonitoring();
    }
});
Silian_watch(Silian_insightsCompleted, (Silian_value) => {
    if (Silian_value) {
        if (!Silian_fullResultsUnlocked.value) {
            Silian_fullResultsUnlocked.value = true;
        }
        Silian_persistFullResultsUnlock();
        Silian_stopInsightMonitoring();
    }
});
Silian_watch(Silian_answeredCount, (Silian_value, Silian_previous) => {
    if (Silian_value > 0 && (Silian_formStartTime.value === null || Silian_previous === 0)) {
        Silian_formStartTime.value = Date.now();
    }
});
Silian_onBeforeUnmount(() => {
    Silian_stopArticleMonitoring();
    Silian_stopInsightMonitoring();
    Silian_stopThinkingIntervals();
});</script>

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
