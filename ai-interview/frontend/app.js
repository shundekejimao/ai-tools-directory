/**
 * 面试练兵场 - 前端核心逻辑
 */

const API_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : '';

let interviewState = {
    jobType: '',
    difficulty: 'medium',
    history: [],
    questionCount: 0,
    isActive: false
};

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    loadJobs();
    loadMomJobs();
    initChatInput();
});

function initNavigation() {
    document.querySelectorAll('.tab-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = item.dataset.tab;
            switchTab(tab);
        });
    });
}

function switchTab(tab) {
    document.querySelectorAll('.tab-item').forEach(i => i.classList.remove('active'));
    const targetTabItem = document.querySelector(`.tab-item[data-tab="${tab}"]`);
    if (targetTabItem) targetTabItem.classList.add('active');

    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    const targetContent = document.getElementById(`tab-${tab}`);
    if (targetContent) targetContent.classList.add('active');

    document.querySelector('.main-content').scrollTop = 0;
}

function initChatInput() {
    const input = document.getElementById('chatInput');
    if (input) {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        // 自动调整高度
        input.addEventListener('input', () => {
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 100) + 'px';
        });
    }
}

function showLoading(text = 'AI正在思考中...') {
    const overlay = document.getElementById('loadingOverlay');
    document.getElementById('loadingText').textContent = text;
    overlay.style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

async function apiCall(endpoint, data = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || '请求失败');
        }
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

function renderMarkdown(text) {
    if (!text) return '';
    let html = text
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');
    html = html.replace(/(<li>.*<\/li>)/gs, (match) => '<ul>' + match + '</ul>');
    html = html.replace(/<\/ul>\s*<ul>/g, '');
    return '<p>' + html + '</p>';
}

// ============ 模拟面试 ============

async function startInterview() {
    const jobType = document.getElementById('interviewJobType').value;
    if (!jobType) { alert('请先选择面试岗位'); return; }

    const difficulty = document.querySelector('input[name="difficulty"]:checked').value;
    interviewState = { jobType, difficulty, history: [], questionCount: 0, isActive: true };

    showLoading('面试官正在准备...');

    try {
        const result = await apiCall('/api/interview/start', {
            job_type: jobType,
            question: '面试官你好，我准备好了。',
            history: [],
            difficulty
        });

        hideLoading();
        document.getElementById('interviewSetup').style.display = 'none';
        document.getElementById('interviewChat').style.display = 'flex';
        document.getElementById('chatTitle').textContent = jobType;

        document.getElementById('chatMessages').innerHTML = '';
        addChatBubble('ai', '面试官', result.response);

        interviewState.history.push({ role: 'assistant', content: result.response });
        interviewState.questionCount = result.question_count || 1;
        updateChatCount();
    } catch (error) {
        hideLoading();
        alert('开始面试失败: ' + error.message);
    }
}

function addChatBubble(role, label, content) {
    const container = document.getElementById('chatMessages');
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${role}`;
    bubble.innerHTML = `
        <div class="bubble-label">${label}</div>
        <div class="bubble-inner">${renderMarkdown(content)}</div>
    `;
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
}

function updateChatCount() {
    document.getElementById('chatCount').textContent = `第${interviewState.questionCount}题`;
}

async function sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text || !interviewState.isActive) return;

    input.value = '';
    input.style.height = 'auto';
    addChatBubble('user', '我', text);
    interviewState.history.push({ role: 'user', content: text });

    showLoading('面试官思考中...');

    try {
        const result = await apiCall('/api/interview/chat', {
            job_type: interviewState.jobType,
            question: text,
            history: interviewState.history,
            difficulty: interviewState.difficulty
        });

        hideLoading();
        addChatBubble('ai', '面试官', result.response);
        interviewState.history.push({ role: 'assistant', content: result.response });
        interviewState.questionCount = result.question_count || (interviewState.questionCount + 1);
        updateChatCount();
    } catch (error) {
        hideLoading();
        alert('发送失败: ' + error.message);
    }
}

async function endInterview() {
    if (!interviewState.isActive) {
        // 已结束，直接返回
        document.getElementById('interviewSetup').style.display = 'block';
        document.getElementById('interviewChat').style.display = 'none';
        return;
    }

    if (!confirm('确定要结束面试吗？')) return;

    interviewState.isActive = false;
    showLoading('正在生成面试评价...');

    try {
        const result = await apiCall('/api/interview/evaluate', {
            job_type: interviewState.jobType,
            question: '请评估这次面试。',
            history: interviewState.history,
            difficulty: interviewState.difficulty
        });

        hideLoading();

        let evalText = '';
        if (typeof result.evaluation === 'object') {
            const ev = result.evaluation;
            if (ev.raw_response) {
                evalText = ev.raw_response;
            } else {
                evalText = `## 面试评估报告\n\n`;
                if (ev.total_score) evalText += `**综合评分：${ev.total_score}/10**\n\n`;
                if (ev.strengths) evalText += `**优势：**\n${ev.strengths.map(s => `- ${s}`).join('\n')}\n\n`;
                if (ev.weaknesses) evalText += `**不足：**\n${ev.weaknesses.map(s => `- ${s}`).join('\n')}\n\n`;
                if (ev.suggestions) evalText += `**建议：**\n${ev.suggestions.map(s => `- ${s}`).join('\n')}\n\n`;
                if (ev.overall_comment) evalText += `**总评：** ${ev.overall_comment}\n`;
            }
        } else {
            evalText = String(result.evaluation);
        }

        addChatBubble('ai', '评估报告', evalText || '面试已结束，感谢你的参与！');

    } catch (error) {
        hideLoading();
        alert('评估失败: ' + error.message);
    }

    // 让用户看到评估后再点退出回首页
    interviewState.isActive = false;
}

