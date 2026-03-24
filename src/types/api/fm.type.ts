/**
 * 个人 FM 响应数据
 */
export interface FMResponse {
  popAdjust: boolean;
  data: FMTrack[];
  tag: string | null;
  extTransMap: Record<string, any>;
  code: number;
}

/**
 * FM 歌曲项
 */
export interface FMTrack {
  name: string;
  id: number;
  position: number;
  alias: string[];
  status: number;
  fee: number;
  copyrightId: number;
  disc: string;
  no: number;
  artists: Artist[];
  album: Album;
  starred: boolean;
  popularity: number;
  score: number;
  starredNum: number;
  duration: number;
  playedNum: number;
  dayPlays: number;
  hearTime: number;
  ringtone: string | null;
  crbt: any;
  audition: any;
  copyFrom: string;
  commentThreadId: string;
  rtUrl: string | null;
  ftype: number;
  rtUrls: any[];
  copyright: number;
  transName: string | null;
  sign: any;
  hMusic: MusicInfo | null;
  mMusic: MusicInfo | null;
  lMusic: MusicInfo | null;
  bMusic: MusicInfo | null;
  mvid: number;
  mp3Url: string | null;
  privilege: Privilege;
  alg: string;
}

/**
 * 歌手信息
 */
export interface Artist {
  name: string;
  id: number;
  picId: number;
  img1v1Id: number;
  briefDesc: string;
  picUrl: string;
  img1v1Url: string;
  albumSize: number;
  alias: string[];
  trans: string;
  musicSize: number;
}

/**
 * 专辑信息
 */
export interface Album {
  name: string;
  id: number;
  type: string;
  size: number;
  picId: number;
  blurPicUrl: string;
  companyId: number;
  pic: number;
  picUrl: string;
  publishTime: number;
  description: string;
  tags: string;
  company: string | null;
  briefDesc: string;
  artist: Artist;
  songs: any[];
  alias: string[];
  status: number;
  copyrightId: number;
  commentThreadId: string;
  artists: Artist[];
  subType: string;
  transName: string | null;
  picId_str: string;
}

/**
 * 音轨详情
 */
export interface MusicInfo {
  name: string | null;
  id: number;
  size: number;
  extension: string;
  sr: number;
  dfsId: number;
  bitrate: number;
  playTime: number;
  volumeDelta: number;
}

/**
 * 播放权限信息
 */
export interface Privilege {
  id: number;
  fee: number;
  payed: number;
  realPayed: number;
  st: number;
  pl: number;
  dl: number;
  sp: number;
  cp: number;
  subp: number;
  cs: boolean;
  maxbr: number;
  fl: number;
  pc: any;
  toast: boolean;
  flag: number;
  paidBigBang: boolean;
  preSell: boolean;
  playMaxbr: number;
  downloadMaxbr: number;
  maxBrLevel: string;
  playMaxBrLevel: string;
  downloadMaxBrLevel: string;
  plLevel: string;
  dlLevel: string;
  flLevel: string;
  rscl: any;
  freeTrialPrivilege: FreeTrialPrivilege;
  rightSource: number;
  chargeInfoList: ChargeInfo[];
  code: number;
  message: string | null;
  plLevels: string[] | null;
  dlLevels: string[] | null;
  ignoreCache: boolean | null;
  bd: any;
}

/**
 * 试听权限
 */
export interface FreeTrialPrivilege {
  resConsumable: boolean;
  userConsumable: boolean;
  listenType: any;
  cannotListenReason: any;
  playReason: any;
  freeLimitTagType: any;
}

/**
 * 收费信息
 */
export interface ChargeInfo {
  rate: number;
  chargeUrl: string | null;
  chargeMessage: string | null;
  chargeType: number;
}