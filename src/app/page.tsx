/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { SAJT } from "@/lib/sajt";

const AGES = [
  { a: "3", c: "#7ba84f" }, { a: "4", c: "#2f6aa8" }, { a: "5", c: "#f2a03d" }, { a: "6", c: "#8a5ea8" },
];

const FAQ = [
  { q: "Da li treba nešto da instaliram?", a: "Ne. Biblioteka radi u pregledaču na računaru. Prijavite se na računaru u vrtiću i pokrenite prezentaciju na tabli ili projektoru." },
  { q: "Koliko vaspitačica može da koristi biblioteku?", a: "Svaka vaspitačica u vrtiću ima svoj nalog. Broj naloga zavisi od pretplate vrtića, na primer 12 za šest grupa sa po dve vaspitačice. Ako vam treba više, javite nam se." },
  { q: "Ko otvara naloge vaspitačicama?", a: "Administrator vrtića, posle prijave, u delu „Moj vrtić“. Vaspitačice se ne registruju same. Prijavljuju se običnim emailom i lozinkom sa bilo kog računara u vrtiću." },
  { q: "Šta vrtić dobija sa pretplatom?", a: "Pristup svih vaspitačica svim knjižicama za uzraste 3, 4, 5 i 6 godina. Uz svaku knjižicu dobijate interaktivnu prezentaciju za vođenje grupe i radni list za štampu." },
  { q: "Kako se koristi prezentacija?", a: "Vi vodite grupu: postavljate pitanja, pokazujete na tabli i otkrivate odgovore na klik. Pitanja za decu su pripremljena uz svaki slajd. Posle toga deca rade zadatke na radnom listu." },
  { q: "Kako štampam radni list?", a: "Radni list se preuzima kao PDF i štampa na papiru A4, najbolje u boji." },
  { q: "Šta ako pretplata istekne?", a: "Pristup biblioteci se zatvara za sve naloge vrtića dok se pretplata ne obnovi. Nalozi ostaju sačuvani." },
];

