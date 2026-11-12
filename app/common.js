"use client";

import { useEffect, useRef, useState } from "react";

// Pages listed in the hamburger menu dialog. Add new bug reproductions here.
export const PAGES = [
  { key: "labelledby", path: "/" },
  { key: "pressed", path: "/aria-pressed" },
];

const C = {
  ko: {
    siteNav: "테스트 메뉴",
    menu: "메뉴",
    menuTitle: "테스트 목록",
    close: "닫기",
    language: "언어",
    pages: { labelledby: "aria-labelledby 버튼 이름", pressed: "aria-pressed 토글 버튼" },
    envTitle: "현재 환경",
    checking: "확인 중…",
    webview: "웹뷰 버전",
    notWebview: (c) => `웹뷰가 아닌 브라우저입니다 (Chrome ${c || "알 수 없음"})`,
    device: "기기",
    readers: "스크린 리더",
    noReader: "실행 중인 스크린 리더 없음",
  },
  en: {
    siteNav: "Test menu",
    menu: "Menu",
    menuTitle: "Test list",
    close: "Close",
    language: "Language",
    pages: { labelledby: "aria-labelledby button names", pressed: "aria-pressed toggle buttons" },
    envTitle: "Environment",
    checking: "Checking…",
    webview: "WebView version",
    notWebview: (c) => `Not a WebView (Chrome ${c || "unknown"})`,
    device: "Device",
    readers: "Screen readers",
    noReader: "No screen reader running",
  },
};

function detectLang() {
  const q = new URLSearchParams(window.location.search).get("lang");
  if (q === "ko" || q === "en") return q;
  const langs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""];
  return String(langs[0] || "").toLowerCase().startsWith("ko") ? "ko" : "en";
}

export function useLang() {
  const [lang, setLang] = useState(null);
  useEffect(() => {
    setLang(detectLang());
  }, []);
  useEffect(() => {
    if (lang) document.documentElement.lang = lang;
  }, [lang]);
  const switchLang = (next) => {
    setLang(next);
    const url = new URL(window.location.href);
    url.searchParams.set("lang", next);
    window.history.replaceState(null, "", url);
  };
  return [lang, switchLang];
}

export function parseVersion(v) {
  if (!v) return null;
  const m = String(v).match(/(\d+)\.(\d+)\.(\d+)\.(\d+)/);
  return m ? m.slice(1).map(Number) : null;
}

export function compareVersion(a, b) {
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

function MenuIcon() {
  return (
    <svg aria-hidden="true" focusable="false" width="24" height="24" viewBox="0 0 24 24">
      <path d="M4 6h16M4 12h16M4 18h16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// Site header: hamburger button opening a modal <dialog> (showModal) with the test list.
export function SiteHeader({ lang, current }) {
  const c = C[lang];
  const dialogRef = useRef(null);
  const buttonRef = useRef(null);
  const [open, setOpen] = useState(false);

  const openMenu = () => {
    dialogRef.current?.showModal();
    setOpen(true);
  };
  const closeMenu = () => dialogRef.current?.close();
  const onClose = () => {
    setOpen(false);
    buttonRef.current?.focus();
  };
  // Clicking the backdrop (outside the dialog box) closes it.
  const onDialogClick = (e) => {
    if (e.target === dialogRef.current) closeMenu();
  };

  return (
    <header className="site-header">
      <nav aria-label={c.siteNav}>
        <button
          ref={buttonRef}
          type="button"
          className="menu-button"
          aria-label={c.menu}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls="menu-dialog"
          onClick={openMenu}
        >
          <MenuIcon />
        </button>
      </nav>
      <dialog
        ref={dialogRef}
        id="menu-dialog"
        className="menu-dialog"
        aria-labelledby="menu-title"
        onClose={onClose}
        onClick={onDialogClick}
      >
        <div className="menu-inner">
          <h2 id="menu-title">{c.menuTitle}</h2>
          <ul className="menu-list">
            {PAGES.map((p) => (
              <li key={p.key}>
                <a href={`${p.path}?lang=${lang}`} aria-current={p.key === current ? "page" : undefined}>
                  {c.pages[p.key]}
                </a>
              </li>
            ))}
          </ul>
          <button type="button" className="menu-close" onClick={closeMenu}>
            {c.close}
          </button>
        </div>
      </dialog>
    </header>
  );
}

export function LangNav({ lang, onSwitch }) {
  return (
    <nav aria-label={C[lang].language} className="lang">
      <a href="?lang=ko" lang="ko" aria-current={lang === "ko" ? "true" : undefined}
        onClick={(e) => { e.preventDefault(); onSwitch("ko"); }}>한국어</a>
      {" · "}
      <a href="?lang=en" lang="en" aria-current={lang === "en" ? "true" : undefined}
        onClick={(e) => { e.preventDefault(); onSwitch("en"); }}>English</a>
    </nav>
  );
}

// Environment box. `fix` (optional): { version: [a,b,c,d], label, yes, no } for a bug-fix version check.
export function EnvSection({ lang, fix }) {
  const c = C[lang];
  const [env, setEnv] = useState(null);
  useEffect(() => {
    setEnv(readEnvironment());
  }, []);

  const webviewVersion = env?.native?.webViewVersion || (env?.isWebView ? env?.chrome : null);
  const parsed = parseVersion(webviewVersion);
  const fixed = fix && parsed ? compareVersion(parsed, fix.version) >= 0 : null;

  return (
    <section aria-labelledby="env-title" className="env">
      <h2 id="env-title">{c.envTitle}</h2>
      {!env ? (
        <p>{c.checking}</p>
      ) : (
        <dl>
          <dt>{c.webview}</dt>
          <dd>
            {webviewVersion
              ? `${webviewVersion}${env.native?.webViewPackage ? ` (${env.native.webViewPackage})` : ""}`
              : c.notWebview(env.chrome)}
          </dd>
          {fixed !== null && (
            <>
              <dt>{fix.label}</dt>
              <dd>{fixed ? fix.yes : fix.no}</dd>
            </>
          )}
          {env.native && (
            <>
              <dt>{c.device}</dt>
              <dd>{`${env.native.model} · Android ${env.native.androidVersion}`}</dd>
              <dt>{c.readers}</dt>
              <dd>{env.native.screenReaders || c.noReader}</dd>
            </>
          )}
          <dt>User-Agent</dt>
          <dd className="ua">{env.ua}</dd>
        </dl>
      )}
    </section>
  );
}
