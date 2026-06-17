"""
AI面试官 - 后端API服务
使用DeepSeek API
"""
from fastapi import FastAPI, HTTPException, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional, List, Dict
import httpx
import json
import time
import os
import subprocess
import tempfile
from pathlib import Path
from dotenv import load_dotenv

# 加载.env文件（从项目根目录）
env_path = Path(__file__).parent.parent / ".env"
if env_path.exists():
    load_dotenv(env_path)
    print(f"✅ 已加载环境变量: {env_path}")
else:
    print(f"⚠️ 未找到.env文件: {env_path}")

app = FastAPI(title="AI面试官", version="1.0.0")

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DeepSeek API配置
# ⚠️ 安全：API Key从环境变量读取，不要硬编码在代码里！
DEEPSEEK_API_KEY = os.environ.get("DEEPSEEK_API_KEY", "")
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"
MODEL_NAME = "deepseek-chat"  # DeepSeek-V3

if not DEEPSEEK_API_KEY:
    print("⚠️ 警告：未设置DEEPSEEK_API_KEY环境变量！")
    print("请运行：export DEEPSEEK_API_KEY='你的key'")

# ============ 请求模型 ============

class InterviewRequest(BaseModel):
    """面试对话请求"""
    job_type: str  # 岗位类型
    question: str  # 用户回答
    history: List[Dict] = []  # 对话历史
    difficulty: str = "medium"  # easy/medium/hard

class StrategyRequest(BaseModel):
    """岗位攻略请求"""
    job_type: str
    jd_url: Optional[str] = None  # 招聘网页URL
    jd_text: Optional[str] = None  # 直接粘贴的JD文本

class ResumeRequest(BaseModel):
    """简历优化请求"""
    resume_text: str
    target_job: str
    optimize_type: str = "full"  # full/content/format

class CareerChangeRequest(BaseModel):
    """转行面试请求"""
    current_job: str
    target_job: str
    experience_years: int = 0

class TrapQueryRequest(BaseModel):
    """话术陷阱查询"""
    question_type: Optional[str] = None  # salary/weakness/resignation/general
    job_type: Optional[str] = None

class MomStrategyRequest(BaseModel):
    """宝妈专属面试攻略请求"""
    target_job: str
    gap_years: int = 0  # 离开职场多少年
    previous_job: Optional[str] = None  # 之前的工作

# ============ 硅基流动API调用 ============

