import type { ReactNode } from "react";
import {
  ClapSlide, CompareSlide, CountSlide, EndSlide, Fill10Slide, HuntSlide, LessMoreSlide, Match20Slide,
  MatchCountSlide, MissingSlide, MyNumberSlide, ShareSlide, StepsSlide, TenPlusSlide, TitleSlide, TwoColorsSlide,
} from "@/components/prezentacija/slides";
import { C, seq } from "@/components/prezentacija/consts";

// Slajdovi prate redosled radnog lista „Бројеви и количине до 20“ (str. 4–17).
export const slides: { name: string; node: ReactNode }[] = [
  { name: "Наслов", node: <TitleSlide title1="БРОЈЕВИ И КОЛИЧИНЕ" title2="ДО 20" subtitle="додирни, преброј, повежи" age="за узраст 5 година" /> },
  { name: "Колико их има?", node: <CountSlide title="КОЛИКО ИХ ИМА?" hint="Преброј сваки скуп. Додирни број који показује колико их има." items={[
    { sprites: seq(["apple"], 4), options: [3, 4, 5], answer: 4 },
    { sprites: seq(["fish"], 6), options: [6, 7, 5], answer: 6 },
    { sprites: seq(["star"], 3), options: [2, 4, 3], answer: 3 },
    { sprites: seq(["ladybug"], 7), options: [8, 7, 6], answer: 7 },
    { sprites: seq(["strawberry"], 5), options: [5, 6, 4], answer: 5 },
    { sprites: seq(["leaf"], 8), options: [7, 9, 8], answer: 8 },
  ]} /> },
  { name: "Повежи број и скуп", node: <MatchCountSlide title="ПОВЕЖИ БРОЈ И СКУП" hint="Изабери број, па скуп са толико предмета." rows={[
    { n: 6, sprites: seq(["balloon-red", "balloon-yellow", "balloon-blue", "balloon-green", "balloon-red", "balloon-yellow"], 6) },
    { n: 7, sprites: seq(["gift-red", "gift-blue", "gift-yellow", "gift-green"], 7) },
    { n: 8, sprites: seq(["car-red", "car-yellow", "car-blue", "car-green"], 8) },
    { n: 9, sprites: seq(["button-red", "button-yellow", "button-blue", "button-green"], 9) },
    { n: 10, sprites: seq(["boat-red", "boat-blue", "boat-yellow", "boat-green"], 10) },
  ]} /> },
  { name: "Попуни до 10", node: <Fill10Slide title="ПОПУНИ ДО 10" hint="Додирни празна поља да их попуниш. Изабери колико их је још требало." rows={[
    { have: 8, options: [1, 2, 3] }, { have: 6, options: [4, 3, 5] }, { have: 9, options: [3, 2, 1] }, { have: 7, options: [2, 3, 4] },
  ]} /> },
  { name: "Где има више?", node: <CompareSlide title="ГДЕ ИМА ВИШЕ?" hint="Преброј оба скупа. Додирни већи скуп. Ако их је исто, додирни оба." pairs={[
    { left: seq(["car-red", "car-yellow", "car-blue", "car-green"], 7), right: seq(["car-red", "car-yellow", "car-blue", "car-green"], 5) },
    { left: seq(["balloon-red", "balloon-yellow", "balloon-blue", "balloon-green"], 6), right: seq(["balloon-red", "balloon-yellow", "balloon-blue", "balloon-green"], 8) },
    { left: seq(["shell"], 9), right: seq(["kite-red", "kite-yellow", "kite-blue", "kite-green"], 9) },
  ]} /> },
  { name: "Који број недостаје?", node: <MissingSlide title="КОЈИ БРОЈ НЕДОСТАЈЕ?" hint="Изговори ред наглас. Додирни број који иде на празно место." rows={[
    { seq: [1, 2, null, 4, 5], options: [3, 6, 2], answer: 3, color: C.red },
    { seq: [5, 6, null, 8, 9], options: [4, 10, 7], answer: 7, color: C.red },
    { seq: [11, 12, 13, null, 15], options: [16, 14, 10], answer: 14, color: C.blue },
    { seq: [16, 17, 18, 19, null], options: [20, 11, 10], answer: 20, color: C.blue },
  ]} /> },
  { name: "Десет и још", node: <TenPlusSlide title="ДЕСЕТ И ЈОШ" hint="Пуна десетица и још неколико. Колико их има укупно?" exampleRed={3} rows={[
    { red: 2, options: [12, 13, 11] }, { red: 5, options: [14, 16, 15] }, { red: 1, options: [12, 11, 13] },
  ]} /> },
  { name: "Повежи до 20", node: <Match20Slide title="ПОВЕЖИ ДО 20" hint="Изабери број, па два оквира са толико тачака." rows={[
    { n: 12, red: 2 }, { n: 15, red: 5 }, { n: 17, red: 7 }, { n: 20, red: 10 },
  ]} /> },
  { name: "Бројчани лов", node: <HuntSlide title="БРОЈЧАНИ ЛОВ" hint="Преброј рибе, шкољке и звезде у мору. Додирни оно што си пребројао." /> },
  { name: "Две боје, укупно 10", node: <TwoColorsSlide title="ДВЕ БОЈЕ, УКУПНО 10" hint="Обој десет поља двема бојама, свако поље једном." /> },
  { name: "Распореди по једнако", node: <ShareSlide title="РАСПОРЕДИ ПО ЈЕДНАКО" hint="Додирни дугме, па корпу. У свакој корпи треба да буде исто."
    items={seq(["button-red", "button-yellow", "button-blue", "button-green", "button-red", "button-blue"], 6).concat(seq(["button-red", "button-yellow", "button-blue", "button-green", "button-red", "button-blue"], 6))}
    perBasket={4} options={[3, 4, 5]} /> },
  { name: "Мање или више од 10?", node: <LessMoreSlide title="МАЊЕ ИЛИ ВИШЕ ОД 10?" hint="Преброј скуп. Додирни МАЊЕ ако их је мање од 10, а ВИШЕ ако их је више." items={[
    { sprite: "acorn", n: 8 }, { sprite: "strawberry", n: 13 }, { sprite: "flower-red", n: 11 },
    { sprite: "leaf", n: 6 }, { sprite: "ladybug", n: 14 }, { sprite: "cube", n: 9 },
  ]} /> },
  { name: "Мој број", node: <MyNumberSlide title="МОЈ БРОЈ" hint="Изабери број од 11 до 20. Погледај га у оквирима." /> },
  { name: "Пљесни и преброј", node: <ClapSlide title="ПЉЕСНИ И ПРЕБРОЈ" hint="Одрасли покаже број, а ти толико пута пљеснеш. Па дај пет!" numbers={[2, 4, 6, 8, 10]} /> },
  { name: "Десет корака и још", node: <StepsSlide title="ДЕСЕТ КОРАКА И ЈОШ" hint="Направи 10 корака, па још толико колико пише на картици." cards={[1, 3, 5]} /> },
  { name: "Крај", node: <EndSlide /> },
];
