## 简介
Obsidian的Tasks插件在渲染任务列表时，我觉得样式比较粗糙，不够美观，在网上看到一个比较喜欢的样式，就自己定制化修改成喜欢的样子（下图）。
![](https://github.com/ichris007/obsidian-share-showcase/blob/main/CSS-snippets/assets/tasks%E9%AB%98%E5%BA%A6%E5%AE%9A%E5%88%B6%E7%BE%8E%E5%8C%96.png)

## 样式特点
- 视觉瘦身：隐藏原始优先级图标，通过复选框颜色（红/橙/青）映射任务等级。  
- 交互增强：任务描述默认单行显示并伴有末尾渐变，悬停时自动展开全文。
- 极简图标：引入自定义字体库，统一日期、ID、重复等属性为精致单色图标。
- 空间压缩：极致消减分组标题、列表容器及行间距，解决编辑模式下的空隙。
- 全端适配：针对移动端（iOS）优化图标偏移、日期选择器及点击交互。

*提示*：
- 这个样式在渲染嵌套任务时，渲染可能失败。（介意的朋友勿用，如果你能修复，也请教教我。）

## 样式代码

<details>
<summary>点击展开复制代码</summary>

```
/***************************************************************
 * Obsidian Tasks 高度定制化美化方案
 * * 1. 视觉瘦身：隐藏原始优先级图标，通过复选框颜色（红/橙/青）映射任务等级。
 * 2. 交互增强：任务描述默认单行显示并伴有末尾渐变，悬停时自动展开全文。
 * 3. 极简图标：引入自定义字体库，统一日期、ID、重复等属性为精致单色图标。
 * 4. 空间压缩：极致消减分组标题、列表容器及行间距，解决编辑模式下的空隙。
 * 5. 全端适配：针对移动端（iOS）优化图标偏移、日期选择器及点击交互。
 * 作者GitHub：https://github.com/ichris007/Obsidian_Lifein
 * 原始来源：https://github.com/obsidian-tasks-group/obsidian-tasks/discussions/3419
 ****************************************************************/

@charset "UTF-8";

/*!
Included icons were modified from https://lucide.dev
License reproduced from https://lucide.dev/license
*/
/*! Generator: obsidian-tasks-custom-icons v1.0.6 https://github.com/obsidian-tasks-group/obsidian-tasks-custom-icons */
@font-face {
  font-family: 'TasksMonoEmojis';
  src: url('data:@file/octet-stream;base64,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') format('woff2');
  unicode-range: U+23E9, U+23EB, U+23EC, U+23F0, U+23F3, U+26D4, U+2705, U+274C, U+2795, U+1F194, U+1F3C1, U+1F4C5, U+1F4CD, U+1F4DD, U+1F501, U+1F517, U+1F53A, U+1F53C, U+1F53D, U+1F6EB;
  /* U+23E9:⏩, U+23EB:⏫, U+23EC:⏬, U+23F0:⏰, U+23F3:⏳, U+26D4:⛔, U+2705:✅, U+274C:❌, U+2795:➕, U+1F194:🆔, U+1F3C1:🏁, U+1F4C5:📅, U+1F4CD:📍, U+1F4DD:📝, U+1F501:🔁, U+1F517:🔗, U+1F53A:🔺, U+1F53C:🔼, U+1F53D:🔽, U+1F6EB:🛫 */
}

@supports (-webkit-touch-callout: none) {

  /* Target Safari iOS */
  @font-face {
    font-family: 'TasksMonoEmojis';
    src: url('data:@file/octet-stream;base64,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') format('woff2');
    /*
			The following is a specific fix for Obsidian iOS.
			For reasons unknown, a single hardcoded wide range is required to make all of the icons replace correctly.
		*/
    unicode-range: U+02000-1F9FF;
  }
}

/*****************************************
 * 1. 任务列表样式调整
 * 这一块主要负责任务内容的字体大小、间距和排版。
 *****************************************/

.block-language-tasks {

  /* 针对 ID、优先级、日期、重复属性等所有“额外信息”的统一设置 */
  .task-id,
  .task-dependsOn,
  .task-priority,
  .task-recurring,
  .task-created,
  .task-start,
  .task-scheduled,
  .task-done,
  .task-cancelled,
  .task-due,
  .tasks-postpone,
  .tasks-backlink,
  .tasks-edit,
  .suggestion-container .suggestion {
    font-family: 'TasksMonoEmojis', var(--font-text); /* 使用上面定义的图标字体 */
    font-size: 1rem; /* 图标尺寸 */
    line-height: 1.8rem !important;/* 设置行高 */
    padding: 0px 0.25rem;/* 左右留一点小空隙 */
  }

  /* 让日期等额外信息横向排列 */
  span.task-extras {
    display: inline-flex;
    gap: 1px !important;    /* 元素间距 */ 
    align-items: center;    /* 垂直居中 */
  }
  
  /* 把“推迟”按钮标红 */ 
  .tasks-postpone {
    color: var(--color-red);
  }



/***************************************************************
* 2. 当任务列表进行分组时，调整标题和列表间距
****************************************************************/

/* 1. 调整标题的上下边距 */
.tasks-group-heading {
  margin-bottom: 0px !important;
  margin-top: 0px  !important;
  padding-bottom: 0px !important;
}
/* 2. 调整任务查询结果的上下边距(整个任务列表) */
.contains-task-list.plugin-tasks-query-result {
  margin-top: 4px !important;
  margin-bottom: -6px !important; 
  padding-top: 0px !important;
  border-top: none !important;/* 确保没有上边框挤占空间 */
}

/* 3. 针对列表项进行微调，确保第一项不自带间距 */
.contains-task-list.plugin-tasks-query-result li.task-list-item {
  margin-top: 0px !important;
  padding-top: 0px !important;
}



   /***************************************************************
   * 3. 优先级颜色映射
   * 根据任务的优先级，改变复选框（打勾框）的边框颜色，而不显示原始的优先级符号。
   ****************************************************************/
  
.task-list-item[data-task-priority="highest"] input[type=checkbox]:not(:checked) {
    box-shadow: 0px 0px 1px 1px var(--color-purple);
    border-color: var(--color-purple);
}

.task-list-item[data-task-priority="high"] input[type=checkbox]:not(:checked) {
    box-shadow: 0px 0px 1px 1px var(--color-red);
    border-color: var(--color-red);
}

.task-list-item[data-task-priority="medium"] input[type=checkbox]:not(:checked) {
    box-shadow: 0px 0px 1px 1px var(--color-orange);
    border-color: var(--color-orange);
}

.task-list-item[data-task-priority="normal"] input[type=checkbox]:not(:checked) {
    box-shadow: 0px 0px 1px 1px var(--color-blue);
    border-color: var(--color-blue);
}

.task-list-item[data-task-priority="low"] input[type=checkbox]:not(:checked) {
    box-shadow: 0px 0px 1px 1px var(--color-cyan);
    border-color: var(--color-cyan);
}

.task-list-item[data-task-priority="lowest"] input[type=checkbox]:not(:checked) {
    box-shadow: 0px 0px 1px 1px var(--color-green);
    border-color: var(--color-green);
}

/* This part removes the regular priority emoticon */
span.task-priority {
    display: none;
}


  /* Fix hover issues with Border theme */

  .task-extras {
    --background-modifier-hover: transparent !important;/* 悬停背景变透明 */
    --link-decoration-hover: none !important;/* 悬停时取消链接下划线 */
  }


  /* Allow .tasks-list-text to shrink and take up remaining space responsively */

   /**************************
   * 4. 布局微调
   ***************************/
  /*外部容器设置：每一行任务的最外层“盒子”。*/
  .plugin-tasks-list-item {
    display: flex;/* 使用弹性盒子布局,让复选框、文字、图标能像排队一样横向排列。 */
    align-items: center;/* 垂直居中对齐 */
    /*border-bottom: var(--hr-thickness) solid;*/
    /*border-color: var(--hr-color);*/
    /*border-bottom: 1px solid transparent;*/
    /*margin-bottom: 2px !important;*/
    padding: 0px !important;
    line-height: 1;
  }
    
    /*复选框定位*/
    .task-list-item-checkbox {
      position: absolute !important; /*绝对定位。这会让复选框脱离常规的文档流，像贴纸一样贴在指定位置，不影响其他元素的排列。*/
      top: 32%; /* 复选框距离父元素顶部的距离 */
      transform: translateY(calc(-50% - var(--hr-thickness) / 2));/*配合 top 属性，位移修正。translateY(-50%) 是让物体向上移动自身高度的一半。*/
    }

    /*任务内容区域：包裹任务文字和后面日期图标的容器。*/
    .tasks-list-text {
      display: inline-flex;
      flex: 1;/* 自动拉伸占满剩余空间 */
      line-height: 1rem;

      /* 任务文本描述：如果太长就显示省略号，不换行 */
      .task-description {
        contain: inline-size;
        flex: 1 !important;/*确保文字部分占据尽可能多的空间。*/
        text-wrap: nowrap;/*强制不换行*/
        overflow: hidden;/*超出的文字直接隐藏掉，不溢出到屏幕外面。*/
        /* 重点：在文字末尾做一个渐变消失的效果 */
        mask-image: linear-gradient(to left, transparent, black 2rem);
      }

      /* --- 添加悬停显示效果 --- */
      .task-description:hover {
        text-wrap: normal !important; /* 覆盖之前的 nowrap */
        white-space: normal !important;
        overflow: visible !important;
        mask-image: none !important; /* 展开时取消遮罩渐变 */
        position: relative;
        z-index: 10; /* 确保展开的内容不被遮挡 */
      }      
      

      /*弹出框配置*/
      .tooltip.pop-up {
        position: absolute;
        left: unset;/*取消左侧对齐。*/
        right: 0%;/*右侧对齐。让气泡的右边缘与任务项的右边缘对齐。*/
        transform: translate(-0.4em, calc(-100% - var(--hr-thickness) - 2px - 1px)) !important;/*4em：让气泡向右偏移一段距离；calc(-100% - ...)：通过计算让气泡向上移动，使其正好出现在任务文字的上方。它减去了行高、边框厚度以及 5px 的额外间距，确保气泡不会挡住任务文字。*/
        width: fit-content;/*宽度自适应。根据里面的文字多少自动调整气泡宽度*/
        max-width: calc(100% - 1em); /* 防止极端情况下仍然溢出 */
        box-sizing: border-box;      /* 边框计入宽度 */

        /*气泡的小尖角：通过画一个只有边框的三角形，模拟出气泡下方那个指向任务的小尖角。*/
        ::after {
          position: absolute;
          top: 100%;
          left: 50%;
          width: 0;
          margin-left: -5px;
          border-top: 5px solid var(--background-modifier-message);
          border-right: 5px solid transparent;
          border-left: 5px solid transparent;
          content: " ";
          font-size: 0;
          line-height: 0;
        }

      }
    }


    .task-extras {
      margin: 0px !important;

      a,
      span {
        width: fit-content;
        height: fit-content;
        margin: 0px;
      }
    }
  }
}

/* 针对你之前提到的那个 p 标签标题，加入这一行 */
/* 确保它只在任务块后面出现时才收缩 */
.block-language-tasks + p, 
.block-language-tasks + .cm-line {
  margin-top: -18px !important; /* 物理性地把下方的链接拉上来 */
}

/* 修正日期选择器（Flatpickr）在不同设备上的偏移位置 */
.flatpickr-calendar {
  margin-left: -0.5rem;
}

.is-ios {
  .flatpickr-calendar {
    margin-left: -1.5rem;
  }

  .block-language-tasks {

    .task-id,
    .task-dependsOn,
    .task-priority,
    .task-recurring,
    .task-created,
    .task-start,
    .task-scheduled,
    .task-done,
    .task-cancelled,
    .task-due,
    .tasks-postpone,
    .tasks-backlink,
    .tasks-edit,
    .suggestion-container .suggestion {
      margin-top: -3px !important;
    }

    span.task-extras {
      margin-top: -2px !important;

    }
  }
}

```
</details>

## 更多资源
- [其它Obsidian样式和脚本代码](https://github.com/ichris007/obsidian-share-showcase) 
