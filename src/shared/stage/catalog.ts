import type { LocationItem, MaterialItem, NpcItem } from "../types";

export interface StageLocation extends LocationItem {
  background: string;
}

export interface StageNpc extends NpcItem {
  initial: string;
  portrait: string;
}

export interface StageMaterial extends MaterialItem {
  image: string;
}

function mapById<T extends { id: string }>(items: T[]): Record<string, T> {
  return Object.fromEntries(items.map((item) => [item.id, item])) as Record<string, T>;
}

export const publicStageLocations: StageLocation[] = [
  {
    id: "campus",
    name: "校园献血点",
    background: "/assets/locations/oxford-campus-bg.png",
  },
  {
    id: "tent",
    name: "临时医务帐篷",
    background: "/assets/radcliffe-infirmary-exterior.png",
  },
  {
    id: "alley",
    name: "医学楼后巷",
    background: "/assets/radcliffe-infirmary-exterior.png",
  },
  {
    id: "boathouse",
    name: "河边旧艇库",
    background: "/assets/locations/thames-river-bay-bg.png",
  },
  {
    id: "aftermath",
    name: "余波与接入正篇",
    background: "/assets/locations/charlotte-apartment-bg.png",
  },
];

export const publicStageNpcs: StageNpc[] = [
  {
    id: "henry",
    name: "Henry Lane",
    initial: "H",
    portrait: "/assets/npc/prequel/henry-lane.png",
  },
  {
    id: "amy",
    name: "艾米·贝尔",
    initial: "A",
    portrait: "/assets/npc/prequel/amy-bell.png",
  },
  {
    id: "peter",
    name: "彼得·周",
    initial: "周",
    portrait: "/assets/npc/prequel/peter-zhou.png",
  },
  {
    id: "green",
    name: "安保格林",
    initial: "G",
    portrait: "/assets/npc/prequel/security-green.png",
  },
  {
    id: "yuhui",
    name: "余辉",
    initial: "余",
    portrait: "/assets/npc/prequel/yu-hui.png",
  },
];

export const publicStageMaterials: StageMaterial[] = [
  {
    id: "blood-drive-flyer",
    name: "献血活动传单",
    image: "/assets/handouts/prequel/handout-01-blood-drive-flyer.png",
  },
  {
    id: "henry-donor-card",
    name: "Henry 登记卡",
    image: "/assets/handouts/prequel/handout-02-henry-donor-card.png",
  },
  {
    id: "rescreen-list",
    name: "复筛名单截屏",
    image: "/assets/handouts/prequel/handout-03-rescreen-list.png",
  },
  {
    id: "transfer-order",
    name: "R-13 转运单",
    image: "/assets/handouts/prequel/handout-04-transfer-order.png",
  },
  {
    id: "silver-label",
    name: "V-RH null 标签",
    image: "/assets/handouts/prequel/handout-05-silver-label.png",
  },
  {
    id: "dashcam-summary",
    name: "车载记录摘要",
    image: "/assets/handouts/prequel/handout-06-dashcam-summary.png",
  },
  {
    id: "school-notice",
    name: "校方事故通报",
    image: "/assets/handouts/prequel/handout-07-school-notice.png",
  },
  {
    id: "yuhui-email",
    name: "余辉邮件",
    image: "/assets/handouts/prequel/handout-08-yuhui-email.png",
  },
];

export const publicStageLocationById = mapById(publicStageLocations);
export const publicStageNpcById = mapById(publicStageNpcs);
export const publicStageMaterialById = mapById(publicStageMaterials);