export default function Home() {
  const btn2 = "inline-block rounded-[14px] border-4 px-6 py-[10px] text-[19px] font-bold no-underline";
  return (
    <main>
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:py-20">
        <div>
          <p className="text-[16px] font-bold uppercase tracking-widest text-brand-cool">Za vrtiće, uzrast 3 do 6 godina</p>
          <h1 className="mt-3 text-[38px] font-extrabold leading-tight md:text-[56px]" style={{ textWrap: "balance" }}>
            Prezentacije i radni listovi za sve vaspitačice u vrtiću
          </h1>
          <p className="mt-4 text-[20px]">
            Vrtić plaća jednu pretplatu, a svaka vaspitačica ima svoj login. Uz svaku Igra Lab knjižicu dobijate interaktivnu prezentaciju za vođenje grupe i radni list koji deca rade na papiru.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/demo/brojevi-do-20" className="btn">Isprobaj besplatan primer</Link>
            <Link href="/prijava" className={btn2} style={{ borderColor: "var(--brand)", color: "var(--foreground)" }}>Prijava</Link>
          </div>
          <p className="mt-4 text-[16px] opacity-80">Bez instalacije. Radi u pregledaču, na tabli ili projektoru.</p>
        </div>
        <img src="/slajd-uparivanje.png" width={1120} height={631} alt="Slajd prezentacije: uparivanje predmeta da se vidi gde ima više"
          className="w-full rounded-3xl border-4 border-brand shadow-lg" />
      </section>

      {/* Šta dobijate */}
      <section className="bg-white/60 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-[32px] font-extrabold md:text-[40px]">Šta dobijate uz svaku knjižicu</h2>
          <ul className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              { t: "Interaktivna prezentacija", d: "Vi vodite grupu. Dodajete predmete jedan po jedan, uparujete skupove, popunjavate okvir od deset, a odgovor otkrivate tek kad deca odgovore.", c: "var(--brand)" },
              { t: "Pitanja za decu", d: "Uz svaki slajd stoje pitanja koja možete da postavite grupi, na primer „Gde ima više? Kako znaš?“. Skrivena su dok ih ne otvorite.", c: "var(--brand-cool)" },
              { t: "Radni list za štampu", d: "Posle prezentacije deca rade zadatke na papiru. Slajd na kraju svake celine pokazuje koje strane lista se rade.", c: "var(--brand-warm)" },
            ].map((x) => (
              <li key={x.t} className="rounded-2xl bg-background p-6" style={{ borderTop: `8px solid ${x.c}` }}>
                <h3 className="text-[24px] font-bold">{x.t}</h3>
                <p className="mt-2 text-[18px]">{x.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Kako radi */}
      <section id="kako-radi" className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-[32px] font-extrabold md:text-[40px]">Kako radi</h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            { t: "Vrtić pravi nalog", d: "Registrujete vrtić i aktivirate pretplatu. Jedna pretplata otvara sve knjižice za sve vaspitačice." },
            { t: "Otvorite naloge vaspitačicama", d: "Svaka vaspitačica dobija svoj email i lozinku, na primer dve za svaku od šest grupa. Naloge otvarate sami, za minut." },
            { t: "Vaspitačice rade u grupi", d: "Svaka se prijavi na računaru na poslu, izabere uzrast i knjižicu, pokrene prezentaciju na tabli i odštampa radni list." },
          ].map((x, i) => (
            <li key={x.t} className="flex gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand text-[24px] font-bold text-white">{i + 1}</span>
              <div><h3 className="text-[22px] font-bold">{x.t}</h3><p className="mt-1">{x.d}</p></div>
            </li>
          ))}
        </ol>
      </section>

      {/* Primer */}
      <section className="bg-white/60 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-[32px] font-extrabold md:text-[40px]">Pogledajte kako izgleda</h2>
          <p className="mt-2 max-w-2xl">Isječci iz prezentacije „Бројеви и количине до 20“ (uzrast 5 godina). Ceo primer možete da isprobate besplatno.</p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <figure><img src="/slajd-desetica.png" width={1120} height={631} alt="Slajd Десет и још: dva okvira od deset" className="w-full rounded-2xl border-4 border-brand-cool" />
              <figcaption className="mt-2 text-[16px]">Okvir od deset: vi dodajete jedan po jedan, deca broje i zaključuju.</figcaption></figure>
            <figure><img src="/slajd-staza.png" width={1120} height={631} alt="Slajd Бројевна стаза: Lisko ide od 1 do 20" className="w-full rounded-2xl border-4 border-brand-cool" />
              <figcaption className="mt-2 text-[16px]">Brojevna staza: Lisko ide od 1 do 20, a brojeve možete da sakrijete i pitate „koji dolazi posle?“.</figcaption></figure>
          </div>
          <div className="mt-8"><Link href="/demo/brojevi-do-20" className="btn">Isprobaj besplatan primer</Link></div>
        </div>
      </section>

      {/* Uzrasti */}
      <section id="uzrasti" className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-[32px] font-extrabold md:text-[40px]">Četiri uzrasta, jedna biblioteka</h2>
        <p className="mt-2">Knjižice su podeljene po uzrastu dece. Otvorite uzrast, pa izaberite knjižicu po naslovu.</p>
        <ul className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-4">
          {AGES.map((x) => (
            <li key={x.a} className="rounded-2xl bg-white p-6 text-center shadow-sm" style={{ borderTop: `10px solid ${x.c}` }}>
              <p className="text-[56px] font-extrabold leading-none" style={{ fontFamily: "var(--font-baloo)" }}>{x.a}</p>
              <p className="text-[20px] font-bold">godine</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Cena */}
      <section id="cene" className="bg-white/60 py-14">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-[32px] font-extrabold md:text-[40px]">Jedna pretplata za ceo vrtić</h2>
          <p className="mt-3 text-[20px]">
            Pretplata otvara sve knjižice za sve uzraste. Svaka vaspitačica u vrtiću ima svoj login, na primer 12 naloga za šest grupa sa po dve vaspitačice.
          </p>
          <p className="mt-4 text-[28px] font-extrabold">{SAJT.cena ?? "Cenu objavljujemo uskoro"}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link href="/registracija" className="btn">Registruj vrtić</Link>
            <Link href="/cene" className={btn2} style={{ borderColor: "var(--brand)", color: "var(--foreground)" }}>Više o pretplati</Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="pitanja" className="mx-auto max-w-3xl px-4 py-14">
        <h2 className="text-[32px] font-extrabold md:text-[40px]">Česta pitanja</h2>
        <div className="mt-6 flex flex-col gap-3">
          {FAQ.map((f) => (
            <details key={f.q} className="rounded-2xl bg-white p-5 shadow-sm">
              <summary className="cursor-pointer text-[20px] font-bold">{f.q}</summary>
              <p className="mt-2">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Završni poziv */}
      <section className="bg-brand py-14 text-center text-white">
        <div className="mx-auto max-w-3xl px-4">
          <span className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white"><img src="/lisko.png" alt="" className="h-16 w-auto" /></span>
          <h2 className="mt-4 text-[32px] font-extrabold md:text-[40px]">Spremni za prvi čas sa Liskom?</h2>
          <p className="mt-2 text-[20px]">Isprobajte primer bez naloga, pa registrujte vrtić kad vam se dopadne.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link href="/demo/brojevi-do-20" className="inline-block rounded-[14px] bg-white px-6 py-3 text-[19px] font-bold no-underline" style={{ color: "#8a3410" }}>Isprobaj besplatan primer</Link>
            <Link href="/registracija" className="inline-block rounded-[14px] border-4 border-white px-6 py-[10px] text-[19px] font-bold no-underline" style={{ color: "#fff" }}>Registruj vrtić</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
