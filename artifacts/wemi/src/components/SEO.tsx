import { useEffect } from "react";
import { useLocation } from "wouter";

export const SITE_URL = (
  import.meta.env.VITE_SITE_URL || "https://wemecareer.com"
).replace(/\/+$/, "");

const DEFAULT_DESCRIPTION =
  "위미는 인문계열 전공자를 위한 진로·취업 플랫폼입니다. 직무 학습, 졸업생 멘토링, 인문학 콘텐츠와 창작 공간을 만나보세요.";

type SeoType = "website" | "article";

export interface SeoProps {
  title: string;
  description: string;
  canonicalPath?: string;
  imagePath?: string;
  type?: SeoType;
  robots?: string;
  structuredData?: Record<string, unknown>;
}

function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}/${path.replace(/^\/+/, "")}`.replace(/\/$/, "") || SITE_URL;
}

function setMeta(attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`,
  );
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function setCanonical(href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  );
  if (!element) {
    element = document.createElement("link");
    element.rel = "canonical";
    document.head.appendChild(element);
  }
  element.href = href;
}

export function SEO({
  title,
  description,
  canonicalPath,
  imagePath = "/opengraph.jpg",
  type = "website",
  robots = "index, follow",
  structuredData,
}: SeoProps) {
  useEffect(() => {
    const path = canonicalPath ?? window.location.pathname;
    const canonicalUrl = absoluteUrl(path);
    const imageUrl = absoluteUrl(imagePath);

    document.title = title;
    document.documentElement.lang = "ko";
    setMeta("name", "description", description);
    setMeta("name", "robots", robots);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", canonicalUrl);
    setMeta("property", "og:type", type);
    setMeta("property", "og:image", imageUrl);
    setMeta("property", "og:site_name", "위미");
    setMeta("property", "og:locale", "ko_KR");
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", imageUrl);
    setCanonical(canonicalUrl);

    let jsonLd = document.head.querySelector<HTMLScriptElement>(
      "#wemi-jsonld",
    );
    if (!jsonLd) {
      jsonLd = document.createElement("script");
      jsonLd.id = "wemi-jsonld";
      jsonLd.type = "application/ld+json";
      document.head.appendChild(jsonLd);
    }
    jsonLd.textContent = JSON.stringify(
      structuredData ?? {
        "@context": "https://schema.org",
        "@type": type === "article" ? "Article" : "WebSite",
        name: title,
        description,
        url: canonicalUrl,
        image: imageUrl,
        inLanguage: "ko-KR",
        publisher: {
          "@type": "Organization",
          name: "위미",
          url: SITE_URL,
        },
      },
    );
  }, [
    canonicalPath,
    description,
    imagePath,
    robots,
    structuredData,
    title,
    type,
  ]);

  return null;
}

interface RouteSeo {
  title: string;
  description: string;
  robots?: string;
}