async def call_deepseek(messages: List[Dict], temperature: float = 0.7, max_tokens: int = 2000) -> str:
    """调用DeepSeek API"""
    headers = {
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": MODEL_NAME,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "stream": False
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(
                DEEPSEEK_API_URL,
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=500, detail=f"API调用失败: {e.response.text}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"服务错误: {str(e)}")

# ============ 岗位知识库 ============

JOB_KNOWLEDGE = {
    "电商运营": {
        "core_skills": [
            "平台规则理解（淘宝/京东/拼多多/抖音电商）",
            "数据分析能力（生意参谋、京东商智等）",
            "活动策划与执行（双11、618等大促）",
            "商品标题优化与SEO",
            "直通车/引力魔方等付费推广",
            "内容营销（短视频、直播、图文）",
            "供应链协调与库存管理",
            "竞品分析与市场洞察"
        ],
        "interview_questions": [
            "你操盘过的店铺月GMV最高多少？怎么做的？",
            "ROI从2降到1.5，你会怎么排查和优化？",
            "描述一次成功的活动策划全过程",
            "你怎么看待抖音电商和传统货架电商的区别？",
            "如果给你一个新店铺，前3个月你会怎么规划？",
            "直通车点击率高但转化率低，可能是什么原因？",
            "你怎么做竞品分析？用什么工具？",
            "说一个你通过数据分析提升业绩的案例"
        ],
        "salary_range": "6K-15K（佛山），8K-25K（广深）",
        "career_path": "运营助理 → 运营专员 → 运营主管 → 运营经理 → 电商总监",
        "tips": [
            "用数据说话，准备具体的GMV/ROI/转化率数据",
            "展示你对平台最新规则的了解",
            "准备1-2个完整的成功案例",
            "了解目标公司的产品和竞品"
        ],
        "mom_tips": [
            "宝妈做电商有天然优势：你懂妈妈群体的消费心理",
            "可以说'我自己就是目标用户，更懂宝妈买什么、怎么选'",
            "时间管理是强项：带娃+做事锻炼了多任务能力",
            "可以先从兼职/代运营做起，积累案例再全职",
            "简历空白期可以说'期间做了个人电商项目/帮朋友店铺运营'"
        ],
        "career_change_entry": {
            "difficulty": "中等",
            "transferable_skills": [
                "用户视角（宝妈本身就是消费者）",
                "时间管理能力",
                "耐心细致（带娃锻炼的品质）",
                "学习能力（愿意学新平台规则）"
            ],
            "quick_start_plan": [
                "第1周：熟悉淘宝/抖音电商后台，看免费教程",
                "第2-4周：帮朋友/家人小店做运营练手",
                "第2个月：学习直通车/引力魔方基础操作",
                "第3个月：做一个自己的小号，积累实操经验",
                "面试时用实操数据说话，比证书管用"
            ],
            "interview_story": "我在带娃期间一直在关注电商行业，自己也实操了一个小店/帮朋友做了代运营，从选品、上架、优化标题到推广都做过。这段经历让我对电商运营有了实操理解，不是纸上谈兵。"
        }
    },
    "客服": {
        "core_skills": [
            "优秀的沟通表达能力",
            "情绪管理与抗压能力",
            "产品知识快速学习",
            "打字速度（≥60字/分钟）",
            "CRM系统操作",
            "投诉处理与危机化解",
            "销售转化技巧（售前客服）",
            "多任务并行处理"
        ],
        "interview_questions": [
            "遇到愤怒的客户投诉，你会怎么处理？",
            "你觉得好客服最重要的素质是什么？",
            "描述一次你成功化解客户不满的经历",
            "如果客户提出的要求超出你的权限，你会怎么做？",
            "你怎么看待客服工作的价值？",
            "你如何在高强度的工作中保持好的服务态度？",
            "你有没有通过服务促成销售转化的经验？",
            "如果同时有多个客户咨询，你怎么安排优先级？"
        ],
        "salary_range": "4K-7K（佛山），5K-9K（广深）",
        "career_path": "客服专员 → 客服组长 → 客服主管 → 客服经理 → 客户体验总监",
        "tips": [
            "展示你的耐心和同理心",
            "准备具体的客户服务案例",
            "强调你的情绪管理能力",
            "如果有销售转化的经验一定要提"
        ],
        "mom_tips": [
            "宝妈做客服的优势：耐心、同理心、抗压能力都被带娃锻炼过了",
            "面试时说'带娃让我学会了在高压下保持冷静和耐心'",
            "客服门槛低，是很多宝妈重返职场的首选岗位",
            "可以找远程客服/在家办公的岗位，方便照顾孩子",
            "强调你的沟通能力：每天和不同的人打交道（老师、其他家长等）"
        ],
        "career_change_entry": {
            "difficulty": "低",
            "transferable_skills": [
                "沟通能力（日常社交锻炼）",
                "耐心和同理心（育儿培养的品质）",
                "情绪管理（处理孩子哭闹的经验）",
                "多任务处理（同时照顾孩子+家务）",
                "快速学习（熟悉新产品的能力）"
            ],
            "quick_start_plan": [
                "第1周：了解客服工作流程和常用工具",
                "第2周：练习打字速度（目标60字/分钟以上）",
                "第3周：学习常见客服话术和投诉处理技巧",
                "第4周：模拟练习，准备面试常见问题",
                "客服培训期通常1-2周，上手快"
            ],
            "interview_story": "虽然我之前没有正式的客服经验，但带娃这几年锻炼了我的耐心和沟通能力。处理孩子的各种状况、和老师以及其他家长沟通，让我学会了如何在不同场景下有效沟通。我相信这些能力可以很好地应用到客服工作中。"
        }
    },
    "销售": {
        "core_skills": [
            "客户开发与维护能力",
            "商务谈判与议价技巧",
            "产品演示与方案呈现",
            "市场分析与客户需求挖掘",
            "CRM系统使用",
            "合同管理与回款跟进",
            "抗压能力与目标导向",
            "行业人脉与资源整合"
        ],
        "interview_questions": [
            "你过去最好的销售业绩是多少？怎么达成的？",
            "描述一个你从零开发到签单的客户案例",
            "客户说'太贵了'，你怎么应对？",
            "你怎么做客户分级管理？",
            "你如何在一个月内快速打开一个新市场？",
            "说一个你丢单的案例，你从中学到了什么？",
            "你怎么平衡短期业绩压力和长期客户关系？",
            "你用什么方法保持对行业动态的敏感度？"
        ],
        "salary_range": "5K-10K底薪+提成（佛山），8K-15K底薪+提成（广深）",
        "career_path": "销售专员 → 高级销售 → 销售主管 → 销售经理 → 销售总监/VP",
        "tips": [
            "用数字说话：业绩完成率、客户数量、签约金额",
            "展示你的客户资源和行业人脉",
            "准备完整的销售案例（开发→跟进→成交）",
            "了解目标公司的产品和客户群体"
        ],
        "mom_tips": [
            "宝妈做销售的优势：亲和力强、善于倾听、理解客户需求",
            "可以说'带娃让我更懂得换位思考，理解客户的真实需求'",
            "母婴/教育/保险等行业偏爱有孩子的销售，因为更懂客户",
            "时间相对灵活，可以根据孩子安排工作节奏",
            "强调你的韧性：带娃的辛苦比销售压力大多了"
        ],
        "career_change_entry": {
            "difficulty": "中等",
            "transferable_skills": [
                "沟通能力（日常社交）",
                "亲和力（宝妈天然优势）",
                "韧性（带娃锻炼的抗压能力）",
                "目标导向（育儿也是有目标的任务）",
                "学习能力（快速了解产品知识）"
            ],
            "quick_start_plan": [
                "第1周：了解销售基本流程和技巧",
                "第2周：学习产品知识，准备销售话术",
                "第3周：练习开场白和常见异议处理",
                "第4周：模拟演练，准备面试",
                "销售岗位通常有培训，入职后边做边学"
            ],
            "interview_story": "销售的核心是理解客户需求并建立信任。作为宝妈，我每天都在'销售'——说服孩子吃饭、和家人沟通、和其他家长交流。这些经历让我更懂得如何与人沟通、如何理解对方的真实想法。我相信这种能力可以很好地应用到销售工作中。"
        }
    },
    "行政": {
        "core_skills": [
            "Office办公软件精通（Excel/PPT/Word）",
            "公文写作与文档管理",
            "会议组织与纪要撰写",
            "办公环境与资产管理",
            "员工活动策划与执行",
            "供应商管理与采购",
            "跨部门沟通与协调",
            "行政流程优化"
        ],
        "interview_questions": [
            "你如何管理公司固定资产？",
            "组织一次年会/团建，你会怎么规划？",
            "如果两个部门对会议室使用有冲突，你怎么协调？",
            "你怎么看待行政工作的价值？",
            "你做过哪些行政流程优化的案例？",
            "如何处理员工的投诉或不满？",
            "你如何管理行政预算？",
            "描述一次你处理突发事件的经历"
        ],
        "salary_range": "4K-7K（佛山），5K-9K（广深）",
        "career_path": "行政专员 → 行政主管 → 行政经理 → 行政总监 → VP/COO",
        "tips": [
            "展示你的细心和条理性",
            "准备流程优化的具体案例",
            "强调你的沟通协调能力",
            "如果有大型活动策划经验要重点展示"
        ],
        "mom_tips": [
            "行政是宝妈转行的热门选择：工作稳定、时间规律、加班少",
            "带娃就是最高级的行政管理：管人、管事、管钱、管时间",
            "面试时说'管理一个家庭的运转，让我具备了优秀的组织和协调能力'",
            "Excel/PPT等技能可以在家自学，B站教程很多",
            "行政岗位看重细心和责任心，宝妈完全具备"
        ],
        "career_change_entry": {
            "difficulty": "低",
            "transferable_skills": [
                "组织协调能力（管理家庭事务）",
                "细心和责任心（育儿培养的品质）",
                "时间管理（平衡带娃和家务）",
                "沟通能力（与老师、家长、医生等沟通）",
                "预算管理能力（家庭开支规划）",
                "活动策划（组织亲子活动、生日会等）"
            ],
            "quick_start_plan": [
                "第1周：学习Excel基础（表格、公式、数据透视表）",
                "第2周：学习PPT制作（模板、排版、动画）",
                "第3周：了解行政工作流程和常用工具",
                "第4周：准备面试，练习常见问题",
                "可以考一个行政管理相关的证书加分"
            ],
            "interview_story": "行政管理需要细心、责任心和协调能力。这几年带娃的经历让我深刻体会到这些品质的重要性。管理一个家庭的日常运转——安排孩子的学习、处理各种突发状况、协调家庭成员的时间——这些经历锻炼了我的组织和协调能力。同时我也在自学Office办公软件，为重返职场做准备。"
        }
    },
    "电子产品认证工程师": {
        "core_skills": [
            "国际认证标准精通（CE/FCC/UL/CCC/CB/RCM/TUV/ETL）",
            "EMC电磁兼容测试与整改",
            "安规测试（耐压/绝缘/温升/漏电等）",
            "RoHS/REACH等环保指令",
            "产品安全标准（IEC 62368/IEC 60335等）",
            "认证资料准备与审核（原理图/PCB/BOM/规格书）",
            "与第三方实验室（SGS/TUV/Intertek/UL）沟通协调",
            "英文技术文档阅读与撰写",
            "问题排查与整改方案制定",
            "无线认证（RF认证：蓝牙/WiFi/4G/5G）"
        ],
        "interview_questions": [
            "CE认证和FCC认证的主要区别是什么？",
            "一个充电器产品出口欧洲需要做哪些认证？",
            "EMC测试不通过，你一般怎么排查和整改？",
            "CCC认证和CQC认证有什么区别？",
            "描述一次你处理认证失败并成功整改的经历",
            "UL认证和ETL认证有什么区别？",
            "你怎么理解安规测试中的基本绝缘和加强绝缘？",
            "RoHS 2.0和RoHS 3.0有什么区别？",
            "一个蓝牙音箱出口美国需要做哪些认证？",
            "如果产品认证测试中辐射超标，你会怎么整改？",
            "你怎么跟踪各认证标准的更新变化？",
            "描述你与第三方实验室合作的经验"
        ],
        "salary_range": "8K-15K（佛山），10K-20K（广深）",
        "career_path": "认证工程师 → 高级认证工程师 → 认证主管 → 认证经理 → 质量总监",
        "tips": [
            "展示你对各认证标准的深入理解，不要只停留在流程层面",
            "准备具体的整改案例（问题→分析→方案→结果）",
            "强调你与实验室的沟通经验",
            "了解目标公司的产品类型和目标市场",
            "如果有EMC整改经验是很大的加分项",
            "英文能力很重要，准备好英文自我介绍"
        ],
        "certifications": [
            "IECEx认证工程师（防爆产品）",
            "EMC工程师相关证书",
            "内审员证书（ISO 9001/14001）",
            "PMP项目管理（加分项）"
        ],
        "common_products": [
            "充电器/适配器", "手机/平板", "家电（风扇/暖风机/电饭煲）",
            "LED灯具", "蓝牙/WiFi产品", "音视频产品",
            "IT产品（电脑/显示器）", "医疗器械", "汽车零部件"
        ],
        "mom_tips": [
            "这是技术岗位，需要电子/电气相关专业背景",
            "如果有相关学历，可以强调'技术功底+细心负责'的组合优势",
            "认证工作需要细致和耐心，宝妈的品质是加分项",
            "佛山制造业发达，电子产品认证工程师需求量大",
            "可以先从认证助理/测试工程师做起，积累经验"
        ],
        "career_change_entry": {
            "difficulty": "高",
            "transferable_skills": [
                "细致认真（认证工作需要高度细心）",
                "文档管理能力（认证资料整理）",
                "沟通协调能力（与实验室对接）",
                "学习能力（需要不断学习新标准）",
                "英语能力（阅读英文标准文档）"
            ],
            "quick_start_plan": [
                "前提：需要电子/电气/自动化等相关专业背景",
                "第1-2月：学习认证基础知识（CE/FCC/CCC流程和标准）",
                "第3-4月：学习EMC和安规基础知识",
                "第5-6月：找认证助理/测试工程师岗位入行",
                "入行后边做边学，考取相关证书",
                "如果没有相关学历，转行难度很大，建议考虑其他方向"
            ],
            "interview_story": "虽然我是转行进入认证领域，但我有电子相关专业背景，加上这几年培养出的细致和耐心，让我非常适合这个需要高度责任心的工作。我已经自学了认证基础知识，对CE/FCC等认证流程有了基本了解。我相信我的学习能力和认真态度可以弥补经验上的不足。"
        }
    },
    "结构工程师": {
        "core_skills": [
            "3D建模软件精通（Pro/E或Creo/SolidWorks/UG）",
            "2D工程图输出（AutoCAD）",
            "塑胶件设计（壁厚/加强筋/卡扣/螺丝柱/拔模角度）",
            "钣金件设计（折弯/冲压/焊接）",
            "压铸/注塑/CNC等加工工艺理解",
            "公差分析与GD&T",
            "材料选择（塑料/金属/橡胶）",
            "产品结构强度分析",
            "模具基础知识（注塑模/冲压模/压铸模）",
            "产品装配与可靠性设计",
            "DFM（面向制造的设计）",
            "BOM编制与ECN变更管理"
        ],
        "interview_questions": [
            "塑胶件设计中最常见的缺陷有哪些？怎么避免？",
            "壁厚不均匀会导致什么问题？你怎么处理？",
            "卡扣设计的关键参数有哪些？",
            "描述一个你从ID到量产的完整项目经验",
            "你怎么做公差分析？用什么方法？",
            "注塑成型和压铸成型有什么区别？各适用于什么场景？",
            "产品跌落测试不通过，你会怎么分析和改进？",
            "你怎么选择塑胶材料？ABS和PC有什么区别？",
            "螺丝柱设计需要注意什么？",
            "你怎么理解DFM？举个你做过的DFM优化案例",
            "模具的拔模角度一般是多少？为什么？",
            "产品防水设计（IP67）你会怎么做？",
            "你怎么处理与ID设计师的分歧？",
            "描述一次你解决模具问题的经历"
        ],
        "salary_range": "8K-18K（佛山），12K-25K（广深）",
        "career_path": "结构工程师 → 高级结构工程师 → 结构主管 → 结构经理 → 技术总监/CTO",
        "tips": [
            "带上你的作品集（3D模型截图/实物照片），这是最重要的",
            "展示你对材料和工艺的深入理解",
            "准备完整的项目案例（问题→方案→结果）",
            "了解目标公司的产品类型（消费电子/家电/汽车等）",
            "如果有模具跟模经验是加分项",
            "强调你的DFM意识和成本意识"
        ],
        "software_skills": {
            "primary": ["Creo/Pro/E", "SolidWorks", "UG/NX"],
            "secondary": ["AutoCAD", "KeyShot(渲染)", "Ansys(仿真)"],
            "advanced": ["HyperMesh", "Abaqus", "Moldflow(模流分析)"]
        },
        "material_knowledge": [
            "ABS: 通用塑胶，易加工，强度适中",
            "PC: 高强度，透明，耐冲击",
            "PP: 耐化学性好，铰链效果好",
            "PA(尼龙): 高强度，耐磨，自润滑",
            "POM: 刚性好，尺寸稳定",
            "铝合金: 轻量，散热好，阳极氧化美观",
            "不锈钢: 高强度，耐腐蚀",
            "锌合金: 压铸，复杂形状，表面处理多样"
        ],
        "mom_tips": [
            "这是技术门槛最高的岗位，需要机械/模具相关专业背景",
            "如果有相关学历，可以强调'技术功底+细致耐心'的优势",
            "结构工程师在佛山需求量大（家电、家具、五金行业）",
            "可以先从绘图员/助理工程师做起，积累经验",
            "作品集是敲门砖，在家也可以练习建模积累作品"
        ],
        "career_change_entry": {
            "difficulty": "很高",
            "transferable_skills": [
                "空间想象力（如果有相关背景）",
                "细致认真（设计工作需要高度细心）",
                "学习能力（需要掌握多种软件和标准）",
                "耐心（解决设计问题需要反复尝试）",
                "动手能力（制作模型/样品）"
            ],
            "quick_start_plan": [
                "前提：需要机械/模具/工业设计等相关专业背景",
                "第1-3月：学习Creo或SolidWorks（B站免费教程）",
                "第4-6月：学习塑胶件/钣金件设计基础",
                "第7-9月：做几个练习项目，积累作品集",
                "第10-12月：找绘图员/助理结构工程师岗位",
                "如果没有相关学历和专业背景，转行极其困难",
                "建议考虑其他方向，或者先读相关专业的成人教育"
            ],
            "interview_story": "我有机械相关专业背景，虽然这几年因为家庭原因没有从事本专业工作，但我一直在关注行业发展，也在学习最新的建模软件。这段时间我做了几个练习项目（展示作品集），保持了对结构设计的热情。我相信我的专业基础加上现在的认真态度，可以快速上手工作。"
        }
    }
}

# ============ HR话术陷阱库 ============

HR_TRAPS = {
    "salary": {
        "trap": "你期望薪资多少？",
        "analysis": "HR想摸清你的底线，先报价的人往往吃亏。如果你报低了，公司不会给你加；报高了，可能直接被淘汰。",
        "response_strategy": "反客为主，让对方先出价",
        "sample_response": "薪资方面，我更看重的是整体发展机会。能否先了解一下贵公司这个岗位的薪资范围？我相信以我的能力和经验，我们一定能找到一个双方都满意的方案。",
        "alternatives": [
            "根据我的了解，这个岗位在佛山的市场价大约在X-Y之间，您觉得呢？",
            "我目前的薪资是X，期望能有一定的提升，但具体数字我更愿意听您的建议。"
        ]
    },
    "weakness": {
        "trap": "你最大的缺点是什么？",
        "analysis": "这道题考的不是你真的有什么缺点，而是你的自我认知和诚实度。说'太追求完美'这种套话HR早就听腻了。",
        "response_strategy": "说一个真实的、但不影响岗位核心能力的缺点，并展示你在改进",
        "sample_response": "我有时候在公众演讲时会比较紧张。不过我意识到这个问题后，已经主动参加了Toastmasters演讲俱乐部，现在在团队会议上做汇报已经自如多了。",
        "alternatives": [
            "我有时候会过于关注细节，导致项目进度受影响。现在我学会了用时间盒的方法来控制每个环节的投入。",
            "我的Excel高级功能还不太熟练，目前正在B站学习数据透视表和VBA。"
        ]
    },
    "resignation": {
        "trap": "你为什么从上一家公司离职？",
        "analysis": "HR在评估你的稳定性和职业成熟度。抱怨前公司是大忌，即使前公司真的很差。",
        "response_strategy": "正面表达，聚焦个人发展，不贬低前公司",
        "sample_response": "我在上一家公司工作了X年，学到了很多，也很感谢团队的培养。但我觉得自己在XX方面还有更大的成长空间，而贵公司在这个领域是行业领先的，所以我希望能在一个更大的平台上挑战自己。",
        "alternatives": [
            "前公司的业务方向调整，我所在的部门被缩减了。这反而给了我一个重新审视职业方向的机会。",
            "我在前公司已经做到了能力天花板，希望找一个能让我继续成长的环境。"
        ]
    },
    "overtime": {
        "trap": "你能接受加班吗？",
        "analysis": "HR在试探你的底线。说'不能'可能直接被淘汰，说'能'则可能成为免费的加班工具。",
        "response_strategy": "表达灵活态度，但设定合理边界",
        "sample_response": "我认为工作效率比工作时长更重要。如果项目确实需要赶进度，我完全可以配合加班。但我也会通过提升工作效率来尽量减少不必要的加班。",
        "alternatives": [
            "我理解有些岗位确实需要弹性工作时间。我想了解一下，贵公司通常的加班频率是怎样的？有加班补贴或调休吗？",
            "关键时期加班我完全没问题。但我更倾向于通过合理的时间管理来保证工作质量。"
        ]
    },
    "other_offer": {
        "trap": "你手上还有其他offer吗？",
        "analysis": "HR想评估你的市场竞争力和紧迫性。如果你说没有，HR会认为你不抢手；如果说太多，HR可能觉得你不稳定。",
        "response_strategy": "适度展示竞争力，但表达对本公司的偏好",
        "sample_response": "目前有两三家公司在接触，但贵公司是我的首选，因为XX（具体原因）。如果能拿到贵公司的offer，我会优先考虑。",
        "alternatives": [
            "有几家在流程中，但我更看重的是平台的长期发展，而不是短期的薪资。",
            "目前还没有最终确定的offer，贵公司是我面试体验最好的一家。"
        ]
    },
    "pressure": {
        "trap": "你的成绩/表现不太好，你怎么解释？",
        "analysis": "压力面试题，HR故意质疑你来观察你的抗压能力和应变能力。",
        "response_strategy": "不辩解，承认事实，展示反思和成长",
        "sample_response": "您说得对，那段时间确实不是我的最佳状态。事后我反思了几个原因：一是XX，二是XX。从那以后我做了XX调整，后来的表现您也看到了，有了明显的提升。",
        "alternatives": [
            "那个项目确实没有达到预期。但我从中学到了很多，比如XX。如果让我重新做一次，我会XX。",
            "我同意这不是我最好的表现。但我想补充的是，在那个项目中我负责了XX部分，这部分是完成了目标的。"
        ]
    },
    "family": {
        "trap": "你结婚了吗？有小孩吗？（针对女性/宝妈）",
        "analysis": "这是歧视性提问，但现实中很常见。HR在评估你会不会因为家庭影响工作。",
        "response_strategy": "正面回应，消除顾虑，强调工作能力",
        "sample_response": "我有小孩了，但这完全不会影响我的工作。相反，做了妈妈以后我的时间管理能力更强了，做事也更有效率。而且我有家人帮忙照顾孩子，完全可以全身心投入工作。",
        "alternatives": [
            "家庭和工作我都能平衡好。我在上一家公司期间也从未因为家庭原因影响过工作交付。",
            "我理解您的顾虑。但实际上，有家庭的人往往更稳定，更珍惜工作机会。"
        ]
    },
    "quick-leave": {
        "trap": "你打算在我们公司做多久？",
        "analysis": "HR担心你干几个月就跑了，招聘成本打水漂。",
        "response_strategy": "表达长期意愿，但要合理",
        "sample_response": "我希望能在贵公司长期发展。我选择公司很慎重，一旦加入就会全力以赴。我希望3年内能成为这个领域的专家，5年内能承担更大的责任。",
        "alternatives": [
            "我不太喜欢给自己设限。但我可以确定的是，只要我在这个岗位上一天，就会尽全力做到最好。",
            "我的职业规划是在XX领域深耕，而贵公司正好是这个领域的领先者，所以我是抱着长期发展的心态来的。"
        ]
    }
}

# ============ 功能API ============

@app.get("/api/health")
async def health_check():
    return {"message": "AI面试官 API服务", "version": "1.0.0"}

@app.post("/api/interview/start")
async def start_interview(request: InterviewRequest):
    """开始面试 - 获取第一个面试问题"""
    job_info = JOB_KNOWLEDGE.get(request.job_type)
    if not job_info:
        raise HTTPException(status_code=400, detail=f"不支持的岗位类型: {request.job_type}")

    difficulty_map = {
        "easy": "初级/入门级别",
        "medium": "中级/有经验",
        "hard": "高级/专家级别"
    }
    difficulty_desc = difficulty_map.get(request.difficulty, "中级")

    system_prompt = f"""你是一位经验丰富的HR面试官，正在面试一位应聘「{request.job_type}」岗位的候选人。
面试难度：{difficulty_desc}

岗位要求核心技能：
{chr(10).join(['- ' + s for s in job_info['core_skills'][:6]])}

你的任务：
1. 一次只问一个问题
2. 问题要专业、有针对性
3. 根据候选人的回答进行追问或转换话题
4. 适当施加压力，测试候选人的应变能力
5. 保持专业和礼貌

现在开始面试，先自我介绍，然后问第一个问题。"""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": "面试官你好，我准备好了。"}
    ]

    response = await call_deepseek(messages, temperature=0.8)

    return {
        "response": response,
        "job_type": request.job_type,
        "question_count": 1,
        "tips": job_info["tips"][:2]
    }

@app.post("/api/interview/chat")
async def interview_chat(request: InterviewRequest):
    """面试对话 - 多轮面试交互"""
    job_info = JOB_KNOWLEDGE.get(request.job_type)
    if not job_info:
        raise HTTPException(status_code=400, detail=f"不支持的岗位类型: {request.job_type}")

    system_prompt = f"""你是一位经验丰富的HR面试官，正在面试「{request.job_type}」岗位。

核心考察点：
{chr(10).join(['- ' + s for s in job_info['core_skills']])}

面试规则：
1. 一次只问一个问题
2. 根据候选人的回答进行追问或深入
3. 如果回答得好，给予肯定并进入下一个话题
4. 如果回答得不好，给一个追问机会
5. 已经问了{len(request.history)//2}个问题，注意控制节奏
6. 保持专业、有压力但不刁难

注意：这是第{len(request.history)//2 + 1}轮对话。"""

    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(request.history)
    messages.append({"role": "user", "content": request.question})

    response = await call_deepseek(messages, temperature=0.7)

    return {
        "response": response,
        "question_count": len(request.history) // 2 + 1
    }

@app.post("/api/interview/evaluate")
async def evaluate_interview(request: InterviewRequest):
    """面试评估 - 生成评估报告"""
    job_info = JOB_KNOWLEDGE.get(request.job_type)
    if not job_info:
        raise HTTPException(status_code=400, detail=f"不支持的岗位类型: {request.job_type}")

    # 构建完整对话记录
    conversation = ""
    for i, msg in enumerate(request.history):
        role = "面试官" if msg["role"] == "assistant" else "候选人"
        conversation += f"{role}: {msg['content']}\n\n"

    system_prompt = f"""你是一位资深的HR顾问，请对以下面试对话进行全面评估。

应聘岗位：{request.job_type}
岗位要求：
{chr(10).join(['- ' + s for s in job_info['core_skills']])}

面试对话记录：
{conversation}

请从以下维度进行评分（1-10分）并给出详细评价：

1. 专业知识（对岗位核心技能的掌握程度）
2. 沟通能力（表达清晰度、逻辑性）
3. 应变能力（面对追问的反应）
4. 职业态度（积极性、稳定性）
5. 经验匹配（过往经验与岗位的匹配度）

输出格式（JSON）：
{{
    "scores": {{
        "professional_knowledge": {{"score": 8, "comment": "评价"}},
        "communication": {{"score": 7, "comment": "评价"}},
        "adaptability": {{"score": 6, "comment": "评价"}},
        "attitude": {{"score": 8, "comment": "评价"}},
        "experience_match": {{"score": 7, "comment": "评价"}}
    }},
    "total_score": 7.2,
    "strengths": ["优势1", "优势2"],
    "weaknesses": ["不足1", "不足2"],
    "suggestions": ["建议1", "建议2", "建议3"],
    "overall_comment": "总体评价",
    "pass_probability": "75%"
}}"""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": "请对这次面试进行全面评估。"}
    ]

    response = await call_deepseek(messages, temperature=0.3, max_tokens=3000)

    # 尝试解析JSON
    try:
        # 提取JSON部分
        import re
        json_match = re.search(r'\{[\s\S]*\}', response)
        if json_match:
            evaluation = json.loads(json_match.group())
        else:
            evaluation = {"raw_response": response}
    except:
        evaluation = {"raw_response": response}

    return {
        "evaluation": evaluation,
        "job_type": request.job_type
    }

