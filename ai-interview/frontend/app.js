/**
 * 面试练兵场 - 前端核心逻辑
 */

// API基础URL
const API_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : '';

// 面试状态
let interviewState = {
    jobType: '',
    difficulty: 'medium',
    history: [],
    questionCount: 0,
    isActive: false
};

// ============ 页面初始化 ============

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    loadJobs();
    loadTraps();
    loadMomJobs();
    initKeyboardShortcuts();
});

// 导航切换
function initNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = item.dataset.tab;

            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            document.getElementById(`tab-${tab}`).classList.add('active');
        });
    });
}

// 键盘快捷键
function initKeyboardShortcuts() {
    document.getElementById('chatInput')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendAnswer();
        }
    });
}

// 关闭欢迎横幅
function closeBanner() {
    const banner = document.getElementById('welcomeBanner');
    banner.style.opacity = '0';
    banner.style.transform = 'translateY(-100%)';
    setTimeout(() => banner.style.display = 'none', 300);
}

// ============ 工具函数 ============

function showLoading(text = 'AI正在思考中...') {
    const overlay = document.getElementById('loadingOverlay');
    overlay.querySelector('.loading-text').textContent = text;
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

// Markdown渲染
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

    html = html.replace(/(<li>.*<\/li>)/gs, (match) => {
        return '<ul>' + match + '</ul>';
    });
    html = html.replace(/<\/ul>\s*<ul>/g, '');

    return '<p>' + html + '</p>';
}

// ============ 模拟面试 ============

async function startInterview() {
    const jobType = document.getElementById('interviewJobType').value;
    if (!jobType) {
        alert('请选择面试岗位');
        return;
    }

    const difficulty = document.querySelector('input[name="difficulty"]:checked').value;

    interviewState = {
        jobType,
        difficulty,
        history: [],
        questionCount: 0,
        isActive: true
    };

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
        document.getElementById('chatTitle').textContent = `${jobType} - 模拟面试`;

        document.getElementById('chatMessages').innerHTML = '';
        addChatMessage('interviewer', result.response);

        interviewState.history.push({ role: 'assistant', content: result.response });
        interviewState.questionCount = result.question_count;
        updateChatCount();

    } catch (error) {
        hideLoading();
        alert('开始面试失败: ' + error.message);
    }
}

function addChatMessage(role, content) {
    const messages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${role}`;

    const avatar = role === 'interviewer' ? '🤖' : '👤';
    messageDiv.innerHTML = `
        <div class="message-avatar">${avatar}</div>
        <div class="message-content">${renderMarkdown(content)}</div>
    `;

    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
}

function updateChatCount() {
    document.getElementById('chatCount').textContent = `第 ${interviewState.questionCount} 题`;
}

async function sendAnswer() {
    const input = document.getElementById('chatInput');
    const answer = input.value.trim();

    if (!answer || !interviewState.isActive) return;

    input.value = '';
    addChatMessage('user', answer);

    interviewState.history.push({ role: 'user', content: answer });

    showLoading('面试官正在思考...');

    try {
        const result = await apiCall('/api/interview/followup', {
            job_type: interviewState.jobType,
            question: answer,
            history: interviewState.history,
            difficulty: interviewState.difficulty
        });

        hideLoading();

        addChatMessage('interviewer', result.response);
        interviewState.history.push({ role: 'assistant', content: result.response });
        interviewState.questionCount = result.question_count;
        updateChatCount();

        if (result.is_finished) {
            showInterviewSummary(result.summary);
        }

    } catch (error) {
        hideLoading();
        alert('发送失败: ' + error.message);
    }
}

function showInterviewSummary(summary) {
    interviewState.isActive = false;
    addChatMessage('interviewer', `🎉 面试结束！\n\n${summary}`);
}

function endInterview() {
    if (confirm('确定要结束面试吗？')) {
        interviewState.isActive = false;
        document.getElementById('interviewSetup').style.display = 'block';
        document.getElementById('interviewChat').style.display = 'none';
    }
}

// ============ 岗位攻略 ============

async function getStrategy() {
    const jobType = document.getElementById('strategyJobType').value;
    const jdUrl = document.getElementById('strategyJdUrl').value;
    const jdText = document.getElementById('strategyJdText').value;

    if (!jobType) {
        alert('请选择岗位');
        return;
    }

    showLoading('正在生成面试攻略...');

    try {
        const result = await apiCall('/api/strategy/generate', {
            job_type: jobType,
            jd_url: jdUrl || null,
            jd_text: jdText || null
        });

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
    const resumeText = document.getElementById('resumeText').value;
    const targetJob = document.getElementById('resumeJobType').value;
    const optimizeType = document.getElementById('resumeOptType').value;

    if (!resumeText) {
        alert('请粘贴简历内容');
        return;
    }

    if (!targetJob) {
        alert('请选择目标岗位');
        return;
    }

    showLoading('正在优化简历...');

    try {
        const result = await apiCall('/api/resume/optimize', {
            resume_text: resumeText,
            target_job: targetJob,
            optimize_type: optimizeType
        });

        hideLoading();

        document.getElementById('resumeResult').style.display = 'block';
        document.getElementById('resumeContent').innerHTML = renderMarkdown(result.optimized_resume);
        document.getElementById('resumeResult').scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        hideLoading();
        alert('优化失败: ' + error.message);
    }
}

// ============ 转行攻略 ============

async function getCareerChange() {
    const currentJob = document.getElementById('careerCurrentJob').value;
    const targetJob = document.getElementById('careerTargetJob').value;
    const experienceYears = parseInt(document.getElementById('careerExpYears').value) || 0;

    if (!currentJob) {
        alert('请输入当前岗位');
        return;
    }

    if (!targetJob) {
        alert('请选择目标岗位');
        return;
    }

    showLoading('正在生成转行攻略...');

    try {
        const result = await apiCall('/api/career-change/strategy', {
            current_job: currentJob,
            target_job: targetJob,
            experience_years: experienceYears
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

// ============ 话术陷阱 ============

async function loadTraps() {
    const jobType = document.getElementById('trapsJobType').value;

    showLoading('正在加载话术陷阱...');

    try {
        const result = await apiCall('/api/traps/query', {
            question_type: 'general',
            job_type: jobType || null
        });

        hideLoading();

        const container = document.getElementById('trapsList');
        container.innerHTML = '';

        const traps = [...result.traps];
        if (result.extra_traps) {
            traps.push(...result.extra_traps);
        }

        traps.forEach(trap => {
            const card = document.createElement('div');
            card.className = 'trap-card';
            card.innerHTML = `
                <div class="trap-header">
                    <div class="trap-title">${trap.title}</div>
                    <span class="trap-tag">${trap.category}</span>
                </div>
                <div class="trap-question">💬 "${trap.question}"</div>
                <div class="trap-analysis">${trap.analysis}</div>
                <div class="trap-response">
                    <div class="trap-response-title">✅ 聪明应对</div>
                    <div class="trap-response-text">${trap.smart_response}</div>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (error) {
        hideLoading();
        alert('加载失败: ' + error.message);
    }
}

