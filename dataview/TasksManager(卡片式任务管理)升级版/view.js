// 任务管理面板
const inputParams = input || {};
const {pages, taskSources: inputTaskSources, excludePaths: inputExcludePaths, options: inputOptions, pageSize: inputPageSize} = inputParams;

// 默认参数处理
const taskSources = inputTaskSources || ["00Journal", "00Todolist", "02Business", "03Life", "04Growth", "07People", "01Projects"];
const excludePaths = inputExcludePaths || ["00Todolist/Archieve_Todolist"];
const options = inputOptions || "";
const pageSize = inputPageSize || 20; // 默认每页显示20条任务

// 创建根容器
const rootNode = dv.el("div", "", {cls: "task-manager " + options, attr: {id: "taskManager" + Date.now()}});

// ==== 1. 收集任务（初始只收集基本数量信息）====
let taskCounts = null;

// 分类定义模板
const categoryTemplates = [
  { name: "逾期", query: `(not done) AND ((due before today) OR (scheduled before today)) AND (status.type is not IN_PROGRESS)`, color: "#ff4c4c" },
  { name: "进行中", query: `status.type is IN_PROGRESS`, color: "#4caf50" },
  { name: "待办", query: `(not done) AND ((no due date) AND (no scheduled date)) AND (status.type is not IN_PROGRESS)`, color: "#ff9800" },
  { name: "今天", query: `(not done) AND ((scheduled on today) OR (due on today)) AND (status.type is not IN_PROGRESS)`, color: "#2196f3" },
  { name: "明天", query: `(not done) AND ((due on tomorrow) OR (scheduled on tomorrow)) AND (status.type is not IN_PROGRESS)`, color: "#00bcd4" },
  { name: "一周内", query: `(not done) AND (((due after tomorrow) AND (due before in 7 day)) OR ((scheduled after tomorrow) AND (scheduled before in 7 day))) AND (status.type is not IN_PROGRESS)`, color: "#8bc34a" },
  { name: "未来", query: `(not done) AND ((due after in 7 day) OR (scheduled after in 7 day)) AND (status.type is not IN_PROGRESS)`, color: "#bbbbbb" },
  { name: "已完成", query: `done`, color: "#9e9e9e" },
];

// 当前选中分类索引
let currentCategoryIndex = 3; // 默认选中"今天"分类
let currentPage = 1; // 当前页码
let totalPages = 1; // 总页数

// 创建卡片容器
const cardsContainer = dv.el("div", "", {cls: "cards-container"});
rootNode.appendChild(cardsContainer);

// 创建任务列表容器
const taskListContainer = dv.el("div", "", {cls: "task-list"});
rootNode.appendChild(taskListContainer);

// 创建分页控件容器
const paginationContainer = dv.el("div", "", {cls: "pagination-container", style: "display: none;"});
rootNode.appendChild(paginationContainer);

// 快速计算任务数量（轻量级操作）
function calculateTaskCounts() {
    if (taskCounts) return taskCounts;
    
    taskCounts = {};
    const today = dv.date("today");
    const tomorrow = dv.date("tomorrow");
    const oneWeekLater = today.plus({ days: 6 });
    
    // 收集所有任务（只做一次）
    let allTasks = [];
    for (let source of taskSources) {
        let sourcePages = dv.pages(`"${source}"`).where(p =>
            !excludePaths.some(ex => p.file.path.startsWith(ex))
        );
        if (sourcePages.file.tasks) {
            allTasks.push(...sourcePages.file.tasks);
        }
    }
    
    // 过滤掉被取消的任务 [-]
    const tasks = allTasks.filter(t => t.status !== "-");
    
    // 计算各个分类的数量
    taskCounts.expired = tasks.filter(t => t.status === " " && (
        (t.due && dv.date(t.due).toJSDate() < today.toJSDate()) ||
        (t.scheduled && dv.date(t.scheduled).toJSDate() < today.toJSDate())
    )).length;
    
    taskCounts.ongoing = tasks.filter(t => t.status === "/").length;
    
    taskCounts.todo = tasks.filter(t => t.status === " " && (!t.due && !t.scheduled)).length;
    
    taskCounts.today = tasks.filter(t => t.status === " " && (
        (t.due && dv.date(t.due).toJSDate().toDateString() === today.toJSDate().toDateString()) ||
        (t.scheduled && dv.date(t.scheduled).toJSDate().toDateString() === today.toJSDate().toDateString())
    )).length;
    
    taskCounts.tomorrow = tasks.filter(t => t.status === " " && (
        (t.due && dv.date(t.due).toJSDate().toDateString() === tomorrow.toJSDate().toDateString()) ||
        (t.scheduled && dv.date(t.scheduled).toJSDate().toDateString() === tomorrow.toJSDate().toDateString())
    )).length;
    
    taskCounts.thisWeek = tasks.filter(t => t.status === " " && (
        (t.due && dv.date(t.due).toJSDate() > tomorrow.toJSDate() && dv.date(t.due).toJSDate() <= oneWeekLater.toJSDate()) ||
        (t.scheduled && dv.date(t.scheduled).toJSDate() > tomorrow.toJSDate() && dv.date(t.scheduled).toJSDate() <= oneWeekLater.toJSDate())
    )).length;
    
    taskCounts.future = tasks.filter(t => t.status === " " && (
        (t.due && dv.date(t.due).toJSDate() > oneWeekLater.toJSDate()) ||
        (t.scheduled && dv.date(t.scheduled).toJSDate() > oneWeekLater.toJSDate())
    )).length;
    
    taskCounts.completed = tasks.filter(t => t.status === "x").length;
    
    return taskCounts;
}