@app.post("/api/strategy/generate")
async def generate_strategy(request: StrategyRequest):
    """生成岗位攻略"""
    job_info = JOB_KNOWLEDGE.get(request.job_type)
    if not job_info:
        raise HTTPException(status_code=400, detail=f"不支持的岗位类型: {request.job_type}")

    jd_context = ""
    if request.jd_url:
        # 后续可以接入网页抓取
        jd_context = f"\n\n参考招聘信息URL: {request.jd_url}\n请基于该岗位的一般要求生成攻略。"
    elif request.jd_text:
        jd_context = f"\n\n具体招聘信息：\n{request.jd_text}"

    system_prompt = f"""你是一位资深的职业顾问，请为应聘「{request.job_type}」岗位的候选人制定一份详细的面试攻略。

岗位核心技能要求：
{chr(10).join(['- ' + s for s in job_info['core_skills']])}

常见面试问题：
{chr(10).join(['- ' + q for q in job_info['interview_questions'][:8]])}

薪资范围：{job_info['salary_range']}
职业发展路径：{job_info['career_path']}
面试技巧：
{chr(10).join(['- ' + t for t in job_info['tips']])}
{jd_context}

请生成一份完整的面试攻略，包含以下部分：

# 🎯 岗位攻略：{request.job_type}

## 一、岗位认知
- 岗位核心价值
- 关键能力要求
- 行业发展趋势

## 二、面试高频问题及参考回答
（至少准备5个核心问题的详细回答模板）

## 三、自我介绍模板
（针对该岗位的1-3分钟自我介绍）

## 四、必备知识清单
（面试前必须准备的知识点）

## 五、加分项展示策略
（如何在面试中脱颖而出）

## 六、薪资谈判策略
（该岗位的薪资谈判技巧）

## 七、入职后30天计划
（展示你的职业规划）

请用实用、接地气的语言，给出可以直接使用的内容。"""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": "请生成完整的面试攻略。"}
    ]

    response = await call_deepseek(messages, temperature=0.7, max_tokens=4000)

    return {
        "strategy": response,
        "job_type": request.job_type,
        "job_info": {
            "salary_range": job_info["salary_range"],
            "career_path": job_info["career_path"],
            "core_skills": job_info["core_skills"],
            "interview_questions": job_info["interview_questions"]
        }
    }

