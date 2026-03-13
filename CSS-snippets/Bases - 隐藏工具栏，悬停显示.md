### Bases表格很好用，但是它的工具栏在有些场合碍眼，所以写了个样式把工具栏隐藏掉，鼠标划过可显示。
---
## 特点：
#### 1. 致极简布局
- 默认隐藏表格工具栏，消除视觉干扰，使表格与文档内容完美融合。

#### 2. 按需交互体验
- 鼠标悬停即时滑出工具栏，在不破坏页面整洁的前提下提供完整功能。

#### 2. 智能空间补偿
- 悬停时动态撑开底部容器，确保工具栏出现时不遮挡任何表格行数据。
---
## 效果

![](https://github.com/ichris007/obsidian-share-showcase/blob/main/CSS-snippets/assets/base%E9%9A%90%E8%97%8F%E5%B7%A5%E5%85%B7%E6%A0%8F%E6%BC%94%E7%A4%BA.gif)
---
## 代码

<details>
    
<summary>点击看代码</summary>

```css
/*======================================================
|                        Bases美化                      |
|  by 科叔 https://github.com/ichris007/Obsidian_Lifein |
=======================================================*/

/* 隐藏列标题中的文字图标icon*/
.bases-table-header-icon {
    display: none;
}

/* Show title on two lines */
.bases-cards-property.mod-title .bases-cards-line {
  font-size: var(--font-ui-small);
  line-height: 1.2;
  height: 2.8em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* Bases表格视图 - 悬浮前隐藏删除按钮，显示属性值 */
.bases-table .multi-select-pill-remove-button {
  visibility: hidden;
}

.bases-table .multi-select-pill:hover .multi-select-pill-remove-button {
  visibility: visible;
}


/* 设置卡片标题颜色 */
.bases-cards-property.mod-title {
  color: rgb(187, 128, 245);
}

/* 通过cssclass hide-basebar 隐藏筛选框 */
.hide-basebar .bases-header {
    display: none !important;
}

/* 通过cssclass no-toolbar 隐藏编辑块按钮<>之外的所有内容 */
.no-toolbar {
    .query-toolbar {
        display: none;
    }
    &.mod-cm6 .cm-content > .bases-embed .edit-block-button {
        opacity: 0.3;
    }
}

/* 1. Bases表格奇偶行背景色设置 */
.bases-table-container .bases-tbody .bases-tr:nth-child(odd) {
    background-color: var(--color-base-00); /* 奇数行背景色 */
}

.bases-table-container .bases-tbody .bases-tr:nth-child(even) {
    background-color: var(--color-base-20); /* 偶数行背景色 */
}

/* 2. 添加悬停效果 */
.bases-table-container .bases-tbody .bases-tr:hover {
    background-color: var(--color-accent); /* 悬停时的背景色 */
    transition: background-color 0.2s ease;
}

/* 3. 设置表头样式 */
.bases-table-container .bases-thead .bases-tr {
    background-color: var(--color-base-20) !important; /* 表头背景色 */
    font-weight: bold;
}



/*  设置表格行前序号 
笔记内添加cssclasses = bases-ordered-list  生效  */

.workspace-split.mod-sidedock.mod-right-split .workspace-tabs:not(.mod-top) .bases-view,
.bases-ordered-list,
.bases-embed[alt~="ordered-list"] {

    .query-toolbar-item:not(.mod-views) { display: none; }

    /* 隐藏下方阴影 */
    .bases-tbody { box-shadow: none; }

    .bases-view[data-view-type="table"] {--bases-embed-border-width: 0; overflow-x: hidden;}

    /* 隐藏标题栏 */
    .bases-thead { display: none; }

    /* 计数序号功能 */
    .bases-tr { counter-increment: di-bases-pure-list-counter; }

    /* 表格的网格 */
    .bases-tr, .bases-td { box-shadow: none; }

    /* .bases-table-cell { font-size: var(--font-text-size); } */

    /* 隐藏下划线——这里只针对链接位于第一列的情况 */
    .bases-td:first-of-type a { 
        text-decoration: none; 

        &:hover {
            text-decoration: underline;
        }
    }

    /* 添加前方的序号 */
    .bases-td:first-of-type .bases-table-cell::before {
        content: counter(di-bases-pure-list-counter) ". ";
        color: var(--list-marker-color);
        padding-right: 1ch;
        padding-left: 1ch;
    }

}

/* 复选框居中对齐 */
.bases-view .bases-tbody .bases-tr > *:has(input[type="checkbox"]) {
  text-align: center !important;
}
.bases-view input[type="checkbox"] {
  display: inline-block;
  margin: 0 auto !important;
  vertical-align: middle;
}



/************************************************/
/* Obsidian Base 最终完美版：全同步 + 底部防遮挡 */

/* 1. 容器设置 */
.bases-embed {
    overflow: hidden !important;
    position: relative;
    /* 核心：为容器的高度变化添加过渡，确保底部不卡顿 */
    transition: height 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}

/* 2. Header 设置：保持绝对定位 */
.bases-embed .bases-header {
    height: 25px !important;
    min-height: 25px !important;
    max-height: 25px !important;
    padding: 0 8px !important;
    
    transform: translateY(-25px);
    opacity: 0;
    
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 99;

    transition: 
        transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1),
        opacity 0.2s ease-out;
}

/* 3. 视图层平移 */
.bases-embed .bases-view,
.bases-embed .bases-embed-view {
    transform: translateY(0);
    transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
    will-change: transform;
}

/* 4. 悬停触发：同步平移 */
.bases-embed:hover .bases-header {
    transform: translateY(0);
    opacity: 1;
}

.bases-embed:hover .bases-view,
.bases-embed:hover .bases-embed-view {
    transform: translateY(25px);
}

/* 5. 【关键修复】底部补偿：防止内容被遮挡 */
/* 通过在悬停时给容器增加一个底部内边距，强制撑开空间 */
.bases-embed {
    /* 初始状态底部无边距 */
    padding-bottom: 0px;
    transition: padding-bottom 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.bases-embed:hover {
    /* 悬停时，底部增加 25px，抵消视图下移带来的截断 */
    padding-bottom: 25px;
}

/* 6. 图标缩放微调 */
.bases-embed .bases-header > div {
    height: 25px !important;
    display: flex;
    align-items: center;
    transform: scale(0.85);
    transform-origin: left center;
}


/* ============================================================
   7. 搜索行 (Search Row) 综合优化方案
   ============================================================ */

/* --- 模块 A: 基础容器与状态控制 --- */
.bases-embed .bases-search-row {
    /* 基础尺寸 */
    height: 30px !important;
    min-height: 30px !important;
    padding: 0 10px !important;
    background: transparent !important;
    
    /* 动画同步：与 Header 保持一致 */
    transform: translateY(0);
    transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
    will-change: transform;
    
    position: relative;
    z-index: 5;
}

/* 仅在悬停时下移，腾出 Header 空间 */
.bases-embed:hover .bases-search-row {
    transform: translateY(25px);
}

/* 核心修复：只有当插件未将其隐藏时，才激活 Flex 布局 */
.bases-embed .bases-search-row:not([style*="display: none"]) {
    display: flex !important;
    align-items: center !important;
}

/* 核心修复：完全尊重插件的隐藏指令 */
.bases-embed .bases-search-row[style*="display: none"] {
    display: none !important; /* 强制回归隐藏状态 */
}


/* --- 模块 B: 内部输入容器布局 --- */
.bases-embed .bases-search-row .search-input-container {
    height: 24px !important;
    width: 100% !important;
    display: flex !important;
    align-items: center !important;
    position: relative !important;
}

/* 输入框文字排版 */
.bases-embed .bases-search-row input[type="search"] {
    width: 100% !important;
    height: 100% !important;
    padding-left: 28px !important;  /* 避开左侧 Icon */
    padding-right: 28px !important; /* 避开右侧清除按钮 */
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    outline: none !important;
    line-height: normal !important;
    margin: 0 !important;
}


/* --- 模块 C: 关键组件精修 (Icon & Clear Button) --- */

/* 1. 搜索图标 (::before) */
.bases-embed .bases-search-row .search-input-container::before {
    content: "";
    position: absolute !important;
    left: 8px !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    width: 14px !important;
    height: 14px !important;
    z-index: 2;
    pointer-events: none;
}

/* 2. 清除按钮 (恢复显隐逻辑) */
.bases-embed .bases-search-row .search-input-clear-button {
    /* 移除强制 display: flex，允许插件根据输入内容控制显隐 */
    position: absolute !important;
    right: 8px !important;
    top: 50% !important;
    
    /* 垂直对齐修正：+1px 解决视觉偏位 */
    transform: translateY(calc(-50% + 1px)) !important;
    
    /* 只有当它被插件显示出来时，才应用居中样式 */
    justify-content: center !important;
    align-items: center !important;
    
    width: 16px !important;
    height: 16px !important;
    padding: 0 !important;
    margin: 0 !important;
    line-height: 0 !important;
}

/* 3. 内部图标修正 */
.bases-embed .bases-search-row .search-input-clear-button svg {
    display: block !important;
    margin: 0 !important;
}

/************/

/* 当鼠标悬停在 Base 容器上时，搜索行同步下移 25px */
.bases-embed:hover .bases-search-row {
    transform: translateY(25px);
}

/* 8. 稳定性修复：防止按钮行内部元素产生位移 */
.bases-embed .bases-header * {
    /* 强制 Header 内部的搜索图标等按钮不跟随平移逻辑 */
    transform: none !important;
}

/* 9. 布局补丁：防止搜索行展开时与表头重叠 */
.bases-search-row {
    /* 确保搜索行有背景色，避免透明重叠 */
    background-color: var(--background-primary);
    border-bottom: 1px solid var(--background-modifier-border);
}


```

</details>
