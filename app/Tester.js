"use client";

import { useRef, useState } from "react";
import { EnvSection, LangNav, SiteHeader, useLang } from "./common";

const PRODUCTS = {
  ko: [
    { id: "p1", name: "무선 블루투스 이어폰", price: "39,000원" },
    { id: "p2", name: "스테인리스 텀블러 500ml", price: "18,900원" },
    { id: "p3", name: "접이식 노트북 거치대", price: "24,500원" },
    { id: "p4", name: "USB-C 고속 충전기", price: "15,000원" },
    { id: "p5", name: "기계식 키보드", price: "89,000원" },
  ],
  en: [
    { id: "p1", name: "Wireless Bluetooth Earbuds", price: "$29.99" },
    { id: "p2", name: "Stainless Steel Tumbler 500ml", price: "$14.50" },
    { id: "p3", name: "Foldable Laptop Stand", price: "$18.99" },
    { id: "p4", name: "USB-C Fast Charger", price: "$11.99" },
    { id: "p5", name: "Mechanical Keyboard", price: "$69.00" },
  ],
};

const T = {
  ko: {
    title: "aria-labelledby 테스트",
    fixedLabel: "수정 포함 여부",
    fixedYes: "수정 포함 버전입니다 (154.0.8037.22 이상)",
    fixedNo: "수정 이전 버전입니다 (154.0.8037.22 미만)",
    listTitle: "상품 목록",
    tablist: "버튼 이름 지정 방식",
    pressed: (tab, name) => `${tab} 탭에서 ${name} 상세보기 버튼을 눌렀습니다.`,
    aboutTitle: "테스트 방법",
    about1:
      "두 탭의 상품 목록은 화면이 같습니다. 상품명과 가격 글자는 aria-hidden으로 숨기고, 상세보기 화살표 버튼만 초점을 받습니다. aria-label 탭은 버튼에 상품명과 가격을 직접 넣었고, aria-labelledby 탭은 숨긴 상품명과 가격 요소의 id를 참조합니다.",
    about2:
      "정상이라면 두 탭 모두 “무선 블루투스 이어폰 39,000원, 버튼”처럼 읽어야 합니다. aria-labelledby 탭에서만 “버튼”으로 읽으면 Chromium 이슈 542033685 증상입니다.",
    issue: "Chromium 이슈 542033685",
  },
  en: {
    title: "aria-labelledby test",
    fixedLabel: "Includes fix",
    fixedYes: "Yes, includes the fix (154.0.8037.22 or later)",
    fixedNo: "No, before the fix (earlier than 154.0.8037.22)",
    listTitle: "Product list",
    tablist: "Button naming method",
    pressed: (tab, name) => `Pressed the details button for ${name} in the ${tab} tab.`,
    aboutTitle: "How to test",
    about1:
      "Both tabs show the same product list. The product name and price text are hidden with aria-hidden, and only the arrow (details) button receives focus. In the aria-label tab, the button gets the name and price directly via aria-label. In the aria-labelledby tab, the button references the ids of the hidden name and price elements.",
    about2:
      "Expected: both tabs read the button as “Wireless Bluetooth Earbuds $29.99, button”. If only the aria-labelledby tab reads just “button”, that is the symptom of Chromium issue 542033685.",
    issue: "Chromium issue 542033685",
  },
};

// Chromium issue 542033685 fix first shipped in stable WebView 154.0.8037.22
const FIX_VERSION = [154, 0, 8037, 22];

function Arrow() {
  return (
    <svg aria-hidden="true" focusable="false" width="24" height="24" viewBox="0 0 24 24">
      <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProductList({ mode, onOpen, products }) {
  return (
    <ul className="products">
      {products.map((p) => {
        const nameId = `${mode}-${p.id}-name`;
        const priceId = `${mode}-${p.id}-price`;
        const buttonProps =
          mode === "label"
            ? { "aria-label": `${p.name} ${p.price}` }
            : { "aria-labelledby": `${nameId} ${priceId}` };
        return (
          <li key={p.id} className="product">
            <div className="product-text">
              <span id={nameId} className="product-name" aria-hidden="true">{p.name}</span>
              <span id={priceId} className="product-price" aria-hidden="true">{p.price}</span>
            </div>
            <button type="button" className="detail" onClick={() => onOpen(p, mode)} {...buttonProps}>
              <Arrow />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

const TABS = [
  { key: "label", title: "aria-label" },
  { key: "labelledby", title: "aria-labelledby" },
];

export default function Tester() {
  const [active, setActive] = useState("label");
  const [status, setStatus] = useState("");
  const [lang, setLangRaw] = useLang();
  const tabRefs = useRef({});

  const switchLang = (next) => {
    setLangRaw(next);
    setStatus("");
  };

  const onKeyDown = (e) => {
    const idx = TABS.findIndex((t) => t.key === active);
    let next = null;
    if (e.key === "ArrowRight") next = (idx + 1) % TABS.length;
    else if (e.key === "ArrowLeft") next = (idx - 1 + TABS.length) % TABS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TABS.length - 1;
    if (next === null) return;
    e.preventDefault();
    setActive(TABS[next].key);
    tabRefs.current[TABS[next].key]?.focus();
  };

  const onOpen = (p, mode) => {
    setStatus(T[lang].pressed(mode === "label" ? "aria-label" : "aria-labelledby", p.name));
  };

  if (!lang) return <main><title>aria-labelledby test</title></main>;
  const t = T[lang];

  return (
    <>
      <title>{t.title}</title>
      <SiteHeader lang={lang} current="labelledby" />
      <main>
        <h1>{t.title}</h1>
        <LangNav lang={lang} onSwitch={switchLang} />

        <EnvSection
          lang={lang}
          fix={{ version: FIX_VERSION, label: t.fixedLabel, yes: t.fixedYes, no: t.fixedNo }}
        />

        <section aria-labelledby="list-title">
          <h2 id="list-title">{t.listTitle}</h2>
          <div role="tablist" aria-label={t.tablist} className="tabs" onKeyDown={onKeyDown}>
            {TABS.map((tab) => (
              <button
                key={tab.key}
                ref={(el) => (tabRefs.current[tab.key] = el)}
                type="button"
                role="tab"
                id={`tab-${tab.key}`}
                aria-selected={active === tab.key}
                aria-controls={`panel-${tab.key}`}
                tabIndex={active === tab.key ? 0 : -1}
                onClick={() => setActive(tab.key)}
              >
                {tab.title}
              </button>
            ))}
          </div>
          {TABS.map((tab) => (
            <div
              key={tab.key}
              role="tabpanel"
              id={`panel-${tab.key}`}
              aria-labelledby={`tab-${tab.key}`}
              hidden={active !== tab.key}
            >
              <ProductList mode={tab.key} onOpen={onOpen} products={PRODUCTS[lang]} />
            </div>
          ))}
          <p role="status" className="status">{status}</p>
        </section>

        <section aria-labelledby="about-title" className="about">
          <h2 id="about-title">{t.aboutTitle}</h2>
          <p>{t.about1}</p>
          <p>{t.about2}</p>
          <p>
            <a href="https://issues.chromium.org/issues/542033685">{t.issue}</a>
          </p>
        </section>
      </main>
    </>
  );
}
