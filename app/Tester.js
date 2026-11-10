"use client";

import { useEffect, useRef, useState } from "react";

const PRODUCTS = [
  { id: "p1", name: "무선 블루투스 이어폰", price: "39,000원" },
  { id: "p2", name: "스테인리스 텀블러 500ml", price: "18,900원" },
  { id: "p3", name: "접이식 노트북 거치대", price: "24,500원" },
  { id: "p4", name: "USB-C 고속 충전기", price: "15,000원" },
  { id: "p5", name: "기계식 키보드", price: "89,000원" },
];

// Chromium issue 542033685 fix first shipped in stable WebView 154.0.8037.22
const FIX_VERSION = [154, 0, 8037, 22];

function parseVersion(v) {
  if (!v) return null;
  const m = String(v).match(/(\d+)\.(\d+)\.(\d+)\.(\d+)/);
  return m ? m.slice(1).map(Number) : null;
}

function compare(a, b) {
  for (let i = 0; i < 4; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}

function readEnvironment() {
  const ua = navigator.userAgent;
  const chrome = (ua.match(/Chrome\/([\d.]+)/) || [])[1] || null;
  const isWebView = /; wv\)/.test(ua) || typeof window.AndroidInfo !== "undefined";
  let native = null;
  try {
    if (window.AndroidInfo && typeof window.AndroidInfo.getInfo === "function") {
      native = JSON.parse(window.AndroidInfo.getInfo());
    }
  } catch (e) {
    native = null;
  }
  return { ua, chrome, isWebView, native };
}

function Arrow() {
  return (
    <svg aria-hidden="true" focusable="false" width="24" height="24" viewBox="0 0 24 24">
      <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProductList({ mode, onOpen }) {
  return (
    <ul className="products">
      {PRODUCTS.map((p) => {
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
  const [env, setEnv] = useState(null);
  const [active, setActive] = useState("label");
  const [status, setStatus] = useState("");
  const tabRefs = useRef({});

  useEffect(() => {
    setEnv(readEnvironment());
  }, []);

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
    setStatus(`${mode === "label" ? "aria-label" : "aria-labelledby"} 탭에서 ${p.name} 상세보기 버튼을 눌렀습니다.`);
  };

  const webviewVersion = env?.native?.webViewVersion || (env?.isWebView ? env?.chrome : null);
  const parsed = parseVersion(webviewVersion);
  const fixed = parsed ? compare(parsed, FIX_VERSION) >= 0 : null;

  return (
    <main>
      <h1>aria-labelledby 테스트</h1>

      <section aria-labelledby="env-title" className="env">
        <h2 id="env-title">현재 환경</h2>
        {!env ? (
          <p>확인 중…</p>
        ) : (
          <dl>
            <dt>웹뷰 버전</dt>
            <dd>
              {webviewVersion
                ? `${webviewVersion}${env.native?.webViewPackage ? ` (${env.native.webViewPackage})` : ""}`
                : `웹뷰가 아닌 브라우저입니다 (Chrome ${env.chrome || "알 수 없음"})`}
            </dd>
            {fixed !== null && (
              <>
                <dt>수정 포함 여부</dt>
                <dd>
                  {fixed
                    ? "수정 포함 버전입니다 (154.0.8037.22 이상)"
                    : "수정 이전 버전입니다 (154.0.8037.22 미만)"}
                </dd>
              </>
            )}
            {env.native && (
              <>
                <dt>기기</dt>
                <dd>{`${env.native.model} · Android ${env.native.androidVersion}`}</dd>
                <dt>스크린 리더</dt>
                <dd>{env.native.screenReaders || "실행 중인 스크린 리더 없음"}</dd>
              </>
            )}
            <dt>User-Agent</dt>
            <dd className="ua">{env.ua}</dd>
          </dl>
        )}
      </section>

      <section aria-labelledby="list-title">
        <h2 id="list-title">상품 목록</h2>
        <div role="tablist" aria-label="버튼 이름 지정 방식" className="tabs" onKeyDown={onKeyDown}>
          {TABS.map((t) => (
            <button
              key={t.key}
              ref={(el) => (tabRefs.current[t.key] = el)}
              type="button"
              role="tab"
              id={`tab-${t.key}`}
              aria-selected={active === t.key}
              aria-controls={`panel-${t.key}`}
              tabIndex={active === t.key ? 0 : -1}
              onClick={() => setActive(t.key)}
            >
              {t.title}
            </button>
          ))}
        </div>
        {TABS.map((t) => (
          <div
            key={t.key}
            role="tabpanel"
            id={`panel-${t.key}`}
            aria-labelledby={`tab-${t.key}`}
            hidden={active !== t.key}
          >
            <ProductList mode={t.key} onOpen={onOpen} />
          </div>
        ))}
        <p role="status" className="status">{status}</p>
      </section>

      <section aria-labelledby="about-title" className="about">
        <h2 id="about-title">테스트 방법</h2>
        <p>
          두 탭의 상품 목록은 화면이 같습니다. 상품명과 가격 글자는 aria-hidden으로 숨기고, 상세보기 화살표 버튼만 초점을 받습니다.
          aria-label 탭은 버튼에 상품명과 가격을 직접 넣었고, aria-labelledby 탭은 숨긴 상품명과 가격 요소의 id를 참조합니다.
        </p>
        <p>정상이라면 두 탭 모두 “무선 블루투스 이어폰 39,000원, 버튼”처럼 읽어야 합니다. aria-labelledby 탭에서만 “버튼”으로 읽으면 Chromium 이슈 542033685 증상입니다.</p>
        <p>
          <a href="https://issues.chromium.org/issues/542033685">Chromium 이슈 542033685</a>
        </p>
      </section>
    </main>
  );
}