// ============ 面试攻略 ============

async function generateStrategy() {
    const jobType = document.getElementById('strategyJobType').value;
    if (!jobType) { alert('请选择岗位'); return; }

    showLoading('正在生成面试攻略...');

    try {
        const result = await apiCall('/api/strategy/generate', { job_type: jobType });
        hideLoading();
        document.getElementById('strategyResult').style.display = 'block';
        document.getElementById('strategyContent').innerHTML = renderMarkdown(result.strategy);
        document.getElementById('strategyResult').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        hideLoading();
        alert('生成攻略失败: ' + error.message);
    }
}

// ============ 简历优化 ============

async function optimizeResume() {
    const jobType = document.getElementById('resumeJobType').value;
    const content = document.getElementById('resumeContent').value.trim();
    if (!jobType) { alert('请选择目标岗位'); return; }
    if (!content) { alert('请输入简历内容'); return; }

    showLoading('正在优化你的简历...');

    try {
        const result = await apiCall('/api/resume/optimize', {
            resume_text: content,
            target_job: jobType
        });
        hideLoading();
        document.getElementById('resumeResult').style.display = 'block';
        document.getElementById('resumeOptimized').innerHTML = renderMarkdown(result.optimized_resume);
        document.getElementById('resumeResult').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        hideLoading();
        alert('优化简历失败: ' + error.message);
    }
}

// ============ 面试陷阱 ============

async function showTraps() {
    const jobType = document.getElementById('trapJobType').value;
    if (!jobType) { alert('请选择岗位'); return; }

    showLoading('正在整理面试陷阱...');

    try {
        const result = await apiCall('/api/traps/query', { job_type: jobType });
        hideLoading();

        let trapsText = '## 面试陷阱详细解析\n\n';
        if (result.traps && typeof result.traps === 'object') {
            for (const [key, trap] of Object.entries(result.traps)) {
                if (typeof trap === 'object') {
                    trapsText += `### ${trap.trap || key}\n`;
                    trapsText += `**HR的真实意图：** ${trap.analysis || ''}\n\n`;
                    trapsText += `**应对策略：** ${trap.response_strategy || ''}\n\n`;
                    trapsText += `**参考回答：** ${trap.sample_response || ''}\n\n---\n\n`;
                }
            }
        }
        if (result.extra_traps) {
            trapsText += '\n' + result.extra_traps;
        }

        document.getElementById('trapResult').style.display = 'block';
        document.getElementById('trapContent').innerHTML = renderMarkdown(trapsText);
        document.getElementById('trapResult').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        hideLoading();
        alert('获取陷阱失败: ' + error.message);
    }
}

// ============ 转行攻略 ============

async function generateCareerGuide() {
    const current = document.getElementById('careerCurrent').value.trim();
    const target = document.getElementById('careerTarget').value;
    if (!current) { alert('请输入目前的行业'); return; }
    if (!target) { alert('请选择目标行业'); return; }

    showLoading('正在生成转行攻略...');

    try {
        const result = await apiCall('/api/career-change/strategy', {
            current_job: current,
            target_job: target
        });
        hideLoading();
        document.getElementById('careerResult').style.display = 'block';
        document.getElementById('careerContent').innerHTML = renderMarkdown(result.strategy);
        document.getElementById('careerResult').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        hideLoading();
        alert('生成攻略失败: ' + error.message);
    }
}