@app.post("/api/resume/optimize")
async def optimize_resume(request: ResumeRequest):
    """简历优化"""
    job_info = JOB_KNOWLEDGE.get(request.target_job)

    system_prompt = f"""你是一位专业的简历顾问，请帮助优化以下简历。

目标岗位：{request.target_job}
{f"岗位要求：{chr(10).join(['- ' + s for s in job_info['core_skills']])}" if job_info else ""}

优化类型：{request.optimize_type}
- full: 全面优化（内容+格式+关键词）
- content: 内容优化（突出亮点、量化成果）
- format: 格式优化（排版、结构）

原始简历：
{request.resume_text}

请从以下方面进行优化：

1. **整体评价**：简历的优缺点分析
2. **关键词优化**：确保包含目标岗位的核心关键词
3. **内容优化**：
   - 工作经历用STAR法则重写（情境-任务-行动-结果）
   - 量化成果（数字说话）
   - 突出与目标岗位匹配的经验
4. **结构优化**：建议更好的简历结构
5. **常见问题修正**：错别字、表述不当等

输出优化后的完整简历，并标注修改说明。"""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": "请帮我优化简历。"}
    ]

    response = await call_deepseek(messages, temperature=0.5, max_tokens=4000)

    return {
        "optimized_resume": response,
        "target_job": request.target_job,
        "optimize_type": request.optimize_type
    }

