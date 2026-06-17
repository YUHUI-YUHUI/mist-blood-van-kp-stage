# 雾中献血车 KP 舞台与素材库

这是《雾中献血车》前置模组的带团素材仓库，包含 KP 舞台网页、模组文档、玩家手卡、NPC 立绘、场景背景图和结局/氛围素材。

## 在线舞台

仓库根目录的 `index.html` 会跳转到：

```text
kp-site/index.html
```

如果开启 GitHub Pages，可以直接把仓库根目录作为 Pages 来源。

## 本地预览

```bash
python3 -m http.server 8791 --bind 127.0.0.1
```

然后打开：

```text
http://127.0.0.1:8791/kp-site/index.html
```

## 目录

```text
kp-site/                  KP 舞台网页
assets/                   模组图片素材
assets/handouts/prequel/  玩家手卡、KP 追踪板、素材总览
assets/npc/prequel/       前置本 NPC 立绘
assets/locations/         场景背景图
docs/                     模组正文与带团素材包 PDF/Markdown
```

## 使用说明

- 左侧点击“地点”会切换舞台背景。
- 左侧点击“NPC”会把 NPC 立绘显示在舞台左侧。
- 左侧点击“素材”会把手卡、证物图或 KP 速查图浮现在背景上。
- 左侧点击“玩家”可在右侧显示玩家席位。

## 文档

- `docs/雾中献血车.md`
- `docs/雾中献血车.pdf`
- `docs/雾中献血车_带团素材包.md`
- `docs/雾中献血车_带团素材包.pdf`
