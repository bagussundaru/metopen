/**
 * Scopus Official Query Formatter & Elsevier Scopus Search Client
 * Aligns literature search directly with Scopus Documents Search standard
 * Focuses on peer-reviewed scientific articles (ar) & bibliometric reviews (re)
 */

import { parseAndExpandBooleanQuery } from "./boolean-query";
import { DiscoveredArticle } from "./openalex-parser";

export interface ScopusQueryConfig {
  docTypes?: Array<"ar" | "re" | "cp">; // ar = Article, re = Review, cp = Conference Paper
  minYear?: number;
  exactPhrase?: boolean;
}

export interface OfficialScopusQuery {
  scopusQuery: string;
  webUrl: string;
  explanation: string;
}

/**
 * Builds an official Scopus Search query string compatible with Scopus.com Documents Search
 * Example output: TITLE-ABS-KEY(("occupational safety" OR "workplace safety") AND "data center") AND DOCTYPE(ar OR re) AND PUBYEAR > 2019
 */
export function buildOfficialScopusQuery(
  rawQuery: string,
  config: ScopusQueryConfig = {}
): OfficialScopusQuery {
  const parsed = parseAndExpandBooleanQuery(rawQuery);
  const baseBoolean = parsed.booleanQuery || rawQuery;

  // Wrap base concepts in TITLE-ABS-KEY(...)
  let scopusQuery = `TITLE-ABS-KEY(${baseBoolean})`;

  // Filter Document Types: default to Articles (ar) and Reviews (re)
  const docTypes = config.docTypes && config.docTypes.length > 0 ? config.docTypes : ["ar", "re"];
  const docTypeClause = `DOCTYPE(${docTypes.join(" OR ")})`;
  scopusQuery += ` AND ${docTypeClause}`;

  // Filter Publication Year (e.g. recent 5-6 years for thesis novelty)
  if (config.minYear && config.minYear > 1990) {
    scopusQuery += ` AND PUBYEAR > ${config.minYear - 1}`;
  }

  // Official Scopus Web Search URL
  const webUrl = `https://www.scopus.com/results/results.uri?src=s&sot=b&sdt=b&origin=searchbasic&searchterm1=${encodeURIComponent(
    scopusQuery
  )}`;

  return {
    scopusQuery,
    webUrl,
    explanation: `Kueri resmi Scopus Document Search mencakup pencarian pada Judul, Abstrak, dan Kata Kunci (TITLE-ABS-KEY) dengan filter dokumen Artikel Ilmiah & Review (${docTypes.join(", ").toUpperCase()}).`,
  };
}

/**
 * Format reference according to Scopus APA 7th Edition style
 */
export function formatScopusCitation(art: DiscoveredArticle): string {
  const authors = art.authors || "Anonim";
  const year = art.year || new Date().getFullYear();
  const title = art.title.endsWith(".") ? art.title : `${art.title}.`;
  const journal = art.journal || "Scopus Indexed Journal";
  const volIssue = art.volume ? (art.issue ? `, ${art.volume}(${art.issue})` : `, ${art.volume}`) : "";
  const pages = art.pages ? `, ${art.pages}` : "";
  const doiStr = art.doi ? ` https://doi.org/${art.doi.replace(/^https?:\/\/doi\.org\//, "")}` : "";

  return `${authors} (${year}). ${title} ${journal}${volIssue}${pages}.${doiStr}`;
}

interface ElsevierEntry {
  "dc:identifier"?: string;
  "dc:title"?: string;
  "dc:creator"?: string;
  "prism:coverDate"?: string;
  "prism:publicationName"?: string;
  "prism:doi"?: string;
  "prism:volume"?: string;
  "prism:issueIdentifier"?: string;
  "prism:pageRange"?: string;
  "citedby-count"?: string;
  subtypeDescription?: string;
  openaccessFlag?: boolean;
  authkeywords?: string;
}

/**
 * Optional Direct Elsevier Scopus Search API caller
 * Used when user or institution provides an Elsevier Developer API Key
 */
export async function fetchElsevierScopusApi(
  query: string,
  apiKey: string,
  limit: number = 30
): Promise<DiscoveredArticle[]> {
  const official = buildOfficialScopusQuery(query);
  const scopusQuery = official.scopusQuery;

  const url = `https://api.elsevier.com/content/search/scopus?query=${encodeURIComponent(
    scopusQuery
  )}&count=${Math.min(limit, 25)}&apiKey=${apiKey}&httpAccept=application/json`;

  const res = await fetch(url, {
    headers: {
      "X-ELS-APIKey": apiKey,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Elsevier Scopus API Error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  const entries: ElsevierEntry[] = json["search-results"]?.entry || [];

  return entries.map((e: ElsevierEntry, index: number) => {
    const title = e["dc:title"] || "Untitled Scopus Document";
    const authors = e["dc:creator"] || "Scopus Researcher";
    const coverDate = e["prism:coverDate"] || "2024-01-01";
    const year = parseInt(coverDate.substring(0, 4), 10) || 2024;
    const journal = e["prism:publicationName"] || "Scopus Indexed Journal";
    const doi = e["prism:doi"];
    const citedByCount = parseInt(e["citedby-count"] || "0", 10) || 0;
    const subtype = (e["subtypeDescription"] || "").toLowerCase();
    const isReview = subtype.includes("review") || /review|bibliometric|systematic/i.test(title);

    const rawKeywords = (e["authkeywords"] || "")
      .split("|")
      .map((k: string) => k.trim())
      .filter(Boolean);

    return {
      id: e["dc:identifier"] || `scopus-${index}-${Date.now()}`,
      title,
      authors,
      year,
      journal,
      doi,
      citedByCount,
      keywords: rawKeywords,
      docType: isReview ? "review" : "article",
      isOpenAccess: Boolean(e["openaccessFlag"]),
      scopusIndexed: true,
      scopusUrl: doi
        ? `https://www.scopus.com/record/display.uri?origin=recordpage&doi=${encodeURIComponent(doi)}`
        : undefined,
      volume: e["prism:volume"],
      issue: e["prism:issueIdentifier"],
      pages: e["prism:pageRange"],
    };
  });
}
