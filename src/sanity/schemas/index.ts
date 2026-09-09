import { coach } from "./coach";
import { course } from "./course";
import { companyPage, programDocument } from "./companyPage";
import { homePage } from "./homePage";
import { siteSettings } from "./siteSettings";
import { pageSeo } from "./pageSeo";
import { marketingObjectTypes } from "./objects/marketingPrimitives";
import { marketingSectionTypes } from "./objects/marketingSections";
import { localePortableText } from "./objects/localePortableText";
import { localeString } from "./objects/localeString";
import { localeStringArray } from "./objects/localeStringArray";
import { localeText } from "./objects/localeText";

export const schemaTypes = [
  localeString,
  localeText,
  localePortableText,
  localeStringArray,
  ...marketingObjectTypes,
  ...marketingSectionTypes,
  coach,
  course,
  homePage,
  siteSettings,
  pageSeo,
  companyPage,
  programDocument,
];
