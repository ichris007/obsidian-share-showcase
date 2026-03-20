## 将 Obsidian Tasks 插件的到期日图标（due）转换为类似“2天后到期”的胶囊标签样式。

![](https://github.com/ichris007/obsidian-share-showcase/blob/main/CSS-snippets/assets/Task_due_tag.png)

### 说明：
- **兼容性**：这段代码自动适配深色/浅色模式。
- **功能**：它会把类似 `📅 2023-10-27` 的原始显示彻底隐藏，并根据日期距离今天的远近，替换成带有颜色的语义化文字（如 "2天后到期"）。

参考代码：https://gist.github.com/califa/34fed1d152a5a398081b65ee23cb4de4

### 精简并优化后的代码

#### 1. 中文标签

<details>

<summary> 打开查看代码 </summary>

```
/********************************************************************
把任务列表中的到期日icon换成文字描述，如2天后到期 
原帖：https://gist.github.com/califa/34fed1d152a5a398081b65ee23cb4de4 
提取&优化：by 科叔 https://github.com/ichris007/Obsidian_Lifein 
********************************************************************/
/* --- 核心变量定义：控制不同时间段的颜色 --- */
:root {
    --pill-1-outline: rgba(110, 69, 0, 0.357);
    --pill-1-color: rgba(54, 32, 0, 0.706);
    --pill-1-bg: rgba(176, 138, 0, 0.05);
    --pill-1-outline-dark: rgba(255, 228, 179, 0.27);
    --pill-1-color-dark: rgba(255, 231, 198, 0.776);
    --pill-1-bg-dark: rgba(255, 179, 0, 0.01);
    --pill-2-outline: rgba(204, 126, 0, 0.53);
    --pill-2-color: rgba(120, 50, 0, 0.81);
    --pill-2-bg: rgba(255, 171, 2, 0.07);
    --pill-2-outline-dark: rgba(255, 164, 37, 0.376);
    --pill-2-color-dark: rgb(255, 205, 77);
    --pill-2-bg-dark: rgba(252, 25, 0, 0.06);  
    --pill-3-outline: rgba(255, 89, 0, 0.51);
    --pill-3-color: rgba(123, 33, 0, 0.773);
    --pill-3-bg: rgba(255, 97, 5, 0.043);
    --pill-3-outline-dark: rgba(255, 120, 24, 0.443);
    --pill-3-color-dark: rgb(255, 163, 102);
    --pill-3-bg-dark: rgba(255, 0, 0, 0.067);  
    --pill-4-outline: rgba(222, 37, 0, 0.365);
    --pill-4-color: rgba(190, 32, 0, 0.925);
    --pill-4-bg: rgba(255, 38, 5, 0.03);
    --pill-4-outline-dark: rgba(255, 60, 26, 0.48);
    --pill-4-color-dark: rgb(255, 136, 112);
    --pill-4-bg-dark: rgba(255, 0, 0, 0.067);  
    --pill-5-outline: rgba(217, 0, 4, 0.318);
    --pill-5-color: rgba(187, 0, 6, 0.835);
    --pill-5-bg: rgba(255, 5, 5, 0.03);
    --pill-5-outline-dark: rgba(255, 34, 56, 0.5);
    --pill-5-color-dark: rgb(255, 133, 137);
    --pill-5-bg-dark: rgba(254, 0, 25, 0.075);  
    --pill-6-outline: rgba(199, 0, 83, 0.32);
    --pill-6-color: rgba(196, 0, 79, 0.886);
    --pill-6-bg: rgba(255, 5, 130, 0.03) ;
    --pill-6-outline-dark: rgba(255, 38, 125, 0.486);
    --pill-6-color-dark: rgb(255, 133, 172);
    --pill-6-bg-dark: rgba(254, 0, 93, 0.075);  
}

/* --- 基础样式：将日期变为胶囊状 --- */
.contains-task-list .task-due {
    display: inline-block;
    padding: .2em .45em;
    border-radius: 20px;
    font-size: .8em;
    margin-left: .3em;
    line-height: 1.2;
}

/* 隐藏原本的日历图标/原始文本 */
.contains-task-list .task-due span {
    display: none;
}

/* 任务完成后隐藏该标签 (可选，如需保留可删掉此段) */
.contains-task-list .task-list-item[data-task-done] .task-due {
    display: none;
}

/* --- 核心：替换文本内容 --- */
.contains-task-list .task-due[data-task-due="future-far"] span { display: inline; } /* 远期显示原日期 */
.contains-task-list .task-due[data-task-due="future-7d"]::after { content: "一周后到期" }
.contains-task-list .task-due[data-task-due="future-6d"]::after { content: "6天后到期" }
.contains-task-list .task-due[data-task-due="future-5d"]::after { content: "5天后到期" }
.contains-task-list .task-due[data-task-due="future-4d"]::after { content: "4天后到期" }
.contains-task-list .task-due[data-task-due="future-3d"]::after { content: "3天后到期" }
.contains-task-list .task-due[data-task-due="future-2d"]::after { content: "2天后到期" }
.contains-task-list .task-due[data-task-due="future-1d"]::after { content: "明天到期" }
.contains-task-list .task-due[data-task-due="today"]::after { content: "今天到期" }
.contains-task-list .task-due[data-task-due="past-1d"]::after { content: "昨天到期" }
.contains-task-list .task-due[data-task-due="past-2d"]::after { content: "2天前到期" }
.contains-task-list .task-due[data-task-due="past-3d"]::after { content: "3天前到期" }
.contains-task-list .task-due[data-task-due="past-4d"]::after { content: "4天前到期" }
.contains-task-list .task-due[data-task-due="past-5d"]::after { content: "5天前到期" }
.contains-task-list .task-due[data-task-due="past-6d"]::after { content: "6天前到期" }
.contains-task-list .task-due[data-task-due="past-7d"]::after { content: "一周前到期" }
.contains-task-list .task-due[data-task-due="past-far"]::after { content: "逾期超一周" }

/* --- 浅色模式颜色分配 --- */
.contains-task-list .task-due[data-task-due^="future-5"],
.contains-task-list .task-due[data-task-due^="future-6"],
.contains-task-list .task-due[data-task-due^="future-7"],
.contains-task-list .task-due[data-task-due="future-far"] { color: var(--pill-1-color); background-color: var(--pill-1-bg); }

.contains-task-list .task-due[data-task-due="future-4d"],
.contains-task-list .task-due[data-task-due="future-3d"] { color: var(--pill-2-color); background-color: var(--pill-2-bg); }

.contains-task-list .task-due[data-task-due="future-2d"],
.contains-task-list .task-due[data-task-due="future-1d"] { 
    box-shadow: var(--pill-3-outline) 0px 0px 0px 1px inset; color: var(--pill-3-color); background-color: var(--pill-3-bg); 
}

.contains-task-list .task-due[data-task-due="today"] { 
    box-shadow: var(--pill-4-outline) 0px 0px 0px 1px inset; color: var(--pill-4-color); background-color: var(--pill-4-bg); 
}

.contains-task-list .task-due[data-task-due^="past-1"],
.contains-task-list .task-due[data-task-due^="past-2"],
.contains-task-list .task-due[data-task-due^="past-3"] { 
    box-shadow: var(--pill-5-outline) 0px 0px 0px 1px inset; color: var(--pill-5-color); background-color: var(--pill-5-bg); 
}

.contains-task-list .task-due[data-task-due^="past-4"],
.contains-task-list .task-due[data-task-due^="past-5"],
.contains-task-list .task-due[data-task-due^="past-6"],
.contains-task-list .task-due[data-task-due^="past-7"],
.contains-task-list .task-due[data-task-due="past-far"] { 
    box-shadow: var(--pill-6-outline) 0px 0px 0px 1px inset; color: var(--pill-6-color); background-color: var(--pill-6-bg); 
}

/* --- 深色模式颜色分配 --- */
.theme-dark .task-due[data-task-due^="future-5"],
.theme-dark .task-due[data-task-due^="future-6"],
.theme-dark .task-due[data-task-due^="future-7"],
.theme-dark .task-due[data-task-due="future-far"] { box-shadow: var(--pill-1-outline-dark) 0px 0px 0px 1px inset; color: var(--pill-1-color-dark); background-color: var(--pill-1-bg-dark); }

.theme-dark .task-due[data-task-due="future-4d"],
.theme-dark .task-due[data-task-due="future-3d"] { box-shadow: var(--pill-2-outline-dark) 0px 0px 0px 1px inset; color: var(--pill-2-color-dark); background-color: var(--pill-2-bg-dark); }

.theme-dark .task-due[data-task-due="future-2d"],
.theme-dark .task-due[data-task-due="future-1d"] { box-shadow: var(--pill-3-outline-dark) 0px 0px 0px 1px inset; color: var(--pill-3-color-dark); background-color: var(--pill-3-bg-dark); }

.theme-dark .task-due[data-task-due="today"] { box-shadow: var(--pill-4-outline-dark) 0px 0px 0px 1px inset; color: var(--pill-4-color-dark); background-color: var(--pill-4-bg-dark); }

.theme-dark .task-due[data-task-due^="past-1"],
.theme-dark .task-due[data-task-due^="past-2"],
.theme-dark .task-due[data-task-due^="past-3"] { box-shadow: var(--pill-5-outline-dark) 0px 0px 0px 1px inset; color: var(--pill-5-color-dark); background-color: var(--pill-5-bg-dark); }

.theme-dark .task-due[data-task-due^="past-4"],
.theme-dark .task-due[data-task-due^="past-5"],
.theme-dark .task-due[data-task-due^="past-6"],
.theme-dark .task-due[data-task-due^="past-7"],
.theme-dark .task-due[data-task-due="past-far"] { box-shadow: var(--pill-6-outline-dark) 0px 0px 0px 1px inset; color: var(--pill-6-color-dark); background-color: var(--pill-6-bg-dark); }
```

</details>

#### 2. English labels

<details>

<summary> Click to view code </summary>

```

```css
/********************************************************************
Replace due date icon in task list with text description, e.g. "Due in 2 days"
Original post: https://gist.github.com/califa/34fed1d152a5a398081b65ee23cb4de4 
Extracted & optimized: by 科叔 https://github.com/ichris007/Obsidian_Lifein 
********************************************************************/
/* --- Core variables: control colors for different time ranges --- */
:root {
    --pill-1-outline: rgba(110, 69, 0, 0.357);
    --pill-1-color: rgba(54, 32, 0, 0.706);
    --pill-1-bg: rgba(176, 138, 0, 0.05);
    --pill-1-outline-dark: rgba(255, 228, 179, 0.27);
    --pill-1-color-dark: rgba(255, 231, 198, 0.776);
    --pill-1-bg-dark: rgba(255, 179, 0, 0.01);
    --pill-2-outline: rgba(204, 126, 0, 0.53);
    --pill-2-color: rgba(120, 50, 0, 0.81);
    --pill-2-bg: rgba(255, 171, 2, 0.07);
    --pill-2-outline-dark: rgba(255, 164, 37, 0.376);
    --pill-2-color-dark: rgb(255, 205, 77);
    --pill-2-bg-dark: rgba(252, 25, 0, 0.06);  
    --pill-3-outline: rgba(255, 89, 0, 0.51);
    --pill-3-color: rgba(123, 33, 0, 0.773);
    --pill-3-bg: rgba(255, 97, 5, 0.043);
    --pill-3-outline-dark: rgba(255, 120, 24, 0.443);
    --pill-3-color-dark: rgb(255, 163, 102);
    --pill-3-bg-dark: rgba(255, 0, 0, 0.067);  
    --pill-4-outline: rgba(222, 37, 0, 0.365);
    --pill-4-color: rgba(190, 32, 0, 0.925);
    --pill-4-bg: rgba(255, 38, 5, 0.03);
    --pill-4-outline-dark: rgba(255, 60, 26, 0.48);
    --pill-4-color-dark: rgb(255, 136, 112);
    --pill-4-bg-dark: rgba(255, 0, 0, 0.067);  
    --pill-5-outline: rgba(217, 0, 4, 0.318);
    --pill-5-color: rgba(187, 0, 6, 0.835);
    --pill-5-bg: rgba(255, 5, 5, 0.03);
    --pill-5-outline-dark: rgba(255, 34, 56, 0.5);
    --pill-5-color-dark: rgb(255, 133, 137);
    --pill-5-bg-dark: rgba(254, 0, 25, 0.075);  
    --pill-6-outline: rgba(199, 0, 83, 0.32);
    --pill-6-color: rgba(196, 0, 79, 0.886);
    --pill-6-bg: rgba(255, 5, 130, 0.03) ;
    --pill-6-outline-dark: rgba(255, 38, 125, 0.486);
    --pill-6-color-dark: rgb(255, 133, 172);
    --pill-6-bg-dark: rgba(254, 0, 93, 0.075);  
}

/* --- Base style: make the date pill-shaped --- */
.contains-task-list .task-due {
    display: inline-block;
    padding: .2em .45em;
    border-radius: 20px;
    font-size: .8em;
    margin-left: .3em;
    line-height: 1.2;
}

/* Hide the original calendar icon / raw text */
.contains-task-list .task-due span {
    display: none;
}

/* Hide the tag when task is completed (optional, remove if you want to keep it) */
.contains-task-list .task-list-item[data-task-done] .task-due {
    display: none;
}

/* --- Core: replace text content --- */
.contains-task-list .task-due[data-task-due="future-far"] span { display: inline; } /* Far future shows original date */
.contains-task-list .task-due[data-task-due="future-7d"]::after { content: "Due in 1 week" }
.contains-task-list .task-due[data-task-due="future-6d"]::after { content: "Due in 6 days" }
.contains-task-list .task-due[data-task-due="future-5d"]::after { content: "Due in 5 days" }
.contains-task-list .task-due[data-task-due="future-4d"]::after { content: "Due in 4 days" }
.contains-task-list .task-due[data-task-due="future-3d"]::after { content: "Due in 3 days" }
.contains-task-list .task-due[data-task-due="future-2d"]::after { content: "Due in 2 days" }
.contains-task-list .task-due[data-task-due="future-1d"]::after { content: "Due tomorrow" }
.contains-task-list .task-due[data-task-due="today"]::after { content: "Due today" }
.contains-task-list .task-due[data-task-due="past-1d"]::after { content: "Due yesterday" }
.contains-task-list .task-due[data-task-due="past-2d"]::after { content: "Due 2 days ago" }
.contains-task-list .task-due[data-task-due="past-3d"]::after { content: "Due 3 days ago" }
.contains-task-list .task-due[data-task-due="past-4d"]::after { content: "Due 4 days ago" }
.contains-task-list .task-due[data-task-due="past-5d"]::after { content: "Due 5 days ago" }
.contains-task-list .task-due[data-task-due="past-6d"]::after { content: "Due 6 days ago" }
.contains-task-list .task-due[data-task-due="past-7d"]::after { content: "Due 1 week ago" }
.contains-task-list .task-due[data-task-due="past-far"]::after { content: "Overdue > 1 week" }

/* --- Light mode color assignment --- */
.contains-task-list .task-due[data-task-due^="future-5"],
.contains-task-list .task-due[data-task-due^="future-6"],
.contains-task-list .task-due[data-task-due^="future-7"],
.contains-task-list .task-due[data-task-due="future-far"] { color: var(--pill-1-color); background-color: var(--pill-1-bg); }

.contains-task-list .task-due[data-task-due="future-4d"],
.contains-task-list .task-due[data-task-due="future-3d"] { color: var(--pill-2-color); background-color: var(--pill-2-bg); }

.contains-task-list .task-due[data-task-due="future-2d"],
.contains-task-list .task-due[data-task-due="future-1d"] { 
    box-shadow: var(--pill-3-outline) 0px 0px 0px 1px inset; color: var(--pill-3-color); background-color: var(--pill-3-bg); 
}

.contains-task-list .task-due[data-task-due="today"] { 
    box-shadow: var(--pill-4-outline) 0px 0px 0px 1px inset; color: var(--pill-4-color); background-color: var(--pill-4-bg); 
}

.contains-task-list .task-due[data-task-due^="past-1"],
.contains-task-list .task-due[data-task-due^="past-2"],
.contains-task-list .task-due[data-task-due^="past-3"] { 
    box-shadow: var(--pill-5-outline) 0px 0px 0px 1px inset; color: var(--pill-5-color); background-color: var(--pill-5-bg); 
}

.contains-task-list .task-due[data-task-due^="past-4"],
.contains-task-list .task-due[data-task-due^="past-5"],
.contains-task-list .task-due[data-task-due^="past-6"],
.contains-task-list .task-due[data-task-due^="past-7"],
.contains-task-list .task-due[data-task-due="past-far"] { 
    box-shadow: var(--pill-6-outline) 0px 0px 0px 1px inset; color: var(--pill-6-color); background-color: var(--pill-6-bg); 
}

/* --- Dark mode color assignment --- */
.theme-dark .task-due[data-task-due^="future-5"],
.theme-dark .task-due[data-task-due^="future-6"],
.theme-dark .task-due[data-task-due^="future-7"],
.theme-dark .task-due[data-task-due="future-far"] { box-shadow: var(--pill-1-outline-dark) 0px 0px 0px 1px inset; color: var(--pill-1-color-dark); background-color: var(--pill-1-bg-dark); }

.theme-dark .task-due[data-task-due="future-4d"],
.theme-dark .task-due[data-task-due="future-3d"] { box-shadow: var(--pill-2-outline-dark) 0px 0px 0px 1px inset; color: var(--pill-2-color-dark); background-color: var(--pill-2-bg-dark); }

.theme-dark .task-due[data-task-due="future-2d"],
.theme-dark .task-due[data-task-due="future-1d"] { box-shadow: var(--pill-3-outline-dark) 0px 0px 0px 1px inset; color: var(--pill-3-color-dark); background-color: var(--pill-3-bg-dark); }

.theme-dark .task-due[data-task-due="today"] { box-shadow: var(--pill-4-outline-dark) 0px 0px 0px 1px inset; color: var(--pill-4-color-dark); background-color: var(--pill-4-bg-dark); }

.theme-dark .task-due[data-task-due^="past-1"],
.theme-dark .task-due[data-task-due^="past-2"],
.theme-dark .task-due[data-task-due^="past-3"] { box-shadow: var(--pill-5-outline-dark) 0px 0px 0px 1px inset; color: var(--pill-5-color-dark); background-color: var(--pill-5-bg-dark); }

.theme-dark .task-due[data-task-due^="past-4"],
.theme-dark .task-due[data-task-due^="past-5"],
.theme-dark .task-due[data-task-due^="past-6"],
.theme-dark .task-due[data-task-due^="past-7"],
.theme-dark .task-due[data-task-due="past-far"] { box-shadow: var(--pill-6-outline-dark) 0px 0px 0px 1px inset; color: var(--pill-6-color-dark); background-color: var(--pill-6-bg-dark); }
```

```

</details>
