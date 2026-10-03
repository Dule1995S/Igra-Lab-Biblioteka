// Interaktivna priča uz knjižicu „Животиње света“ (од дворишта до леда и мора). Činjenice su iz knjižice.
import { SHOP_URL, star, lead, TIP_DAILY } from "../_shared.mjs";

const dot = (fill) => `<circle r="26" fill="${fill}" stroke="#3a1a14" stroke-width="5"/><circle cx="-8" cy="-9" r="6" fill="#fff" opacity=".45"/>`;

export default {
  slug: "zivotinje-sveta",
  title: "ЖИВОТИЊЕ СВЕТА",
  subtitle: "интерактивна прича са Лиском, од дворишта до леда и мора",
  chips: ["6 кратких игара", "око 10 минута", "5–7 година", "најбоље уз одраслог"],
  finaleMsg: "Браво, {ime}! Стигли смо до кита, а успут смо упознали много животиња! А сад у књижицу: једна страна дневно је сасвим довољна.",
  finaleIcon: "kitsiv",

  assets: {
    cover: "../../../covers/zivotinje-sveta.jpg", sledeca: "../../../covers/cuvam-prirodu.jpg",
    kokoska: "kokoska.png", petao: "petao.png", patka: "patka.png", macka: "macka.png", krava: "krava.png", koza: "koza.png", ovca: "ovca.png", pas: "pas.png", mis: "mis.png", konj: "konj.png",
    veverica: "veverica.png", srna: "srna.png", lastavica: "lastavica.png", sova: "sova.png", slepimis: "slepimis.png", jez: "jez.png",
    riba: "riba.png", kornjaca: "kornjaca.png", zaba: "zaba.png", zvezda: "zvezda.png", kit: "kit.png", delfin: "delfin.png", riba2: "riba2.png", foka: "foka.png", hobotnica: "hobotnica.png",
    lav: "lav.png", krokodil: "krokodil.png", tigar: "tigar.png", lama: "lama.png", papagaj: "papagaj.png",
    slon: "slon.png", polarni: "polarni.png", pingvin: "pingvin.png", mis2: "mis2.png", kitsiv: "kitsiv.png", bubamara: "bubamara.png",
  },
  names: {
    kokoska: "кока", petao: "петао", patka: "патка", macka: "мачка", krava: "крава", koza: "коза", ovca: "овца", pas: "пас", mis: "миш", konj: "коњ",
    veverica: "веверица", srna: "срна", lastavica: "ластавица", sova: "сова", slepimis: "слепи миш", jez: "јеж",
    riba: "риба", kornjaca: "корњача", zaba: "жаба", zvezda: "морска звезда", kit: "кит", delfin: "делфин", riba2: "риба", foka: "фока", hobotnica: "хоботница",
    lav: "лав", krokodil: "крокодил", tigar: "тигар", lama: "лама", papagaj: "папагај", slon: "слон", polarni: "поларни медвед", pingvin: "пингвин", mis2: "миш",
  },
  art: {
    star: star(), dragon: "",
    dotred: dot("#e4553f"), dotyellow: dot("#f0b429"), dotblue: dot("#3f7cb8"), dotgreen: dot("#5aa24a"), dotpurple: dot("#8456c6"),
  },

  steps: [
    {
      label: "КОД КУЋЕ", color: "#c2951b", theme: "garden", page: 6, pageTitle: "Шта ту не припада",
      skill: "Уочавање шта не припада групи по правилу (перје, млеко, кућа) и објашњавање зашто.",
      intro: "Добродошли у двориште! У сваком реду једна животиња не иде уз остале. Прочитај правило и додирни ону која не припада.",
      game: {
        type: "odd", hint: "Хмм, провери правило још једном. Тражи ону која му не одговара.", again: "Следећи ред! Која животиња не припада?",
        bonus: "Шаре на мачјем носу другачије су код сваке мачке, као отисци прстију.",
        rounds: [
          { title: "ИМА ПЕРЈЕ", items: ["kokoska", "petao", "patka", "macka"], odd: 3, fact: "Тачно, мачка нема перје! Мачка проспава више од пола дана, али никад одједном него у много кратких дремежа." },
          { title: "ДАЈЕ МЛЕКО", items: ["krava", "koza", "ovca", "kokoska"], odd: 3, fact: "Тачно, кока не даје млеко! Кокошка може да снесе јаје скоро сваког дана, а патка знатно ређе." },
          { title: "ЖИВИ У КУЋИ", items: ["pas", "macka", "mis", "konj"], odd: 3, fact: "Тачно, коњ не живи у кући!" },
        ],
      },
    },
    {
      label: "У ШУМИ", color: "#4a8f3a", theme: "forest", page: 8, pageTitle: "Дању или ноћу",
      skill: "Разврставање у две групе: ко спава дању, а ко ноћу (по очима и навикама).",
      intro: "У шуми неко спава дању, а неко ноћу. Додирни ДАЊУ или НОЋУ за сваку животињу. Помаже ако погледаш њене очи.",
      game: {
        type: "sort", title: "ДАЊУ ИЛИ НОЋУ?", ok: "Тачно!",
        hint: "Хмм, погледај очи. Ко је будан по дану, а ко по ноћи? Покушај поново.",
        bins: [{ label: "ДАЊУ", color: "#d99a12" }, { label: "НОЋУ", color: "#3a4aa8" }],
        items: [
          { key: "veverica", bin: 0, fact: "Тачно! Веверица закопа жир на много места, део заборави, и из заборављеног израсте дрво." },
          { key: "sova", bin: 1, fact: "Тачно! Сова не може да помера очи у страну, зато окреће целу главу скоро унаоколо." },
          { key: "srna", bin: 0 },
          { key: "jez", bin: 1, fact: "Тачно! Јеж има између пет и седам хиљада бодљи и склупча се једним мишићем." },
          { key: "lastavica", bin: 0 },
          { key: "slepimis", bin: 1 },
        ],
        doneMsg: "Све је на свом месту! Једни спавају дању, а други ноћу.",
      },
    },
    {
      label: "У ВОДИ", color: "#2e8a96", theme: "sea", page: 12, pageTitle: "Нађи исту",
      skill: "Разликовање сличних облика: пажљиво поређење, што касније помаже код слова (б и д).",
      intro: "Уронили смо у воду! Лево је животиња-модел. Која од понуђених је иста као она? Погледај добро облик.",
      game: {
        type: "choose", hint: "Хмм, погледај облик у целини, па ситнице. Покушај поново.", again: "Нова животиња! Која је иста као она лево?",
        rounds: [
          { title: "НАЂИ ИСТУ", model: "kornjaca", choices: ["riba", "kornjaca", "zaba", "zvezda"], hideNames: true, right: 1,
            fact: "Тачно, корњача! Корњача не може да изађе из свог оклопа: оклоп је срастао са њеним костима." },
          { title: "НАЂИ ИСТУ", model: "delfin", choices: ["kit", "delfin", "riba2", "foka"], hideNames: true, right: 1,
            fact: "Тачно, делфин! Делфин спава са пола мозга будним, да не заборави да изрони по ваздух." },
          { title: "НАЂИ ИСТУ", model: "hobotnica", choices: ["zvezda", "zaba", "hobotnica", "kornjaca"], hideNames: true, right: 2,
            fact: "Тачно, хоботница! Хоботница има три срца и осам кракова, а ниједну кост у целом телу." },
        ],
        bonus: "Разликовање сличних облика је оно што касније раздваја слова б и д.",
      },
    },
    {
      label: "ВРУЋЕ ЗЕМЉЕ", color: "#b34a43", theme: "field", page: 18, pageTitle: "Издалека или изблиза",
      skill: "Разврставање на животиње које гледамо издалека и оне којима смемо близу: учимо где се стоји.",
      intro: "У врућим земљама неке животиње гледамо издалека, а некима смемо близу. Додирни ИЗДАЛЕКА или ИЗБЛИЗА.",
      game: {
        type: "sort", title: "ИЗДАЛЕКА ИЛИ ИЗБЛИЗА?", ok: "Тачно!",
        hint: "Хмм, да ли та животиња лови? Покушај другу страну.",
        bins: [{ label: "ИЗДАЛЕКА", color: "#c9462e" }, { label: "ИЗБЛИЗА", color: "#4a8f3a" }],
        items: [
          { key: "lav", bin: 0, fact: "Тачно! Лављи рик се чује и осам километара далеко, најбоље ноћу кад је ваздух хладан." },
          { key: "lama", bin: 1 },
          { key: "krokodil", bin: 0 },
          { key: "papagaj", bin: 1 },
          { key: "tigar", bin: 0 },
          { key: "kornjaca", bin: 1 },
        ],
        doneMsg: "Лав, крокодил и тигар лове, зато их гледамо издалека, а не зато што су зли.",
      },
    },
    {
      label: "СИТНЕ ЖИВОТИЊЕ", color: "#6b4fc2", theme: "meadow", page: 23, pageTitle: "Моја бубамара",
      skill: "Бројање до пет и машта: дете само бира боје и тачке, нема погрешног.",
      intro: "Ово је бубамара. Додај јој тачно пет тачака, у боји коју ти желиш. Овде нема погрешног одговора!",
      game: {
        type: "stickers", shape: "image", base: "bubamara", baseBox: [40, 10, 220, 340], slotR: 24,
        slots: [[117, 188], [190, 188], [113, 247], [196, 247], [152, 290]],
        trayTitle: "ПЕТ ТАЧАКА ЗА БУБАМАРУ",
        emblems: ["dotred", "dotyellow", "dotblue", "dotgreen", "dotpurple", "star"],
        left: "Још {n}. Којом бојом иде следећа тачка?",
        full: "Бубамара је пуна. Додирни неку тачку ако хоћеш да је замениш.",
        removed: "Тачка је склоњена. Изабери другу!",
        doneMsg: "Лепа бубамара! Бубамара не добија нове тачке како расте: колико их има, толико их је од почетка. А једна пчела за цео живот направи само дванаестину кашичице меда.",
      },
    },
    {
      label: "НА ЛЕДУ", color: "#3f7cb8", theme: "snow", page: 24, pageTitle: "Шта је веће",
      skill: "Поређење по величини у стварности, а не на слици (кит, слон, медвед, миш).",
      intro: "Стигли смо на лед! На слици су две животиње исте величине. Шта је у стварности веће? Додирни.",
      game: {
        type: "bigger", title: "ШТА ЈЕ У СТВАРНОСТИ ВЕЋЕ?",
        hint: "Хмм, замисли праву животињу, не слику. Покушај поново.",
        again: "Следећи пар! Шта је у стварности веће?",
        rounds: [
          { a: "slon", b: "kit", bigger: "b", fact: "Тачно! Плави кит је највећа животиња која је икад живела, већи и од диносауруса." },
          { a: "polarni", b: "pingvin", bigger: "a", fact: "Тачно! Медвед живи на северу, пингвин на југу: никад се нису срели." },
          { a: "mis2", b: "lav", bigger: "b", fact: "Тачно! Лав је много већи од миша." },
        ],
      },
    },
  ],

  parents: {
    lead: lead("Животиње света"),
    tips: [TIP_DAILY, "Ниједан задатак не тражи да дете зна имена животиња: имена стоје испод слика да их ви прочитате, не да их дете памти."],
  },

  next: {
    title: "ЧУВАМ ПРИРОДУ: од канте до шуме",
    bridge: "Животиње живе у природи, а ми можемо да је чувамо: у коју канту иде ствар, како вода не оде узалуд и шта расте из семена.",
    contents: "Шест целина, тридесет страна, за децу од 5 до 7 година: шта бацамо, три канте, вода, поново употреби, башта и компост и напољу.",
    code: "ЗВЕРКЕ20",
    codeText: "20% на следећу књижицу (код је и на последњој страни ваше књижице)",
    url: SHOP_URL,
    series: ["Србија", "Технологија око нас", "Пут око света", "Пут у свемир", "Ко се крије"],
  },
};
