// Pomoćnici za priče sa zaključivanjem (Mali detektiv).
export const DETEKTIV_LEAD = (title, vrste) =>
  `Ово је мали укус књижице „${title}“: шест кратких случајева, по један из сваке врсте. Дете чита трагове (или их ви читате наглас), закључује корак по корак и само долази до решења. Испод је шта је сваки случај вежбао и на којој страни књижице то наставља. ${vrste || ""}`.trim();

// imena -> mesta (slotovi). at[ime] = redni broj slike sleva (0, 1, 2...)
export const clue = (text, check) => ({ text, check });
export const is = (ime, ...slots) => (at) => slots.includes(at[ime]);
export const isNot = (ime, ...slots) => (at) => !slots.includes(at[ime]);
export const before = (a, b) => (at) => at[a] < at[b];
export const rightOf = (a, b) => (at) => at[a] > at[b];
export const beside = (a, b) => (at) => Math.abs(at[a] - at[b]) === 1;

// Tabele: at[ime] = [kolona u prvoj tabeli, kolona u drugoj tabeli, ...]
export const tHas = (ime, t, col) => (at) => at[ime][t] === col;
export const tNot = (ime, t, col) => (at) => at[ime][t] !== col;
export const tNotAny = (ime, t, ...cols) => (at) => !cols.includes(at[ime][t]);
export const tBefore = (a, b, t = 0) => (at) => at[a][t] < at[b][t];
// „Dete sa X u prvoj tabeli ima Y u drugoj“: red gde su obe kolone isti
export const tLink = (t1, c1, t2, c2) => (at) => Object.values(at).some((v) => v[t1] === c1 && v[t2] === c2);