// ============ 岗位信息 ============

async function loadJobs() {
    try {
        const response = await fetch(`${API_BASE}/api/jobs/list`);
        const data = await response.json();

        const container = document.getElementById('jobsGrid');
        container.innerHTML = '';

        data.jobs.forEach(job => {
            const card = document.createElement('div');
            card.className = 'job-card';
            card.innerHTML = `
                <div class="job-card-header">
                    <div class="job-card-title">${job.type}</div>
                </div>
                <div class="job-card-salary">💰 ${job.salary_range}</div>
                <div class="job-card-skills">
                    <span class="skill-tag">${job.core_skills_count}项核心技能</span>
                    <span class="skill-tag">${job.questions_count}道面试题</span>
                </div>
                <div class="job-card-path">📈 ${job.career_path}</div>
            `;
            container.appendChild(card);
        });

    } catch (error) {
        console.error('加载岗位信息失败:', error);
    }
}

// ============ 宝妈专区 ============

async function generateMomStrategy() {
    const targetJob = document.getElementById('momTargetJob').value;
    const gapYears = parseInt(document.getElementById('momGapYears').value) || 0;
    const previousJob = document.getElementById('momPreviousJob').value;

    if (!targetJob) {
        alert('请选择目标岗位');
        return;
    }

    showLoading('正在为你制定专属攻略...');

    try {
        const result = await apiCall('/api/mom/strategy', {
            target_job: targetJob,
            gap_years: gapYears,
            previous_job: previousJob || null
        });

        hideLoading();

        document.getElementById('momResult').style.display = 'block';

        const tipsPreview = document.getElementById('momTipsPreview');
        if (result.mom_tips && result.mom_tips.length > 0) {
            tipsPreview.innerHTML = result.mom_tips.map(tip =>
                `<span class="mom-tip-tag">${tip.substring(0, 20)}...</span>`
            ).join('');
        }

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

        const difficultyMap = {
            '低': 'easy',
            '中等': 'medium',
            '高': 'hard',
            '很高': 'hard'
        };

        for (const job of data.jobs) {
            const difficultyClass = difficultyMap[job.difficulty] || 'medium';

            const card = document.createElement('div');
            card.className = `mom-job-card ${difficultyClass}`;
            card.innerHTML = `
                <div class="mom-job-card-header">
                    <div class="mom-job-card-title">${job.type}</div>
                    <span class="mom-job-card-difficulty">转行难度: ${job.difficulty}</span>
                </div>
                <div class="mom-job-card-salary">💰 ${job.salary_range}</div>
                <div class="mom-job-card-skills">
                    ${job.transferable_skills.map(skill =>
                        `<span class="mom-skill-tag">${skill}</span>`
                    ).join('')}
                </div>
                <div class="mom-job-card-action">点击生成攻略 →</div>
            `;

            card.addEventListener('click', () => {
                document.getElementById('momTargetJob').value = job.type;
                document.getElementById('momResult').scrollIntoView({ behavior: 'smooth' });
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

    const difficultyMap = {
        '低': 'easy',
        '中等': 'medium',
        '高': 'hard',
        '很高': 'hard'
    };

    container.innerHTML = jobs.map(job => {
        const difficultyClass = difficultyMap[job.difficulty] || 'medium';
        return `
            <div class="mom-job-card ${difficultyClass}" onclick="document.getElementById('momTargetJob').value='${job.type}';">
                <div class="mom-job-card-header">
                    <div class="mom-job-card-title">${job.type}</div>
                    <span class="mom-job-card-difficulty">转行难度: ${job.difficulty}</span>
                </div>
                <div class="mom-job-card-salary">💰 ${job.salary}</div>
                <div class="mom-job-card-skills">
                    ${job.skills.map(skill => `<span class="mom-skill-tag">${skill}</span>`).join('')}
                </div>
                <div class="mom-job-card-action">点击生成攻略 →</div>
            </div>
        `;
    }).join('');
}
