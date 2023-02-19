export interface Suffix {
  option: 'SHORT' | 'UNGUESSABLE';
}

export interface SocialMetaTagInfo {
  socialTitle?: string;
  socialDescription?: string;
  socialImageLink?: string;
}

export interface IosInfo {
  iosBundleId: string;
  iosFallBackLink: string;
}

export interface AndroidInfo {
  androidPackageName: string;
  androidFallBackLink: string;
}

export interface DynamicLinkInfo {
  domainUriPrefix: string;
  link: string;
  androidInfo?: AndroidInfo;
  iosInfo?: IosInfo;
  socialMetaTagInfo?: SocialMetaTagInfo;
}

export interface ShortLinkRequestBody {
  longDynamicLink?: string;
  dynamicLinkInfo?: DynamicLinkInfo;
  suffix?: Suffix;
}

export interface ShortLinkResponse {
  shortLink: string;
  previewLink: string;
}