@app.post("/api/career-change/strategy")
async def career_change_strategy(request: CareerChangeRequest):
    """转行面试攻略"""
    source_info = JOB_KNOWLEDGE.get(request.current_job)
    target_info = JOB_KNOWLEDGE.get(request.target_job)

    system_prompt = f"""你是一位专业的职业规划师，请为一位想从「{request.current_job}」转行到「{request.target_job}」的候选人制定转行面试攻略。

候选人背景：
- 当前岗位：{request.current_job}
- 目标岗位：{request.target_job}
- 工作经验：{request.experience_years}年

{f"当前岗位技能：{chr(10).join(['- ' + s for s in source_info['core_skills'][:5]])}" if source_info else ""}

{f"目标岗位要求：{chr(10).join(['- ' + s for s in target_info['core_skills'][:5]])}" if target_info else ""}

请制定一份转行面试攻略，重点解决以下问题：

## 一、可迁移技能分析
（从当前岗位可以迁移到目标岗位的技能）

## 二、能力差距分析
（需要补充的技能和学习计划）

## 三、转行故事包装
（如何向面试官解释转行原因，让转行看起来是合理且有规划的选择）

## 四、自我介绍模板
（转行版本的自我介绍，突出可迁移技能）

## 五、高频转行面试题及回答
- 为什么要转行？
- 你没有相关经验，怎么胜任？
- 你为转行做了哪些准备？
- 你的优势是什么？

## 六、快速补课计划
（面试前需要紧急学习的知识和技能）

## 七、成功案例参考
（类似的转行成功案例）

请用鼓励但务实的语气，给出可以直接使用的建议。"""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": "请帮我制定转行面试攻略。"}
    ]

    response = await call_deepseek(messages, temperature=0.7, max_tokens=4000)

    return {
        "strategy": response,
        "current_job": request.current_job,
        "target_job": request.target_job
    }

