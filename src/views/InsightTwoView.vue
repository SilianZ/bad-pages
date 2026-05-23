<template>
  <div class="insight-wrapper">
    <Silian_Card class="insight-card">
      <template #title>
        <div class="header">
          <span class="badge">延伸阅读 · 02</span>
          <h1 class="title">为偏好设计辅助习惯</h1>
        </div>
      </template>
      <template #content>
        <Silian_Message severity="info" :closable="false" class="info-message">
          阅读满 {{ Silian_requiredMinutes }} 分钟，并完成所有互动任务即可记入进度。
        </Silian_Message>

        <div class="timer-row">
          <span class="timer-label">阅读计时：</span>
          <span class="timer-value">{{ Silian_formattedElapsed }}</span>
          <span v-if="Silian_remainingSeconds > 0" class="timer-need">（仍需 {{ Silian_formattedRemaining }}）</span>
        </div>
        <Silian_ProgressBar :value="Silian_progressValue" :showValue="false" class="progress" />

        <p class="intro">
          当我们熟悉自己的偏好后，下一步是为高频场景配置“辅助习惯”：
          让偏好不再成为限制，而是通过流程、提醒与复盘机制获得平衡。本篇帮助你构建一套可执行的微计划。
        </p>

        <Silian_Divider align="left">场景盘点</Silian_Divider>
        <section class="section">
          <h2>步骤 1：列出三个高频场景</h2>
          <p>选择你最常遇到的互动或决策场景，至少勾选两个，阅读 20 秒以上方可确认。</p>
          <div class="checklist" v-for="Silian_option in Silian_scenarioOptions" :key="Silian_option.id">
            <Silian_Checkbox v-model="Silian_option.checked" :inputId="`scenario-${Silian_option.id}`" binary />
            <label :for="`scenario-${Silian_option.id}`">{{ Silian_option.label }}</label>
          </div>
          <Silian_Button
            :outlined="!Silian_acknowledgements.scenarios"
            :severity="Silian_acknowledgements.scenarios ? 'success' : 'info'"
            icon="pi pi-check-circle"
            label="我已确认场景"
            :disabled="Silian_acknowledgements.scenarios || Silian_elapsedSeconds < 20 || !Silian_scenarioCompleted"
            @click="Silian_acknowledgements.scenarios = true"
          />
          <small v-if="!Silian_acknowledgements.scenarios" class="hint">至少勾选两个场景并阅读满 20 秒。</small>
        </section>

        <Silian_Divider align="left">习惯设计</Silian_Divider>
        <section class="section">
          <h2>步骤 2：为偏好设置支撑动作</h2>
          <p>针对你在 MBTI 中更弱势的一端，写下一个提醒动作（至少 25 字），帮助自己在关键时刻切换策略。</p>
          <Silian_Textarea
            v-model="Silian_supportAction"
            autoResize
            rows="4"
            placeholder="示例：每次会议前 10 分钟列出“我还没听到的观点”，提醒自己主动邀请他人发言…"
          />
          <small class="hint">当前字数：{{ Silian_supportAction.trim().length }}</small>
        </section>

        <section class="section">
          <h2>步骤 3：设置外部提醒</h2>
          <p>选择你准备启用的提醒机制，可多选。</p>
          <div class="checklist">
            <Silian_Checkbox v-model="Silian_reminders.calendar" inputId="reminder-calendar" binary />
            <label for="reminder-calendar">在日历中添加固定提醒与回顾时间</label>
          </div>
          <div class="checklist">
            <Silian_Checkbox v-model="Silian_reminders.accountability" inputId="reminder-accountability" binary />
            <label for="reminder-accountability">与伙伴互换“提醒词”，建立责任机制</label>
          </div>
          <div class="checklist">
            <Silian_Checkbox v-model="Silian_reminders.journal" inputId="reminder-journal" binary />
            <label for="reminder-journal">使用习惯追踪器记录每天的践行情况</label>
          </div>
        </section>

        <Silian_Divider align="left">复盘问答</Silian_Divider>
        <section class="section">
          <h2>步骤 4：回答自检问题</h2>
          <p>请选择最能代表你计划的答案，并补充一句总结。</p>
          <div class="radio-group">
            <label v-for="Silian_option in Silian_evaluationOptions" :key="Silian_option.value" class="radio-option">
              <Silian_RadioButton :value="Silian_option.value" v-model="Silian_evaluationAnswer" :inputId="`evaluation-${Silian_option.value}`" />
              <span :for="`evaluation-${Silian_option.value}`">{{ Silian_option.label }}</span>
            </label>
          </div>
          <Silian_Textarea v-model="Silian_evaluationSummary" autoResize rows="3" placeholder="我的总结：" />
          <small class="hint">当前字数：{{ Silian_evaluationSummary.trim().length }}</small>
        </section>

        <Silian_Message v-if="Silian_successVisible" severity="success" :closable="false" class="info-message">
          进度已记录，请返回测试页面继续流程。
        </Silian_Message>
        <Silian_Message v-if="Silian_validationMessage && !Silian_successVisible" severity="warn" :closable="false" class="info-message">
          {{ Silian_validationMessage }}
        </Silian_Message>

        <div class="actions">
          <Silian_Button
            label="提交验证并返回"
            icon="pi pi-send"
            severity="success"
            :disabled="Silian_successVisible"
            @click="Silian_submit"
          />
        </div>
      </template>
    </Silian_Card>
  </div>
