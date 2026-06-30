import type { LocationItem, MaterialItem, NpcItem } from "../types";

export interface StageLocation extends LocationItem {
  background: string;
  beats: string[];
  goal: string;
  read: string;
  time: string;
  mood: string;
}

export interface StageNpc extends NpcItem {
  initial: string;
  note: string;
  portrait: string;
  role: string;
}

export interface StageMaterial extends MaterialItem {
  image: string;
  note: string;
  role: string;
}

export interface StagePlayer {
  description: string;
  id: string;
  initial: string;
  name: string;
  role: string;
}

function mapById<T extends { id: string }>(items: T[]): Record<string, T> {
  return Object.fromEntries(items.map((item) => [item.id, item])) as Record<string, T>;
}

export const stageLocations: StageLocation[] = [
  {
    id: "campus",
    name: "校园献血点",
    time: "19:10",
    mood: "雨后石板、白色献血帐篷、短暂停电",
    background: "/assets/locations/oxford-campus-bg.png",
    goal: "让调查员确认 Henry Lane 失踪不是误会，并锁定提前撤离的献血车。",
    read:
      "学院中庭的石板还湿着，临时献血帐篷里有热茶和消毒水味。灯光短暂熄灭又亮起时，刚刚说冷藏箱里有声音的 Henry Lane 不见了。R-13 冷藏箱外壳裂开一道白缝，献血车正在收线。",
    beats: [
      "登记桌、采血区、休息长椅、冷藏箱四处可以分头搜。",
      "医院工作人员声称 Henry Lane 低血糖，被送去休息。",
      "彼得·周能提供登记表和 Henry Lane 最后位置。",
      "冷藏箱内侧有白色黏液和海腥味。",
    ],
  },
  {
    id: "tent",
    name: "临时医务帐篷",
    time: "19:35",
    mood: "折叠床、标签打印机、未锁屏电脑",
    background: "/assets/radcliffe-infirmary-exterior.png",
    goal: "让调查员与艾米交涉，并拿到第一个明确关键词 V-RH null。",
    read:
      "医务帐篷里的采血包还没有收完，标签打印机吐出半截纸条。笔记本屏幕停在拉德克里夫医院内网页面，最后三行名单被红色标记。艾米·贝尔的手按在合页文件夹上，指节发白。",
    beats: [
      "艾米先否认，只承认自己负责抽血。",
      "承诺优先救 Henry Lane，她会说出冷藏箱里像有婴儿哭声。",
      "电脑不是唯一通路，标签残片和转运单可在桌面或垃圾袋里找到。",
    ],
  },
  {
    id: "alley",
    name: "医学楼后巷",
    time: "20:05",
    mood: "卸货口、半开车门、河泥拖痕",
    background: "/assets/radcliffe-infirmary-exterior.png",
    goal: "把调查从社交转入惊悚，让玩家第一次看到怪物痕迹。",
    read:
      "医学楼后巷没有学生，只有冷藏车尾灯照着湿墙。车厢后门半开，R-13 倒在里面，箱盖被从内侧顶裂。格林压低声音讲电话：不是样本，是活的。它往旧艇库去了。",
    beats: [
      "可潜行拍下冷藏箱、血迹和拖痕。",
      "可与格林对峙，逼他交出车载记录仪。",
      "车内昏迷司机醒后会说箱子里伸出一条白色胳膊。",
    ],
  },
  {
    id: "boathouse",
    name: "河边旧艇库",
    time: "20:30",
    mood: "旧桨架、翻倒木艇、白色黏丝",
    background: "/assets/locations/thames-river-bay-bg.png",
    goal: "救出 Henry Lane，与温莎幼体战斗，并完成短团收束。",
    read:
      "旧艇库里没有灯，只有河面反光从木板缝间晃进来。翻倒的木艇下传来很轻的敲击声，三下，停顿，又三下。手电光照到白色黏丝时，它像活着的网一样收缩。",
    beats: [
      "旧桨架可推倒，让幼体本轮闪避吃惩罚骰。",
      "救生衣柜可抵消一次幼体扑咬的奖励骰。",
      "便携 UV 灯能让幼体攻击检定受惩罚骰 3 轮。",
    ],
  },
  {
    id: "aftermath",
    name: "余波与接入正篇",
    time: "23:30",
    mood: "删改病历、封口电话、延迟邮件",
    background: "/assets/locations/charlotte-apartment-bg.png",
    goal: "结算证据去向，决定 Henry Lane 和幼体的后续状态，并接到 10 月 21 日正篇。",
    read:
      "午夜前，校方把事情称为学生低血糖引发的设备事故。医院要求接手 Henry Lane，安保要求删除照片。几个小时后，余辉听说你们见过 R-13 冷藏箱，开始主动寻找你们。",
    beats: [
      "干净胜利：Henry Lane 获救，幼体被杀，证据保留。",
      "留下后患：Henry Lane 获救，幼体逃入河湾。",
      "被迫沉默：医院抢走 Henry Lane 或证据，只留下残片。",
    ],
  },
];