// ============ 岗位信息 ============

async function loadJobs() {
    try {
        const response = await fetch(`${API_BASE}/api/jobs/list`);
        const data = await response.json();
        const container = document.getElementById('jobsGrid');
        if (!container) return;

        container.innerHTML = data.jobs.map(job => `
            <div class="job-card">
                <div class="job-card-top">
                    <div class="job-card-title">${job.type}</div>
                </div>
                <div class="job-card-salary">${job.salary_range}</div>
                <div class="job-card-tags">
                    <span class="job-tag">${job.core_skills_count}项核心技能</span>
                    <span class="job-tag">${job.questions_count}道面试题</span>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('加载岗位信息失败:', error);
    }
}

// ============ 宝妈专区 ============

async function generateMomStrategy() {
    const targetJob = document.getElementById('momTargetJob').value;
    const gapYears = parseInt(document.getElementById('momGapYears').value) || 0;
    const previousJob = document.getElementById('momPreviousJob').value;

    if (!targetJob) { alert('请选择目标岗位'); return; }

    showLoading('正在为你制定专属攻略...');

    try {
        const result = await apiCall('/api/mom/strategy', {
            target_job: targetJob,
            gap_years: gapYears,
            previous_job: previousJob || null
        });
        hideLoading();
        document.getElementById('momResult').style.display = 'block';
        document.getElementById('momContent').innerHTML = renderMarkdown(result.strategy);
        document.getElementById('momResult').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        hideLoading();
        alert('生成攻略失败: ' + error.message);
    }
}

async function loadMomJobs() {
    try {
        const response = await fetch(`${API_BASE}/api/mom/jobs`);
        const data = await response.json();
        const container = document.getElementById('momJobsGrid');
        if (!container) return;
        container.innerHTML = '';

        const difficultyMap = { '低': 'easy', '中等': 'medium', '高': 'hard', '很高': 'hard' };

        for (const job of data.jobs) {
            const difficultyClass = difficultyMap[job.difficulty] || 'medium';
            const card = document.createElement('div');
            card.className = `job-card ${difficultyClass}`;
            card.innerHTML = `
                <div class="job-card-top">
                    <div class="job-card-title">${job.type}</div>
                    <span class="job-card-badge">难度: ${job.difficulty}</span>
                </div>
                <div class="job-card-salary">${job.salary_range}</div>
                <div class="job-card-tags">
                    ${(job.transferable_skills || []).map(skill => `<span class="job-tag">${skill}</span>`).join('')}
                </div>
            `;
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => {
                document.getElementById('momTargetJob').value = job.type;
            });
            container.appendChild(card);
        }
    } catch (error) {
        console.error('加载宝妈岗位推荐失败:', error);
        showStaticMomJobs();
    }
}

function showStaticMomJobs() {
    const jobs = [
        { type: '客服', salary: '4K-7K', difficulty: '低', skills: ['沟通能力', '耐心', '情绪管理'] },
        { type: '行政', salary: '4K-7K', difficulty: '低', skills: ['组织能力', '细心', 'Office'] },
        { type: '电商运营', salary: '6K-15K', difficulty: '中等', skills: ['用户视角', '学习能力', '时间管理'] },
        { type: '销售', salary: '5K-10K+提成', difficulty: '中等', skills: ['亲和力', '韧性', '沟通'] },
        { type: '电子产品认证工程师', salary: '8K-15K', difficulty: '高', skills: ['细致', '英语', '学习'] },
        { type: '结构工程师', salary: '8K-18K', difficulty: '很高', skills: ['空间想象', '细心', '专业'] }
    ];

    const container = document.getElementById('momJobsGrid');
    if (!container) return;

    const difficultyMap = { '低': 'easy', '中等': 'medium', '高': 'hard', '很高': 'hard' };

    container.innerHTML = jobs.map(job => {
        const difficultyClass = difficultyMap[job.difficulty] || 'medium';
        return `
            <div class="job-card ${difficultyClass}">
                <div class="job-card-top">
                    <div class="job-card-title">${job.type}</div>
                    <span class="job-card-badge">难度: ${job.difficulty}</span>
                </div>
                <div class="job-card-salary">${job.salary}</div>
                <div class="job-card-tags">
                    ${job.skills.map(skill => `<span class="job-tag">${skill}</span>`).join('')}
                </div>
            </div>
        `;
    }).join('');
}
