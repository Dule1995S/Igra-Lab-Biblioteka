// Интерактивна прича уз „Мали детектив: Ко је то?“ (за децу од 4 до 5 година).
// Случајеви су нови; вештина је иста: прецртај оно што се не слаже, а оно што остане је решење.
import { SHOP_URL, star, TIP_DAILY } from "../_shared.mjs";
import { DETEKTIV_LEAD } from "../_logic.mjs";

export default {
  slug: "ko-je-to",
  title: "МАЛИ ДЕТЕКТИВ: КО ЈЕ ТО?",
  subtitle: "интерактивна прича са Лиском: трагови, сенке и отисци",
  chips: ["6 кратких случајева", "око 10 минута", "4–5 година", "родитељ чита трагове"],
  nameMsg: "Ја сам Лиско, мали детектив. Помози ми да решимо све случајеве! А како се ти зовеш?",
  finaleMsg: "Браво, {ime}! Свих шест случајева је решено, а ти си прави мали детектив! А сад у књижицу: један случај дневно је сасвим довољан.",
  finaleIcon: "lisko",

  assets: {
    cover: "../../../covers/ko-je-to.jpg", sledeca: "../../../covers/oboj-po-tragovima.jpg",
    pas: "pas.png", riba: "riba.png", zec: "zec.png", patka: "patka.png", lav: "lav.png", konj: "konj.png", zirafa: "zirafa.png", slon: "slon.png",
    lane: "lane.png", kokoska: "kokoska.png", trag_pas: "trag_pas.png", trag_patka: "trag_patka.png", trag_kokoska: "trag_kokoska.png", trag_lane: "trag_lane.png",
    macka: "macka.png", mis: "mis.png", busen: "busen.png", veverica: "veverica.png", jez: "jez.png", ograda: "ograda.png",
    kljuc: "kljuc.png", kljuc_krug: "kljuc_krug.png", kljuc_kvadrat: "kljuc_kvadrat.png", kljuc_bez: "kljuc_bez.png",
    lopta: "lopta.png", jabuka: "jabuka.png", kapa: "kapa.png", casa: "casa.png", knjiga: "knjiga.png",
  },
  names: {
    pas: "пас", riba: "риба", zec: "зец", patka: "патка", lav: "лав", konj: "коњ", zirafa: "жирафа", slon: "слон", lane: "лане", kokoska: "кока",
    macka: "мачка", mis: "миш", veverica: "веверица", jez: "јеж", lopta: "лопта", jabuka: "јабука", kapa: "капа", casa: "чаша", knjiga: "књига",
  },
  art: { star: star(), dragon: "" },

  steps: [
    {
      label: "ТРАГОВИ", color: "#b34a43", theme: "detective", page: 4, pageTitle: "Ко је појео шаргарепу?",
      skill: "Закључивање корак по корак: сваки траг уклања оне који се не слажу, а оно што остане је решење.",
      intro: "Лиско је записао трагове. Након сваког трага прецртај животињу која се НЕ слаже. Родитељ чита траг.",
      game: {
        type: "eliminate", stepOk: "Тако! Следећи траг.", hint: "Хмм, та се слаже са трагом. Прецртавамо оне које се НЕ слажу.", again: "Нови случај! Прецртај оне које се не слажу.",
        rounds: [
          { title: "КО ЈЕ ПЛИВАО У ЈЕЗЕРУ?", answer: "patka",
            animals: [{ key: "pas", traits: ["legs", "fur"] }, { key: "riba", traits: ["swim", "fins"] }, { key: "zec", traits: ["legs", "fur"] }, { key: "patka", traits: ["swim", "wings", "legs"] }],
            clues: [{ text: "Може да плива.", trait: "swim", has: true }, { text: "Има крила.", trait: "wings", has: true }],
            fact: "Тачно, патка! Први траг је уклонио пса и зеца, а други рибу." },
          { title: "КО ЈЕ ИЗАШАО У ШЕТЊУ?", answer: "lav",
            animals: [{ key: "lav", traits: ["mane", "claws"] }, { key: "konj", traits: ["mane", "hooves"] }, { key: "zirafa", traits: ["longneck", "hooves"] }, { key: "slon", traits: ["trunk"] }],
            clues: [{ text: "Нема сурлу.", trait: "trunk", has: false }, { text: "Нема дугачак врат.", trait: "longneck", has: false }, { text: "Нема копита.", trait: "hooves", has: false }],
            fact: "Тачно, лав! Трагови који кажу шта НЕМА су теже: дете прецртава баш ону која то има." },
        ],
      },
    },
    {
      label: "СЕНКЕ", color: "#6b4fc2", theme: "night", page: 11, pageTitle: "Чија је сенка?",
      skill: "Посматрање облика: сенка нема очи ни боју, само облик. Дете тражи уши, реп и ноге.",
      intro: "Лиско је упалио лампу, а на зиду се појавила сенка. Која животиња је баца? Тражи уши, реп и ноге.",
      game: {
        type: "choose", hint: "Хмм, погледај облик: реп, уши, ноге. Покушај поново.", again: "Нова сенка! Која животиња је баца?",
        rounds: [
          { title: "ЧИЈА ЈЕ СЕНКА?", model: "macka", silhouette: true, choices: ["pas", "zec", "macka", "mis"], right: 2, fact: "Тачно, мачка! Дугачак реп и шиљате уши." },
          { title: "СЕНКА У ШУМИ", model: "veverica", silhouette: true, choices: ["mis", "veverica", "jez", "macka"], right: 1, fact: "Тачно, веверица! Реп је највећи траг: код миша је танак, код веверице велики и чупав." },
        ],
      },
    },
    {
      label: "ОТИСЦИ", color: "#5a8a35", theme: "meadow", page: 7, pageTitle: "Чији је траг?",
      skill: "Повезивање трага са оним ко га оставља: пас оставља јастучиће, патка троугао са кожицом, кока три танка прста, лане папак.",
      intro: "После кише је у дворишту остало блато, а у блату трагови. Ко је оставио овај траг? Додирни животињу.",
      game: {
        type: "choose", hint: "Хмм, погледај траг још једном: какве су му шапе, прсти или папци?", again: "Нови траг! Чији је?",
        rounds: [
          { title: "ЧИЈИ ЈЕ ТРАГ?", model: "trag_pas", choices: ["patka", "pas", "kokoska"], right: 1, fact: "Тачно, пас! Пас оставља јастучиће." },
          { title: "ЧИЈИ ЈЕ ТРАГ?", model: "trag_patka", choices: ["lane", "patka", "pas"], right: 1, fact: "Тачно, патка! Троугао са кожицом између прстију." },
          { title: "ЧИЈИ ЈЕ ТРАГ?", model: "trag_kokoska", choices: ["kokoska", "lane", "patka"], right: 0, fact: "Тачно, кока! Три танка прста." },
          { title: "ЧИЈИ ЈЕ ТРАГ?", model: "trag_lane", choices: ["pas", "lane", "kokoska"], right: 1, fact: "Тачно, лане! Папак из два дела." },
        ],
      },
    },
    {
      label: "СКРИВЕНИ", color: "#c2681b", theme: "garden", page: 9, pageTitle: "Ко је иза жбуна?",
      skill: "Закључивање по делу: од животиње се види само нешто, а по томе се позна ко је.",
      intro: "Неко се сакрио, а виде се само делови. Ко је то? Додирни животињу доле.",
      game: {
        type: "choose", hint: "Хмм, шта се види? Уши или глава? Покушај поново.", again: "Још неко се крије! Ко је то?",
        rounds: [
          { title: "КО ЈЕ ИЗА ЖБУНА?", model: "busen", choices: ["macka", "zec", "mis", "pas"], right: 1, fact: "Тачно, зец! Дугачке и усправне уши има зец, а мачка и пас имају краће, а миш округле." },
          { title: "КО ГЛЕДА ПРЕКО ОГРАДЕ?", model: "ograda", choices: ["lav", "slon", "zirafa", "konj"], right: 2, fact: "Тачно, жирафа! Само једна од ових животиња има тако дугачак врат да глава вири изнад ограде." },
        ],
      },
    },
    {
      label: "КЉУЧ", color: "#2e8a96", theme: "detective", page: 13, pageTitle: "Изгубљен кључ",
      skill: "Поређење ситних детаља: кључеви се разликују по глави, зупцима и машни. Прави се слаже у све три ствари.",
      intro: "Бака је изгубила кључ од подрума и нацртала га за Лиска. Нађи кључ који је потпуно исти као на цртежу.",
      game: {
        type: "choose", hint: "Хмм, провери једну по једну ствар: главу, машну, зупце.", hideNames: true,
        rounds: [{ title: "ИЗГУБЉЕНО: КОЈИ ЈЕ ИСТИ?", model: "kljuc", choices: ["kljuc_krug", "kljuc", "kljuc_bez", "kljuc_kvadrat"], right: 1, fact: "Тачно! Прави кључ се слаже у све: у главу, у машну и у зупце." }],
      },
    },
    {
      label: "СТО", color: "#3f7cb8", theme: "detective", page: 15, pageTitle: "Шта је нестало са стола?",
      skill: "Памћење и поређење две слике: горе је сто пре ручка, доле после. Једна ствар је нестала.",
      intro: "Лиско је пре ручка погледао сто, а после ручка опет. Једна ствар је нестала! Која? Иди прстом по оба реда истовремено.",
      game: {
        type: "missing", title: "ШТА ЈЕ НЕСТАЛО СА СТОЛА?", hint: "Хмм, упореди оба реда, ствар по ствар. Горе је пре, доле после.", again: "Нови сто! Шта је нестало?",
        rounds: [
          { top: ["lopta", "jabuka", "kapa", "casa", "knjiga"], bottom: ["lopta", null, "kapa", "casa", "knjiga"], choices: ["knjiga", "jabuka", "kapa"], right: 1, fact: "Тачно, јабука! Горе је била, а доле је нема." },
          { top: ["knjiga", "casa", "lopta", "jabuka", "kapa"], bottom: ["knjiga", null, "lopta", "jabuka", "kapa"], choices: ["kapa", "lopta", "casa"], right: 2, fact: "Тачно, чаша! Детектив не само нађе него и каже шта је нашао." },
        ],
      },
    },
  ],

  parents: {
    lead: DETEKTIV_LEAD("Мали детектив: Ко је то?", "Дете од четири и пет година још не чита: трагове и упутства читате ви, а дете одговара додиром на слици. Књижица има шеснаест случајева."),
    tips: [TIP_DAILY.replace("Кад завршите целину, залепите налепницу на њено поље на страни 3.", "Решења су на крају књижице: прво нека дете покуша само."),
      "Није важно да дете реши брзо. Важније је да каже зашто: „риба нема ноге, зато је прецртана“. Тако се из погађања рађа закључивање."],
  },

  next: {
    title: "МАЛИ ДЕТЕКТИВ: ОБОЈ ПО ТРАГОВИМА",
    bridge: "Сад дете не тражи ко је то, него боји: сваки траг каже нешто о бојама, а тачно једно бојење се слаже са свим траговима.",
    contents: "Четрнаест случајева за децу од 5 до 6 година: балони, куће, коцке, прозори, рибе и чарапе.",
    code: "ТРАГ20",
    codeText: "20% на следећу књижицу (код је и на последњој страни ваше књижице)",
    url: SHOP_URL,
    series: ["Ко је ко? 1", "Ко је ко? 2", "Тајна зачараног ормана", "Мозгалице"],
  },
};