@app.post("/api/traps/query")
async def query_traps(request: TrapQueryRequest):
    """查询HR话术陷阱及应对"""
    if request.question_type and request.question_type in HR_TRAPS:
        traps = {request.question_type: HR_TRAPS[request.question_type]}
    else:
        traps = HR_TRAPS

    # 如果有岗位类型，让AI补充特定岗位的陷阱
    extra_traps = ""
    if request.job_type:
        job_info = JOB_KNOWLEDGE.get(request.job_type)
        if job_info:
            system_prompt = f"""你是一位资深HR顾问，请补充3个「{request.job_type}」岗位面试中常见的HR话术陷阱及应对策略。

已有通用陷阱：薪资、缺点、离职原因、加班、其他offer、压力面试、家庭、稳定性

请补充该岗位特有的陷阱问题，格式：
{{
    "trap_name": {{
        "trap": "HR的问题",
        "analysis": "HR的真实意图",
        "response_strategy": "应对策略",
        "sample_response": "参考回答"
    }}
}}"""

            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": "请补充该岗位特有的面试陷阱。"}
            ]

            extra_traps = await call_deepseek(messages, temperature=0.7, max_tokens=2000)

    return {
        "traps": traps,
        "extra_traps": extra_traps,
        "job_type": request.job_type
    }

