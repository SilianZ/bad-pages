<template>
  <div class="insight-wrapper">
    <Silian_Card class="insight-card">
      <template #title>
        <div class="header">
          <span class="badge">延伸阅读 · 01</span>
          <h1 class="title">洞察偏好与沟通错位</h1>
        </div>
      </template>
      <template #content>
        <Silian_Message severity="info" :closable="false" class="info-message">
          至少阅读 {{ Silian_requiredMinutes }} 分钟，并完成所有互动确认。系统将自动记录你的时长与反馈。
        </Silian_Message>

        <div class="timer-row">
          <span class="timer-label">阅读计时：</span>
          <span class="timer-value">{{ Silian_formattedElapsed }}</span>
          <span v-if="Silian_remainingSeconds > 0" class="timer-need">（仍需 {{ Silian_formattedRemaining }}）</span>
        </div>
        <Silian_ProgressBar :value="Silian_progressValue" :showValue="false" class="progress" />

        <p class="intro">
          当沟通进入“错位”状态时，往往是偏好差异未被识别：外向偏好者需要即刻交流，内向偏好者寻求缓冲；
          实感偏好者需要背景事实，直觉偏好者期待愿景画面。本篇引导你拆解错位讯号，并练习建立桥梁语言。
        </p>

        <Silian_Divider align="left">观测练习</Silian_Divider>
        <section class="section">
          <h2>活动 1：回放最近一次沟通卡顿</h2>
          <p>
            记录一次双方都感到不满意的沟通情境，描述当时的情绪、环境，以及你注意到的关键词。
            阅读 20 秒后才能提交确认。
          </p>
          <Silian_Button
            :outlined="!Silian_acknowledgements.recall"
            :severity="Silian_acknowledgements.recall ? 'success' : 'info'"
            icon="pi pi-check-circle"
            label="我已完成回放记录"
            :disabled="Silian_acknowledgements.recall || Silian_elapsedSeconds < 20"
            @click="Silian_acknowledgements.recall = true"
          />
          <small v-if="!Silian_acknowledgements.recall" class="hint">继续阅读至 20 秒后再确认。</small>
        </section>

        <section class="section">
          <h2>活动 2：标记偏好信号</h2>
          <p>
            匹配以下对话特征与可能的偏好需求。至少选择两个才算完成，45 秒后方可提交。
          </p>
          <div class="checklist">
            <Silian_Checkbox v-model="Silian_signals.fastPace" inputId="signal-fast" binary />
            <label for="signal-fast">对方语速快、话题跳跃 —— 可能期待直觉式对话</label>
          </div>
          <div class="checklist">
            <Silian_Checkbox v-model="Silian_signals.detailSearch" inputId="signal-detail" binary />
            <label for="signal-detail">不断追问细节 —— 可能需要更多实感证据</label>
          </div>
          <div class="checklist">
            <Silian_Checkbox v-model="Silian_signals.silence" inputId="signal-silence" binary />
            <label for="signal-silence">对方沉默反思 —— 可能需要内向式缓冲时间</label>
          </div>
          <Silian_Button
            :outlined="!Silian_acknowledgements.signals"
            :severity="Silian_acknowledgements.signals ? 'success' : 'info'"
            icon="pi pi-check-circle"
            label="我已标记偏好信号"
            :disabled="Silian_acknowledgements.signals || Silian_elapsedSeconds < 45 || !Silian_signalsCompleted"
            @click="Silian_acknowledgements.signals = true"
          />
          <small v-if="!Silian_acknowledgements.signals" class="hint">至少选择两个选项，且阅读满 45 秒。</small>
        </section>

        <Silian_Divider align="left">桥梁语言草稿</Silian_Divider>
        <section class="section">
          <h2>活动 3：写下桥梁语句</h2>
          <p>围绕上一阶段的情境，写一句能够换位、兼顾双方偏好的桥梁语句（不少于 25 字）。</p>
          <Silian_Textarea v-model="Silian_bridgeText" autoResize rows="4" placeholder="示例：我先把现状与背景梳理清楚，再一起想象我们想要到达的画面…" />
          <small class="hint">当前字数：{{ Silian_bridgeText.trim().length }}</small>
        </section>

        <section class="section">
          <h2>活动 4：承诺实践</h2>
          <p>勾选你准备在下一次沟通中尝试的行为。</p>
          <div class="checklist">
            <Silian_Checkbox v-model="Silian_commitments.previewAgenda" inputId="commit-agenda" binary />
            <label for="commit-agenda">提前发送讨论框架，给对方预热时间</label>
          </div>
          <div class="checklist">
            <Silian_Checkbox v-model="Silian_commitments.mirrorLanguage" inputId="commit-mirror" binary />
            <label for="commit-mirror">用对方偏好的语言重述一次关键结论</label>
          </div>
          <div class="checklist">
            <Silian_Checkbox v-model="Silian_commitments.feedbackLoop" inputId="commit-feedback" binary />
            <label for="commit-feedback">会议后开启 10 分钟双向反馈，确认舒适度</label>
          </div>
        </section>

        <Silian_Message v-if="Silian_successVisible" severity="success" :closable="false" class="info-message">
          已达成要求！请返回测试页面，系统已记录阅读进度。
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
import Silian_Textarea from 'primevue/textarea';
const Silian_STORAGE_KEY = 'mbtiInsightAlpha';
const Silian_REQUIRED_SECONDS = 90;
const Silian_elapsedSeconds = Silian_ref(0);
const Silian_timer = Silian_ref<number | undefined>();
const Silian_successVisible = Silian_ref(false);
const Silian_validationMessage = Silian_ref('');
const Silian_hasSubmitted = Silian_ref(false);
const Silian_router = Silian_useRouter();
const Silian_acknowledgements = Silian_reactive({
    recall: false,
    signals: false
});
const Silian_signals = Silian_reactive({
    fastPace: false,
    detailSearch: false,
    silence: false
});
const Silian_commitments = Silian_reactive({
    previewAgenda: false,
    mirrorLanguage: false,
    feedbackLoop: false
});
const Silian_bridgeText = Silian_ref('');
const Silian_signalsCompleted = Silian_computed(() => {
    const Silian_values = [Silian_signals.fastPace, Silian_signals.detailSearch, Silian_signals.silence];
    return Silian_values.filter(Boolean).length >= 2;
});
const Silian_requiredMinutes = Silian_computed(() => Math.ceil(Silian_REQUIRED_SECONDS / 60));
const Silian_progressValue = Silian_computed(() => Math.min(Math.round((Silian_elapsedSeconds.value / Silian_REQUIRED_SECONDS) * 100), 100));
const Silian_remainingSeconds = Silian_computed(() => Math.max(Silian_REQUIRED_SECONDS - Silian_elapsedSeconds.value, 0));
const Silian_formattedElapsed = Silian_computed(() => Silian_formatSeconds(Silian_elapsedSeconds.value));
const Silian_formattedRemaining = Silian_computed(() => Silian_formatSeconds(Silian_remainingSeconds.value));
const Silian_commitmentsCompleted = Silian_computed(() => Silian_commitments.previewAgenda || Silian_commitments.mirrorLanguage || Silian_commitments.feedbackLoop);
const Silian_canSubmit = Silian_computed(() => {
    const Silian_bridgeOk = Silian_bridgeText.value.trim().length >= 25;
    return (Silian_acknowledgements.recall &&
        Silian_acknowledgements.signals &&
        Silian_signalsCompleted.value &&
        Silian_commitmentsCompleted.value && Silian_bridgeOk &&
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
        console.warn('无法写入 InsightOne 进度', Silian_error);
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
        if (!Silian_acknowledgements.recall) {
            Silian_issues.push('完成“沟通回放”确认');
        }
        if (!Silian_acknowledgements.signals || !Silian_signalsCompleted.value) {
            Silian_issues.push('至少勾选两个偏好信号并提交确认');
        }
        if (Silian_bridgeText.value.trim().length < 25) {
            Silian_issues.push('补充不少于 25 字的桥梁语句');
        }
        if (!Silian_commitmentsCompleted.value) {
            Silian_issues.push('勾选至少一项实践承诺');
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
    () => Silian_acknowledgements.recall,
    () => Silian_acknowledgements.signals,
    () => Silian_signals.fastPace,
    () => Silian_signals.detailSearch,
    () => Silian_signals.silence,
    () => Silian_bridgeText.value,
    () => Silian_commitments.previewAgenda,
    () => Silian_commitments.mirrorLanguage,
    () => Silian_commitments.feedbackLoop,
    () => Silian_elapsedSeconds.value
], () => {
    if (Silian_validationMessage.value && Silian_canSubmit.value) {
        Silian_validationMessage.value = '';
    }
});</script>

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
