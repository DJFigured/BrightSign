const BASE_URL = "https://www.brightsign.biz"

export interface FamilyUrlEntry {
  /** Family code used as identifier, e.g. "hd6" */
  familyCode: string
  /** Series number */
  series: string
  /** URL path to the family page */
  path: string
  /** Expected model numbers on this page */
  expectedModels: string[]
}

/** All known product family URLs on brightsign.biz */
export const FAMILY_URLS: FamilyUrlEntry[] = [
  // ── Series 6 ──
  {
    familyCode: "hd6",
    series: "6",
    path: "/brightsign-players/series-6/hd6/",
    expectedModels: ["HD226", "HD1026"],
  },
  {
    familyCode: "xd6",
    series: "6",
    path: "/brightsign-players/series-6/xd6/",
    expectedModels: ["XD236", "XD1036"],
  },
  // NOTE: XT6, XC6, LS6, AU6 not yet published on brightsign.biz (as of 2026-02)
  // Uncomment when pages become available:
  // { familyCode: "xt6", series: "6", path: "/brightsign-players/series-6/xt6/", expectedModels: ["XT246", "XT1146", "XT2146"] },
  // { familyCode: "xc6", series: "6", path: "/brightsign-players/series-6/xc6/", expectedModels: ["XC2056", "XC4056"] },
  // { familyCode: "ls6", series: "6", path: "/brightsign-players/series-6/ls6/", expectedModels: ["LS426", "LS446"] },
  // { familyCode: "au6", series: "6", path: "/brightsign-players/series-6/au6/", expectedModels: ["AU336"] },
  // ── Series 5 ──
  {
    familyCode: "hd5",
    series: "5",
    path: "/brightsign-players/series-5/hd5/",
    expectedModels: ["HD225", "HD1025"],
  },
  {
    familyCode: "xd5",
    series: "5",
    path: "/brightsign-players/series-5/xd5/",
    expectedModels: ["XD235", "XD1035"],
  },
  {
    familyCode: "xt5",
    series: "5",
    path: "/brightsign-players/series-5/xt5/",
    expectedModels: ["XT245", "XT1145", "XT2145"],
  },
  {
    familyCode: "xc5",
    series: "5",
    path: "/brightsign-players/series-5/xc5/",
    expectedModels: ["XC2055", "XC4055"],
  },
  {
    familyCode: "ls5",
    series: "5",
    path: "/brightsign-players/series-5/ls5/",
    expectedModels: ["LS425", "LS445"],
  },
  {
    familyCode: "au5",
    series: "5",
    path: "/brightsign-players/series-5/au5/",
    expectedModels: ["AU335"],
  },
]

/** Series overview page URLs */
export const SERIES_URLS: Record<string, string> = {
  "6": "/brightsign-players/series-6/",
  "5": "/brightsign-players/series-5/",
  "4": "/brightsign-players/series-4/",
}

export function getFullUrl(path: string): string {
  return `${BASE_URL}${path}`
}

export function getFamiliesBySeries(series: string): FamilyUrlEntry[] {
  return FAMILY_URLS.filter((f) => f.series === series)
}

export function getFamilyByCode(code: string): FamilyUrlEntry | undefined {
  return FAMILY_URLS.find((f) => f.familyCode === code)
}