@app.get("/api/jobs/list")
async def list_jobs():
    """获取支持的岗位列表"""
    jobs = []
    for job_type, info in JOB_KNOWLEDGE.items():
        jobs.append({
            "type": job_type,
            "salary_range": info["salary_range"],
            "career_path": info["career_path"],
            "core_skills_count": len(info["core_skills"]),
            "questions_count": len(info["interview_questions"])
        })
    return {"jobs": jobs}

@app.get("/api/traps/list")
async def list_traps():
    """获取所有HR话术陷阱"""
    return {"traps": HR_TRAPS}

@app.post("/api/mom/strategy")
async def mom_strategy(request: MomStrategyRequest):
    """宝妈专属面试攻略"""
    job_info = JOB_KNOWLEDGE.get(request.target_job)
    if not job_info:
        raise HTTPException(status_code=400, detail=f"不支持的岗位类型: {request.target_job}")

    # 获取该岗位的宝妈专属建议
    mom_tips = job_info.get("mom_tips", [])
    career_change = job_info.get("career_change_entry", {})

    gap_desc = ""
    if request.gap_years > 0:
        gap_desc = f"离开职场{request.gap_years}年"
    elif request.previous_job:
        gap_desc = f"从{request.previous_job}转行"
    else:
        gap_desc = "重返职场"

    system_prompt = f"""你是一位专门帮助宝妈重返职场的职业顾问，请为一位想要{gap_desc}、应聘「{request.target_job}」的宝妈制定专属面试攻略。

宝妈优势（请融入攻略）：
{chr(10).join(['- ' + t for t in mom_tips])}

{f"转行难度：{career_change.get('difficulty', '中等')}" if career_change else ""}
{f"可迁移技能：{chr(10).join(['- ' + s for s in career_change.get('transferable_skills', [])])}" if career_change else ""}

岗位核心要求：
{chr(10).join(['- ' + s for s in job_info['core_skills'][:6]])}

请生成一份宝妈专属的面试攻略，包含：

# 👩‍👧‍👦 宝妈专属攻略：{request.target_job}

## 一、宝妈的优势如何转化为职场竞争力
（把带娃经历转化为职场语言）

## 二、简历空白期/转行怎么解释
（给出3种不同场景的话术模板）

## 三、面试高频问题及宝妈版回答
- 你有小孩了，能兼顾工作吗？
- 你离开职场这么久了，能适应吗？
- 为什么选择这个岗位？
- 你的优势是什么？
（每个问题都给出宝妈版本的参考回答）

## 四、自我介绍模板（宝妈版）
（1-3分钟，突出宝妈优势）

## 五、快速补课计划
（面试前需要准备的知识和技能）

## 六、面试注意事项
（着装、状态、心态等）

## 七、推荐的学习资源
（免费的学习渠道和资料）

请用温暖鼓励但务实的语气，让宝妈感受到被理解和支持，同时给出真正有用的建议。"""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": "请帮我制定宝妈专属的面试攻略。"}
    ]

    response = await call_deepseek(messages, temperature=0.7, max_tokens=4000)

    return {
        "strategy": response,
        "target_job": request.target_job,
        "gap_years": request.gap_years,
        "previous_job": request.previous_job,
        "mom_tips": mom_tips,
        "career_change": career_change
    }

@app.get("/api/mom/jobs")
async def mom_friendly_jobs():
    """获取对宝妈友好的岗位推荐"""
    mom_jobs = []
    for job_type, info in JOB_KNOWLEDGE.items():
        mom_tips = info.get("mom_tips", [])
        career_change = info.get("career_change_entry", {})
        difficulty = career_change.get("difficulty", "中等")

        # 按转行难度排序
        difficulty_score = {"低": 1, "中等": 2, "高": 3, "很高": 4}.get(difficulty, 2)

        mom_jobs.append({
            "type": job_type,
            "salary_range": info["salary_range"],
            "difficulty": difficulty,
            "difficulty_score": difficulty_score,
            "mom_tips_count": len(mom_tips),
            "transferable_skills": career_change.get("transferable_skills", [])[:3],
            "quick_start": career_change.get("quick_start_plan", [])[:3]
        })

    # 按难度排序
    mom_jobs.sort(key=lambda x: x["difficulty_score"])

    return {"jobs": mom_jobs}

# ============ 语音合成 (TTS) ============