function routeSeo(pathname: string): RouteSeo {
  const path = pathname.replace(/\/+$/, "") || "/";

  if (path === "/") {
    return {
      title: "위미 | 인문계열 진로·취업 플랫폼",
      description: DEFAULT_DESCRIPTION,
    };
  }
  if (path === "/about") {
    return {
      title: "위미 소개 | 인문계열 진로·취업 플랫폼",
      description:
        "인문계열 전공자의 취업과 진로를 함께 고민하는 위미를 소개합니다. 위미의 가치와 주요 기능을 확인해 보세요.",
    };
  }
  if (path === "/jobs") {
    return {
      title: "인문계열 직무 학습 | 위미",
      description:
        "인문계열 전공자가 선택할 수 있는 다양한 직무와 실무 학습 내용을 살펴보세요. 진로 탐색에 필요한 정보를 모았습니다.",
    };
  }
  if (/^\/jobs\/[^/]+$/.test(path)) {
    return {
      title: `직무 상세 정보 | 위미`,
      description:
        "인문계열 전공자를 위한 직무의 역할, 필요한 역량과 학습 내용을 자세히 확인해 보세요.",
    };
  }
  if (path === "/mentors") {
    return {
      title: "졸업생 멘토링 | 위미",
      description:
        "같은 길을 먼저 걸어간 인문계열 졸업생 멘토를 만나보세요. 선배의 경험과 따뜻한 조언으로 진로를 구체화할 수 있습니다.",
    };
  }
  if (/^\/mentors\/[^/]+\/articles\/[^/]+$/.test(path)) {
    return {
      title: "멘토 아티클 | 위미",
      description:
        "인문계열 졸업생 멘토가 전하는 진로와 취업 이야기를 읽어보세요.",
    };
  }
  if (/^\/mentors\/[^/]+$/.test(path)) {
    return {
      title: "졸업생 멘토 프로필 | 위미",
      description:
        "인문계열 졸업생 멘토의 전공, 경력과 이야기를 확인하고 1:1 멘토링을 신청해 보세요.",
    };
  }
  if (path === "/humanities") {
    return {
      title: "인문학 콘텐츠 | 위미",
      description:
        "문학, 문화, 역사, 지리와 예술을 아우르는 인문학 콘텐츠를 읽고 매일 새로운 상식을 쌓아보세요.",
    };
  }
  if (/^\/humanities\/articles\/[^/]+$/.test(path)) {
    return {
      title: "인문학 아티클 | 위미",
      description:
        "위미가 전하는 인문학 아티클을 읽으며 세상을 바라보는 지식과 관점을 넓혀보세요.",
    };
  }
  if (path === "/creative-space") {
    return {
      title: "창작 공간 | 위미",
      description:
        "인문학적 시선으로 만든 소설, 에세이 등 다양한 창작물을 감상하고 나만의 작품도 소개해 보세요.",
    };
  }
  if (/^\/creative-space\/[^/]+\/episodes\/[^/]+$/.test(path)) {
    return {
      title: "창작 작품 에피소드 | 위미",
      description:
        "위미 창작 공간에 게시된 작품의 에피소드를 읽어보세요.",
    };
  }
  if (path === "/career-match") {
    return {
      title: "창업 프로젝트 | 위미",
      description:
        "아이디어를 현실로 만들어 볼 수 있는 위미 창업 프로젝트를 살펴보고 새로운 도전을 시작해 보세요.",
    };
  }
  if (path === "/career-matching") {
    return {
      title: "고민 맞춤 진로 영상 | 위미",
      description:
        "진로와 취업에 대한 고민에 맞는 영상을 찾아보고, 다음 행동을 시작하는 데 필요한 힌트를 얻어보세요.",
    };
  }
  if (path === "/contact") {
    return {
      title: "문의하기 | 위미",
      description:
        "위미 서비스, 강의, 제휴와 사업에 대해 궁금한 점이 있다면 이메일이나 인스타그램으로 문의해 주세요.",
    };
  }
  if (path === "/privacy") {
    return {
      title: "개인정보처리방침 | 위미",
      description:
        "위미가 수집하는 개인정보 항목, 이용 목적과 보유 기간, 이용자의 권리를 안내합니다.",
    };
  }
  if (path === "/terms") {
    return {
      title: "이용약관 | 위미",
      description:
        "위미 서비스 이용 조건과 절차, 운영자와 이용자의 권리·의무를 안내합니다.",
    };
  }
  if (path === "/community") {
    return {
      title: "커뮤니티 | 위미",
      description:
        "인문계열 전공자와 졸업생이 진로 고민과 경험을 나누는 위미 커뮤니티입니다.",
      robots: "noindex, nofollow",
    };
  }
  if (
    path === "/login" ||
    path === "/signup" ||
    path === "/mypage" ||
    path === "/admin" ||
    path === "/projects" ||
    path === "/career-match/result"
  ) {
    return {
      title: "위미",
      description: DEFAULT_DESCRIPTION,
      robots: "noindex, nofollow",
    };
  }
  return {
    title: "페이지를 찾을 수 없습니다 | 위미",
    description: "요청하신 페이지를 찾을 수 없습니다. 위미 홈으로 이동해 보세요.",
    robots: "noindex, nofollow",
  };
}

export function RouteSEO() {
  const [location] = useLocation();
  const metadata = routeSeo(location);
  return (
    <SEO
      {...metadata}
      canonicalPath={location}
      structuredData={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "위미",
        description: metadata.description,
        url: absoluteUrl(location),
        inLanguage: "ko-KR",
      }}
    />
  );
}