// 渲染分类卡片（初始显示实际数量）
function renderCategoryCards() {
    const counts = calculateTaskCounts();
    
    categoryTemplates.forEach((category, index) => {
        let count = 0;
        
        // 根据索引获取对应的数量
        switch(index) {
            case 0: count = counts.expired; break;
            case 1: count = counts.ongoing; break;
            case 2: count = counts.todo; break;
            case 3: count = counts.today; break;
            case 4: count = counts.tomorrow; break;
            case 5: count = counts.thisWeek; break;
            case 6: count = counts.future; break;
            case 7: count = counts.completed; break;
        }
        
        const card = dv.el("div", "", {cls: "card" + (index === currentCategoryIndex ? " active" : "")});
        
        // 添加点击事件
        card.addEventListener("click", () => {
            if (currentCategoryIndex === index) {
                // 如果点击的是当前已选中的卡片，取消选择
                card.classList.remove("active");
                currentCategoryIndex = -1;
                currentPage = 1;
                taskListContainer.innerHTML = "";
                paginationContainer.style.display = "none";
            } else {
                // 选择新的分类
                cardsContainer.querySelectorAll(".card").forEach(c => c.classList.remove("active"));
                card.classList.add("active");
                currentCategoryIndex = index;
                currentPage = 1;
                loadTasksForCategory(index);
            }
        });
        
        // 数字（直接显示实际数量）
        const number = dv.el("div", count.toString(), {cls: "number"});
        number.style.color = category.color;
        card.appendChild(number);
        
        // 标签
        const label = dv.el("div", category.name, {cls: "label"});
        card.appendChild(label);
        
        // 下划线
        const underline = dv.el("div", "", {cls: "underline"});
        underline.style.backgroundColor = category.color;
        card.appendChild(underline);
        
        cardsContainer.appendChild(card);
    });
}

