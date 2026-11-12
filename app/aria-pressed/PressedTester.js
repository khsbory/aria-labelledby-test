"use client";

import { useState } from "react";
import { EnvSection, LangNav, SiteHeader, useLang } from "../common";

const PRODUCTS = {
  ko: [
    { id: "p1", name: "무선 블루투스 이어폰", price: "39,000원" },
    { id: "p2", name: "스테인리스 텀블러 500ml", price: "18,900원" },
    { id: "p3", name: "접이식 노트북 거치대", price: "24,500원" },
  ],
  en: [
    { id: "p1", name: "Wireless Bluetooth Earbuds", price: "$29.99" },
    { id: "p2", name: "Stainless Steel Tumbler 500ml", price: "$14.50" },
    { id: "p3", name: "Foldable Laptop Stand", price: "$18.99" },
  ],
};

const FORMATS = ["bold", "italic", "underline"];

const T = {
  ko: {
    title: "aria-pressed 테스트",
    formatTitle: "1. 글자 서식 (텍스트 버튼)",
    formatGroup: "글자 서식",
    format: { bold: "굵게", italic: "기울임꼴", underline: "밑줄" },
    preview: "미리보기: 접근성은 모두를 위한 것입니다.",
    favTitle: "2. 찜하기 (아이콘 버튼)",
    fav: (name) => `${name} 찜하기`,
    checkTitle: "3. 상태 확인",
    check: "현재 상태 읽기",
    on: "켜짐",
    off: "꺼짐",
    favList: (names) => (names.length ? `찜한 상품: ${names.join(", ")}.` : "찜한 상품 없음."),
    aboutTitle: "테스트 방법",
    about1:
      "1번과 2번의 버튼은 모두 일반 button 요소에 aria-pressed 속성만 넣은 토글 버튼입니다. 누르면 aria-pressed 값이 true와 false로 바뀌고, 상태를 알려 주는 라이브 영역은 일부러 넣지 않았습니다. 처음 열었을 때 굵게와 두 번째 상품 찜하기는 눌린 상태입니다.",
    about2:
      "정상이라면 TalkBack이 버튼 이름과 함께 눌림 상태(예: 켜짐 또는 꺼짐, 선택됨 또는 선택 안 됨)를 읽고, 두 번 탭해 바꾸면 바뀐 상태를 읽어야 합니다. 상태 없이 “굵게, 버튼”처럼 이름만 읽으면 확인하려는 증상입니다.",
    about3: "실제 상태 값은 3번의 ‘현재 상태 읽기’ 버튼을 누르면 상태 메시지로 확인할 수 있습니다.",
  },
  en: {
    title: "aria-pressed test",
    formatTitle: "1. Text formatting (text buttons)",
    formatGroup: "Text formatting",
    format: { bold: "Bold", italic: "Italic", underline: "Underline" },
    preview: "Preview: Accessibility is for everyone.",
    favTitle: "2. Favorites (icon buttons)",
    fav: (name) => `Add ${name} to favorites`,
    checkTitle: "3. Check state",
    check: "Read current state",
    on: "on",
    off: "off",
    favList: (names) => (names.length ? `Favorites: ${names.join(", ")}.` : "No favorites."),
    aboutTitle: "How to test",
    about1:
      "The buttons in sections 1 and 2 are plain button elements with only an aria-pressed attribute. Activating one toggles aria-pressed between true and false; there is intentionally no live region announcing the change. On load, Bold and the second product's favorite button are pressed.",
    about2:
      "Expected: TalkBack reads the button name together with its pressed state (for example on/off, or selected/not selected), and reads the new state after you double-tap to toggle it. If it reads only the name, like “Bold, button”, without any state, that is the symptom this page reproduces.",
    about3: "To confirm the actual values, press “Read current state” in section 3; the result appears in a status message.",
  },
};

function Heart() {
  return (
    <svg aria-hidden="true" focusable="false" width="24" height="24" viewBox="0 0 24 24">
      <path
        d="M12 20.5s-7.5-4.6-9.5-9.2C1 7.8 3.2 4.5 6.6 4.5c2.3 0 4 1.3 5.4 3.1 1.4-1.8 3.1-3.1 5.4-3.1 3.4 0 5.6 3.3 4.1 6.8-2 4.6-9.5 9.2-9.5 9.2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PressedTester() {
  const [lang, setLangRaw] = useLang();
  const [formats, setFormats] = useState({ bold: true, italic: false, underline: false });
  const [favs, setFavs] = useState({ p1: false, p2: true, p3: false });
  const [status, setStatus] = useState("");

  const switchLang = (next) => {
    setLangRaw(next);
    setStatus("");
  };

  if (!lang) return <main><title>aria-pressed test</title></main>;
  const t = T[lang];
  const products = PRODUCTS[lang];

  const readState = () => {
    const f = FORMATS.map((k) => `${t.format[k]} ${formats[k] ? t.on : t.off}`).join(", ");
    const names = products.filter((p) => favs[p.id]).map((p) => p.name);
    setStatus(`${f}. ${t.favList(names)}`);
  };

  const previewStyle = {
    fontWeight: formats.bold ? 700 : 400,
    fontStyle: formats.italic ? "italic" : "normal",
    textDecoration: formats.underline ? "underline" : "none",
  };

  return (
    <>
      <title>{t.title}</title>
      <SiteHeader lang={lang} current="pressed" />
      <main>
        <h1>{t.title}</h1>
        <LangNav lang={lang} onSwitch={switchLang} />

        <EnvSection lang={lang} />

        <section aria-labelledby="format-title">
          <h2 id="format-title">{t.formatTitle}</h2>
          <div role="group" aria-label={t.formatGroup} className="format-buttons">
            {FORMATS.map((k) => (
              <button
                key={k}
                type="button"
                className={`toggle toggle-${k}`}
                aria-pressed={formats[k]}
                onClick={() => setFormats((s) => ({ ...s, [k]: !s[k] }))}
              >
                {t.format[k]}
              </button>
            ))}
          </div>
          <p className="preview" style={previewStyle}>{t.preview}</p>
        </section>

        <section aria-labelledby="fav-title">
          <h2 id="fav-title">{t.favTitle}</h2>
          <ul className="products">
            {products.map((p) => (
              <li key={p.id} className="product">
                <div className="product-text">
                  <span className="product-name">{p.name}</span>
                  <span className="product-price">{p.price}</span>
                </div>
                <button
                  type="button"
                  className="fav"
                  aria-label={t.fav(p.name)}
                  aria-pressed={favs[p.id]}
                  onClick={() => setFavs((s) => ({ ...s, [p.id]: !s[p.id] }))}
                >
                  <Heart />
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="check-title">
          <h2 id="check-title">{t.checkTitle}</h2>
          <button type="button" className="check" onClick={readState}>{t.check}</button>
          <p role="status" className="status">{status}</p>
        </section>

        <section aria-labelledby="about-title" className="about">
          <h2 id="about-title">{t.aboutTitle}</h2>
          <p>{t.about1}</p>
          <p>{t.about2}</p>
          <p>{t.about3}</p>
        </section>
      </main>
    </>
  );
}