export const stageNpcs: StageNpc[] = [
  {
    id: "henry",
    name: "Henry Lane",
    initial: "H",
    portrait: "/assets/npc/prequel/henry-lane.png",
    role: "失踪学生",
    note: "被复筛名单标红，知道冷藏箱里有东西。",
  },
  {
    id: "amy",
    name: "艾米·贝尔",
    initial: "A",
    portrait: "/assets/npc/prequel/amy-bell.png",
    role: "夜班护士",
    note: "害怕医院安保，可被真诚关心打动。",
  },
  {
    id: "peter",
    name: "彼得·周",
    initial: "周",
    portrait: "/assets/npc/prequel/peter-zhou.png",
    role: "校园志愿者",
    note: "能提供登记表、时间线和献血车去向。",
  },
  {
    id: "green",
    name: "安保格林",
    initial: "G",
    portrait: "/assets/npc/prequel/security-green.png",
    role: "医院外包安保",
    note: "负责带走冷藏箱并封口，遇怪会逃。",
  },
  {
    id: "yuhui",
    name: "余辉",
    initial: "余",
    portrait: "/assets/npc/prequel/yu-hui.png",
    role: "学生调查者",
    note: "暗中记录献血异常，可把短团接到正篇。",
  },
];

export const publicStageMaterials: StageMaterial[] = [
  {
    id: "blood-drive-flyer",
    name: "献血活动传单",
    image: "/assets/handouts/prequel/handout-01-blood-drive-flyer.png",
    role: "玩家手卡 1",
    note: "开场前或初到校园献血点时展示。",
  },
  {
    id: "henry-donor-card",
    name: "Henry 登记卡",
    image: "/assets/handouts/prequel/handout-02-henry-donor-card.png",
    role: "玩家手卡 2",
    note: "Henry 失踪后搜登记桌获得。",
  },
  {
    id: "rescreen-list",
    name: "复筛名单截屏",
    image: "/assets/handouts/prequel/handout-03-rescreen-list.png",
    role: "玩家手卡 3",
    note: "医务帐篷电脑或艾米帮助后读取。",
  },
  {
    id: "transfer-order",
    name: "R-13 转运单",
    image: "/assets/handouts/prequel/handout-04-transfer-order.png",
    role: "玩家手卡 4",
    note: "医务帐篷垃圾袋或接驳单夹获得。",
  },
  {
    id: "silver-label",
    name: "V-RH null 标签",
    image: "/assets/handouts/prequel/handout-05-silver-label.png",
    role: "玩家手卡 5",
    note: "标签打印机或血样样本上发现。",
  },
  {
    id: "dashcam-summary",
    name: "车载记录摘要",
    image: "/assets/handouts/prequel/handout-06-dashcam-summary.png",
    role: "玩家手卡 6",
    note: "医学楼后巷车内取出损坏记录仪。",
  },
  {
    id: "school-notice",
    name: "校方事故通报",
    image: "/assets/handouts/prequel/handout-07-school-notice.png",
    role: "玩家手卡 7",
    note: "余波阶段或官方封口时展示。",
  },
  {
    id: "yuhui-email",
    name: "余辉邮件",
    image: "/assets/handouts/prequel/handout-08-yuhui-email.png",
    role: "玩家手卡 8",
    note: "接入正篇时展示。",
  },
];

export const stageMaterials: StageMaterial[] = [
  ...publicStageMaterials,
  {
    id: "kp-tracker",
    name: "KP 追踪板",
    role: "KP 专用",
    note: "记录时间线、警觉等级、Henry 状态和关键线索。",
    image: "/assets/handouts/prequel/kp-tracker.png",
  },
  {
    id: "npc-roster",
    name: "NPC 速查板",
    role: "KP 专用",
    note: "快速确认 NPC 动机、目标和第一句话。",
    image: "/assets/handouts/prequel/npc-roster.png",
  },
  {
    id: "handout-contact-sheet",
    name: "手卡总览",
    role: "KP 专用",
    note: "开团前检查玩家可见证物是否齐全。",
    image: "/assets/handouts/prequel/contact-sheet-handouts.png",
  },
];

export const stagePlayers: StagePlayer[] = [
  {
    id: "p1",
    name: "调查员一",
    role: "玩家席位",
    initial: "1",
    description: "右侧玩家席位，可用于标记当前在场调查员。",
  },
  {
    id: "p2",
    name: "调查员二",
    role: "玩家席位",
    initial: "2",
    description: "右侧玩家席位，可用于标记当前在场调查员。",
  },
  {
    id: "p3",
    name: "调查员三",
    role: "玩家席位",
    initial: "3",
    description: "右侧玩家席位，可用于标记当前在场调查员。",
  },
  {
    id: "p4",
    name: "调查员四",
    role: "玩家席位",
    initial: "4",
    description: "右侧玩家席位，可用于标记当前在场调查员。",
  },
];

export const stageLocationById = mapById(stageLocations);
export const stageNpcById = mapById(stageNpcs);
export const stageMaterialById = mapById(stageMaterials);
export const stagePlayerById = mapById(stagePlayers);

export const publicStageLocations = stageLocations;
export const publicStageNpcs = stageNpcs;
export const publicStageLocationById = stageLocationById;
export const publicStageNpcById = stageNpcById;
export const publicStageMaterialById = mapById(publicStageMaterials);
