<template>
	<div class="app-shell">
		<header class="app-header">
			<RouterLink to="/" class="brand">MBTI Lab</RouterLink>
			<nav class="nav-links">
				<RouterLink to="/" class="nav-link" active-class="is-active">首页</RouterLink>
				<RouterLink to="/test" class="nav-link" active-class="is-active">开始测试</RouterLink>
			</nav>
		</header>

		<main class="app-main">
			<RouterView />
		</main>

		<footer class="app-footer">
			<span>© {{ currentYear }} MBTI Lab · 探索偏好，延伸可能</span>
		</footer>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView } from 'vue-router'

const currentYear = computed(() => new Date().getFullYear())
</script>

<style>
body {
	font-family: sans, system-ui, -apple-system, 'Segoe UI', 'Helvetica Neue', Arial;
	color: #0f172a;
	margin: 0;
	min-height: 100vh;
	background: linear-gradient(135deg, #eef2ff 0%, #fdf4ff 40%, #e0f2fe 70%, #fef2f2 100%);
	background-attachment: fixed;
	position: relative;
	overflow-x: hidden;
}

body::before {
	content: '';
	position: fixed;
	inset: -35%;
	background: conic-gradient(
		from 90deg at 50% 50%,
		rgba(59, 130, 246, 0.55),
		rgba(30, 64, 175, 0.35),
		rgba(236, 72, 153, 0.45),
		rgba(16, 185, 129, 0.4),
		rgba(168, 85, 247, 0.5),
		rgba(59, 130, 246, 0.55)
	);
	filter: blur(140px);
	opacity: 0.75;
	animation: auroraFlow 22s ease-in-out infinite alternate;
	pointer-events: none;
	z-index: -2;
}

body::after {
	content: '';
	position: fixed;
	inset: -20%;
	background:
		radial-gradient(circle at 20% 30%, rgba(14, 165, 233, 0.35), transparent 60%),
		radial-gradient(circle at 75% 20%, rgba(236, 72, 153, 0.4), transparent 55%),
		radial-gradient(circle at 50% 82%, rgba(59, 130, 246, 0.35), transparent 60%);
	filter: blur(80px);
	opacity: 0.6;
	animation: sparkPulse 18s linear infinite;
	pointer-events: none;
	z-index: -3;
}

#app {
	position: relative;
	isolation: isolate;
}

* {
	box-sizing: border-box;
}

@keyframes auroraFlow {
	0% {
		transform: rotate(0deg) scale(1);
	}
	50% {
		transform: rotate(12deg) scale(1.05);
	}
	100% {
		transform: rotate(-8deg) scale(1.08);
	}
}

@keyframes sparkPulse {
	0% {
		opacity: 0.45;
		transform: translate3d(0, 0, 0) scale(1);
	}
	50% {
		opacity: 0.7;
		transform: translate3d(3%, -2%, 0) scale(1.05);
	}
	100% {
		opacity: 0.45;
		transform: translate3d(-2%, 3%, 0) scale(1.02);
	}
}
</style>

<style scoped>
.app-shell {
	min-height: 100vh;
	display: flex;
	flex-direction: column;
}

.app-header {
	position: sticky;
	top: 0;
	z-index: 10;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 1.25rem clamp(1rem, 3vw, 2.5rem);
	background: rgba(255, 255, 255, 0.78);
	backdrop-filter: blur(18px);
	border: 1px solid rgba(148, 163, 184, 0.25);
	box-shadow: 0 12px 35px rgba(15, 23, 42, 0.12);
	color: #0f172a;
}

.brand {
	font-weight: 700;
	letter-spacing: 0.08em;
	text-transform: uppercase;
	color: #1d4ed8;
	text-decoration: none;
	text-shadow: 0 0 22px rgba(37, 99, 235, 0.25);
}

.nav-links {
	display: flex;
	gap: 1.25rem;
}

.nav-link {
	color: #0f172a;
  text-decoration: none;
	font-weight: 500;
	padding: 0.35rem 0.75rem;
	border-radius: 999px;
	transition: color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease;
}

.nav-link:hover,
.nav-link.is-active {
	color: #1d4ed8;
	background: rgba(59, 130, 246, 0.12);
	box-shadow: 0 4px 18px rgba(59, 130, 246, 0.24);
}

.app-main {
	flex: 1;
	padding-top: clamp(3.5rem, 6vw, 4.5rem);
}

.app-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 1rem;
  background: #0f172a;
  color: #cbd5f5;
  font-size: 0.875rem;
}

@media (max-width: 640px) {
  .nav-links {
    gap: 0.75rem;
    font-size: 0.9rem;
  }
}
</style>
