#### 把Bases表格拖放到侧边栏，建立一个快速搜索框。
Bases工具栏太占地方了，所以写个css把它隐藏，但工具栏还需要用到，就设计了悬停显示。

### 效果
![](https://github.com/ichris007/obsidian-share-showcase/blob/main/CSS-snippets/assets/Bases_%E4%BE%A7%E8%BE%B9%E6%A0%8F_%E9%9A%90%E8%97%8F%E5%B7%A5%E5%85%B7%E6%A0%8F(%E6%82%AC%E5%81%9C%E6%98%BE%E7%A4%BA).gif)

### 代码

<details>
<summary> 点击查看CSS代码 </summary>

```
/*======================================================
|                        Bases侧边栏美化                      |
|  by 科叔 https://github.com/ichris007/Obsidian_Lifein |
=======================================================*/

/* 1. 统一过渡参数，消灭时间差 */
.workspace-leaf-content[data-type="bases"] .bases-header,
.workspace-leaf-content[data-type="bases"] .bases-search-row {
    /* 采用更快的速度和更简单的线性曲线，减少浏览器计算量 */
    transition: all 0.15s ease-out !important; 
}

/* 2. Header 调小并优化滑入逻辑 */
.workspace-leaf-content[data-type="bases"] .bases-header {
    height: 22px !important; /* 调小高度 */
    min-height: 22px !important;
    position: absolute !important;
    top: 0; left: 0; right: 0;
    z-index: 100;
    
    /* 核心变动：改用微位移，减少“长距离下滑”带来的视觉异步 */
    transform: translateY(-5px); 
    opacity: 0;
    
    background: var(--background-primary);
    border-bottom: 1px solid var(--background-modifier-border);
    padding: 0 4px !important; /* 压缩内部空间 */
    overflow: hidden;
}

/* 3. 悬停触发：高度压窄后的同步响应 */

/* 只有在 Hover 时才让 Header 显现 */
.workspace-leaf-content[data-type="bases"] .view-content:hover .bases-header {
    transform: translateY(0);
    opacity: 1;
}

/* 侧边栏搜索框：跟随 Header 步调同步下压 */
.workspace-leaf-content[data-type="bases"] .view-content:hover .bases-search-row {
    /* 这里的 margin-top 必须严格等于 Header 的高度，确保严丝合缝 */
    margin-top: 22px !important; 
}

/* 如果没开搜索框，表头同步下压 */
.workspace-leaf-content[data-type="bases"] .view-content:hover .bases-header + .bases-view .bases-thead {
    margin-top: 22px !important;
}

/* --- 4. 搜索框精修：防止被 Header 遮挡 --- */
.workspace-leaf-content[data-type="bases"] .bases-search-row {
    position: relative;
    z-index: 99; /* 略低于 Header */
    margin-top: 0;
    /* 确保搜索框顶部没有多余的空隙 */
    padding-top: 0 !important; 
    padding-bottom: 0 !important;
}

/* 调小 Header 内部按钮的大小以适配 22px 高度 */
.workspace-leaf-content[data-type="bases"] .bases-header .text-icon-button {
    height: 18px !important;
    font-size: 11px !important;
    padding: 0 4px !important;
}


```