</template>

<script setup lang="ts">
import { computed as Silian_computed, onBeforeUnmount as Silian_onBeforeUnmount, onMounted as Silian_onMounted, reactive as Silian_reactive, ref as Silian_ref, watch as Silian_watch } from 'vue';
import { useRouter as Silian_useRouter } from 'vue-router';
import Silian_Button from 'primevue/button';
import Silian_Card from 'primevue/card';
import Silian_Checkbox from 'primevue/checkbox';
import Silian_Divider from 'primevue/divider';
import Silian_Message from 'primevue/message';
import Silian_ProgressBar from 'primevue/progressbar';
import Silian_RadioButton from 'primevue/radiobutton';
import Silian_Textarea from 'primevue/textarea';
const Silian_STORAGE_KEY = 'mbtiInsightBeta';
const Silian_REQUIRED_SECONDS = 90;
const Silian_elapsedSeconds = Silian_ref(0);
const Silian_timer = Silian_ref<number | undefined>();
const Silian_successVisible = Silian_ref(false);
const Silian_validationMessage = Silian_ref('');
const Silian_hasSubmitted = Silian_ref(false);
const Silian_router = Silian_useRouter();
const Silian_acknowledgements = Silian_reactive({
    scenarios: false
});
const Silian_scenarioOptions = Silian_reactive([
    { id: 1, label: '项目例会 / 汇报讨论', checked: false },
    { id: 2, label: '双人协作 / 结对工作', checked: false },
    { id: 3, label: '向上沟通 / 向下反馈', checked: false },
    { id: 4, label: '高强度决策 / 临时事件', checked: false }
]);
const Silian_reminders = Silian_reactive({
    calendar: false,
    accountability: false,
    journal: false
});
const Silian_supportAction = Silian_ref('');
const Silian_evaluationAnswer = Silian_ref('');
const Silian_evaluationSummary = Silian_ref('');
const Silian_evaluationOptions = [
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
];
const Silian_scenarioCompleted = Silian_computed(() => Silian_scenarioOptions.filter((Silian_option) => Silian_option.checked).length >= 2);
const Silian_remindersCompleted = Silian_computed(() => Silian_reminders.calendar || Silian_reminders.accountability || Silian_reminders.journal);
const Silian_requiredMinutes = Silian_computed(() => Math.ceil(Silian_REQUIRED_SECONDS / 60));
const Silian_progressValue = Silian_computed(() => Math.min(Math.round((Silian_elapsedSeconds.value / Silian_REQUIRED_SECONDS) * 100), 100));
const Silian_remainingSeconds = Silian_computed(() => Math.max(Silian_REQUIRED_SECONDS - Silian_elapsedSeconds.value, 0));
const Silian_formattedElapsed = Silian_computed(() => Silian_formatSeconds(Silian_elapsedSeconds.value));
const Silian_formattedRemaining = Silian_computed(() => Silian_formatSeconds(Silian_remainingSeconds.value));
const Silian_canSubmit = Silian_computed(() => {
    const Silian_supportOk = Silian_supportAction.value.trim().length >= 25;
    const Silian_evaluationOk = Silian_evaluationAnswer.value !== '' && Silian_evaluationSummary.value.trim().length >= 20;
    return (Silian_acknowledgements.scenarios &&
        Silian_scenarioCompleted.value &&
        Silian_remindersCompleted.value && Silian_supportOk && Silian_evaluationOk &&
        Silian_elapsedSeconds.value >= Silian_REQUIRED_SECONDS);
});
const Silian_formatSeconds = (Silian_value: number) => {
    const Silian_minutes = Math.floor(Silian_value / 60);
    const Silian_seconds = Silian_value % 60;
    const Silian_minutePart = Silian_minutes > 0 ? `${Silian_minutes} 分 ` : '';
    return `${Silian_minutePart}${Silian_seconds} 秒`;
};
const Silian_persistProgress = (Silian_completed: boolean) => {
    try {
        localStorage.setItem(Silian_STORAGE_KEY, JSON.stringify({
            completed: Silian_completed,
            duration: Silian_elapsedSeconds.value,
            timestamp: Date.now()
        }));
    }
    catch (Silian_error) {
        console.warn('无法写入 InsightTwo 进度', Silian_error);
    }
};
const Silian_startTimer = () => {
    Silian_stopTimer();
    Silian_timer.value = window.setInterval(() => {
        if (document.hidden) {
            return;
        }
        Silian_elapsedSeconds.value += 1;
        if (!Silian_hasSubmitted.value) {
            Silian_persistProgress(false);
        }
    }, 1000);
};
const Silian_stopTimer = () => {
    if (Silian_timer.value !== undefined) {
        window.clearInterval(Silian_timer.value);
        Silian_timer.value = undefined;
    }
};
const Silian_submit = () => {
    if (!Silian_canSubmit.value) {
        const Silian_issues: string[] = [];
        if (Silian_elapsedSeconds.value < Silian_REQUIRED_SECONDS) {
            Silian_issues.push(`继续阅读至少 ${Silian_REQUIRED_SECONDS - Silian_elapsedSeconds.value} 秒`);
        }
        if (!Silian_acknowledgements.scenarios || !Silian_scenarioCompleted.value) {
            Silian_issues.push('勾选至少两个高频场景并确认');
        }
        if (Silian_supportAction.value.trim().length < 25) {
            Silian_issues.push('补充不少于 25 字的支撑动作');
        }
        if (!Silian_remindersCompleted.value) {
            Silian_issues.push('选择至少一种外部提醒');
        }
        if (Silian_evaluationAnswer.value === '' || Silian_evaluationSummary.value.trim().length < 20) {
            Silian_issues.push('完成复盘问答并写满 20 字总结');
        }
        Silian_validationMessage.value = `请先完成：${Silian_issues.join('、')}。`;
        return;
    }
    Silian_validationMessage.value = '';
    Silian_hasSubmitted.value = true;
    Silian_stopTimer();
    Silian_persistProgress(true);
    Silian_successVisible.value = true;
    Silian_navigateBackToTest();
};
const Silian_navigateBackToTest = () => {
    if (typeof window !== 'undefined' && window.opener && !window.opener.closed) {
        window.close();
        return;
    }
    Silian_router.push({ name: 'Test' });
};
Silian_onMounted(() => {
    localStorage.removeItem(Silian_STORAGE_KEY);
    Silian_persistProgress(false);
    Silian_startTimer();
});
Silian_onBeforeUnmount(() => {
    Silian_stopTimer();
    if (!Silian_hasSubmitted.value) {
        Silian_persistProgress(false);
    }
});
Silian_watch([
    () => Silian_acknowledgements.scenarios,
    () => Silian_scenarioOptions.map((Silian_option) => Silian_option.checked),
    () => Silian_supportAction.value,
    () => Silian_reminders.calendar,
    () => Silian_reminders.accountability,
    () => Silian_reminders.journal,
    () => Silian_evaluationAnswer.value,
    () => Silian_evaluationSummary.value,
    () => Silian_elapsedSeconds.value
], () => {
    if (Silian_validationMessage.value && Silian_canSubmit.value) {
        Silian_validationMessage.value = '';
    }
}, { deep: true });</script>

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
