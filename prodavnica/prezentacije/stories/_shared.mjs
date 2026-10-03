// Zajedničko za sve priče.
export const SHOP_URL = "https://igralab.rs";

// Zvezda za značke i nalepnice (SVG, centrirana u 0,0)
export const star = (r = 28, ri = 11.5) =>
  `<path d="M${Array.from({ length: 10 }, (_, i) => {
    const a = (-90 + i * 36) * Math.PI / 180, rr = i % 2 ? ri : r;
    return `${(Math.cos(a) * rr).toFixed(1)} ${(Math.sin(a) * rr).toFixed(1)}`;
  }).join(" L")} Z" fill="#ffc93a" stroke="#3a1a14" stroke-width="4" stroke-linejoin="round"/>`;

export const lead = (title) =>
  `Ово је мали укус књижице „${title}“: шест кратких игара, по једна из сваке целине. Игре нису копија страна, него загревање за њих: дете игра уз вас, па се касније лакше сналази на папиру. Испод је шта је свака игра вежбала и на којој страни књижице то наставља.`;

export const TIP_DAILY = "Једна страна дневно, десет минута. Кад завршите целину, залепите налепницу на њено поље на страни 3.";