// 渲染分页控件
function renderPagination(totalItems) {
    paginationContainer.innerHTML = "";
    paginationContainer.style.display = "flex";
    
    totalPages = Math.ceil(totalItems / pageSize);
    
    if (totalPages <= 1) {
        paginationContainer.style.display = "none";
        return;
    }
    
    // 第一页按钮
    if (currentPage > 1) {
        const firstButton = dv.el("button", "⏮️ 第一页", {cls: "pagination-button", title: "跳转到第一页"});
        firstButton.addEventListener("click", () => {
            currentPage = 1;
            loadTasksForCategory(currentCategoryIndex);
        });
        paginationContainer.appendChild(firstButton);
    }
    
    // 上一页按钮
    if (currentPage > 1) {
        const prevButton = dv.el("button", "← 上一页", {cls: "pagination-button", title: "上一页"});
        prevButton.addEventListener("click", () => {
            currentPage--;
            loadTasksForCategory(currentCategoryIndex);
        });
        paginationContainer.appendChild(prevButton);
    }
    
    // 页码信息
    const pageInfo = dv.el("span", `第 ${currentPage} 页 / 共 ${totalPages} 页`, {cls: "page-info"});
    paginationContainer.appendChild(pageInfo);
    
    // 下一页按钮
    if (currentPage < totalPages) {
        const nextButton = dv.el("button", "下一页 →", {cls: "pagination-button", title: "下一页"});
        nextButton.addEventListener("click", () => {
            currentPage++;
            loadTasksForCategory(currentCategoryIndex);
        });
        paginationContainer.appendChild(nextButton);
    }
    
    // 最后一页按钮
    if (currentPage < totalPages) {
        const lastButton = dv.el("button", "最后一页 ⏭️", {cls: "pagination-button", title: "跳转到最后一页"});
        lastButton.addEventListener("click", () => {
            currentPage = totalPages;
            loadTasksForCategory(currentCategoryIndex);
        });
        paginationContainer.appendChild(lastButton);
    }
    
    // 页码跳转输入框（可选功能）
    if (totalPages > 5) {
        const jumpContainer = dv.el("div", "", {cls: "jump-container", style: "display: flex; align-items: center; gap: 8px;"});
        
        const jumpInput = dv.el("input", "", {
            type: "number",
            cls: "jump-input",
            attr: {
                min: "1",
                max: totalPages,
                placeholder: "页码",
                value: currentPage
            },
            style: "width: 60px; padding: 4px 8px; border: 1px solid var(--background-modifier-border); border-radius: 4px;"
        });
        
        const jumpButton = dv.el("button", "跳转", {
            cls: "pagination-button",
            style: "padding: 4px 8px; font-size: 12px;",
            title: "跳转到指定页码"
        });
        
        jumpButton.addEventListener("click", () => {
            const pageNum = parseInt(jumpInput.value);
            if (pageNum >= 1 && pageNum <= totalPages && pageNum !== currentPage) {
                currentPage = pageNum;
                loadTasksForCategory(currentCategoryIndex);
            }
        });
        
        jumpInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                jumpButton.click();
            }
        });
        
        jumpContainer.appendChild(dv.el("span", "跳至:", {style: "font-size: 12px; color: var(--text-muted);"}));
        jumpContainer.appendChild(jumpInput);
        jumpContainer.appendChild(jumpButton);
        
        paginationContainer.appendChild(jumpContainer);
    }
}

// 加载指定分类的任务（完整渲染）
function loadTasksForCategory(index) {
    // 清空任务列表
    taskListContainer.innerHTML = "";
    
    try {
        const counts = calculateTaskCounts();
        let totalItems = 0;
        
        // 根据索引获取对应的数量
        switch(index) {
            case 0: totalItems = counts.expired; break;
            case 1: totalItems = counts.ongoing; break;
            case 2: totalItems = counts.todo; break;
            case 3: totalItems = counts.today; break;
            case 4: totalItems = counts.tomorrow; break;
            case 5: totalItems = counts.thisWeek; break;
            case 6: totalItems = counts.future; break;
            case 7: totalItems = counts.completed; break;
        }
        
        // 计算分页
        const limit = pageSize;
        const offset = (currentPage - 1) * pageSize;
        
        // 构建Tasks查询
        const basePaths = taskSources.map(source => `(path includes ${source})`).join(" OR ");
        const excludePathsQuery = excludePaths.map(path => `path does not include ${path}`).join(" AND ");
        
        let query = [
            categoryTemplates[index].query,
            basePaths,
            excludePathsQuery,
            "status.type is not CANCELLED",
            "sort by done reverse",
            "sort by priority",
            "sort by created reverse",
            "short mode",
            "show tree",
            `limit ${limit}`
        ].filter(Boolean).join("\n");

        // 创建Tasks代码块
        const fullBlock = "```tasks\n" + query + "\n```";
        const queryContainer = dv.el("div", fullBlock);
        taskListContainer.appendChild(queryContainer);
        
        // 渲染分页控件
        renderPagination(totalItems);
        
    } catch (error) {
        // 显示错误信息
        const errorMsg = dv.el("p", "❌ 加载失败: " + error.message, {cls: "error-message"});
        taskListContainer.appendChild(errorMsg);
    }
}

// 初始渲染：显示卡片和实际数量，并默认加载"今天"任务
renderCategoryCards();
// 默认加载"今天"任务列表
loadTasksForCategory(currentCategoryIndex);