import edge_tts
import hashlib

# TTS音频缓存目录
TTS_CACHE_DIR = Path(__file__).parent.parent / "tts_cache"
TTS_CACHE_DIR.mkdir(exist_ok=True)

# 中文女声列表（edge-tts免费）
TTS_VOICES = {
    "xiaoxiao": "zh-CN-XiaoxiaoNeural",    # 活泼女声
    "xiaoyi": "zh-CN-XiaoyiNeural",         # 温柔女声
    "yunjian": "zh-CN-YunjianNeural",        # 沉稳男声
    "yunxi": "zh-CN-YunxiNeural",            # 阳光男声
}
DEFAULT_TTS_VOICE = "xiaoxiao"

class TTSRequest(BaseModel):
    """TTS请求"""
    text: str
    voice: str = DEFAULT_TTS_VOICE

@app.post("/api/speech/tts")
async def text_to_speech(req: TTSRequest):
    """用edge-tts生成语音，返回MP3音频文件"""
    try:
        # 限制文本长度
        text = req.text.strip()[:500]
        if not text:
            return JSONResponse({"error": "文本为空"}, status_code=400)

        # 清理markdown格式
        clean = text
        for pattern, repl in [
            (r'#{1,6}\s', ''), (r'\*\*(.+?)\*\*', r'\1'),
            (r'\*(.+?)\*', r'\1'), (r'^[-*]\s', '',),
            (r'^\d+\.\s', ''), (r'\n+', '。'),
        ]:
            import re
            clean = re.sub(pattern, repl, clean, flags=re.MULTILINE)

        # 用文本hash做缓存key
        voice_name = TTS_VOICES.get(req.voice, TTS_VOICES[DEFAULT_TTS_VOICE])
        cache_key = hashlib.md5(f"{clean}_{voice_name}".encode()).hexdigest()
        cache_path = TTS_CACHE_DIR / f"{cache_key}.mp3"

        # 缓存命中直接返回
        if cache_path.exists() and cache_path.stat().st_size > 0:
            return FileResponse(
                str(cache_path),
                media_type="audio/mpeg",
                filename=f"tts_{cache_key}.mp3",
                headers={"Cache-Control": "public, max-age=86400"}
            )

        # 生成音频
        communicate = edge_tts.Communicate(clean, voice_name)
        await communicate.save(str(cache_path))

        if not cache_path.exists() or cache_path.stat().st_size < 100:
            return JSONResponse({"error": "音频生成失败"}, status_code=500)

        return FileResponse(
            str(cache_path),
            media_type="audio/mpeg",
            filename=f"tts_{cache_key}.mp3",
            headers={"Cache-Control": "public, max-age=86400"}
        )

    except Exception as e:
        return JSONResponse({"error": f"语音合成失败: {str(e)}"}, status_code=500)

@app.get("/api/speech/voices")
async def list_tts_voices():
    """返回可用的TTS语音列表"""
    return {"voices": [
        {"id": k, "name": v.replace("zh-CN-", "").replace("Neural", ""),
         "full_name": v}
        for k, v in TTS_VOICES.items()
    ]}

# ============ 语音识别 ============

@app.post("/api/speech/recognize")
async def recognize_speech(audio: UploadFile = File(...)):
    """接收录音文件，使用Google免费语音识别API转文字"""
    try:
        # Read audio data
        audio_data = await audio.read()
        if len(audio_data) < 100:
            return {"text": "", "error": "录音太短，请重试"}

        # Save to temp file
        with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmp_in:
            tmp_in.write(audio_data)
            tmp_in_path = tmp_in.name

        tmp_out_path = tmp_in_path.replace(".webm", ".flac")

        # Convert to FLAC 16kHz mono using ffmpeg
        result = subprocess.run(
            ["ffmpeg", "-i", tmp_in_path, "-ar", "16000", "-ac", "1",
             "-f", "flac", tmp_out_path, "-y"],
            capture_output=True, timeout=10
        )

        if not os.path.exists(tmp_out_path) or os.path.getsize(tmp_out_path) < 100:
            # Cleanup
            for p in [tmp_in_path, tmp_out_path]:
                try: os.unlink(p)
                except: pass
            return {"text": "", "error": "音频格式转换失败"}

        # Read FLAC data
        with open(tmp_out_path, "rb") as f:
            flac_data = f.read()

        # Call Google Speech API (free, no key needed for basic usage)
        # This is the same endpoint Chrome uses internally
        url = "https://www.google.com/speech-api/v2/recognize?output=json&lang=zh-CN&pfilter=0&key=AIzaSyBOti4mI-6S4g4M-0i1R3R-FeHFfCw_9J0"

        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                url,
                content=flac_data,
                headers={"Content-Type": "audio/x-flac; rate=16000"}
            )

        # Cleanup temp files
        for p in [tmp_in_path, tmp_out_path]:
            try: os.unlink(p)
            except: pass

        if response.status_code != 200:
            return {"text": "", "error": f"语音识别服务错误({response.status_code})"}

        # Parse Google's response
        # Response format: multiple JSON lines, each starting with result index
        text = ""
        for line in response.text.strip().split("\n"):
            line = line.strip()
            if not line:
                continue
            try:
                data = json.loads(line)
                results = data.get("result", [])
                for r in results:
                    alternatives = r.get("alternative", [])
                    for alt in alternatives:
                        t = alt.get("transcript", "")
                        if t:
                            text = t
                            break
            except json.JSONDecodeError:
                continue

        if not text:
            return {"text": "", "error": "没有识别到语音，请靠近麦克风再说一次"}

        return {"text": text, "error": ""}

    except subprocess.TimeoutExpired:
        return {"text": "", "error": "音频处理超时，请缩短录音时间"}
    except Exception as e:
        return {"text": "", "error": f"识别失败: {str(e)}"}

# ============ 静态文件托管（前端） ============

# 挂载前端静态文件目录
frontend_dir = Path(__file__).parent.parent / "frontend"
if frontend_dir.exists():
    # 挂载CSS和JS等静态资源
    app.mount("/static", StaticFiles(directory=str(frontend_dir)), name="static")
    
    @app.get("/")
    async def serve_index():
        """返回前端首页"""
        return FileResponse(frontend_dir / "index.html")

# ============ 启动 ============

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
