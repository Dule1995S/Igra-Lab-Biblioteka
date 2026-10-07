"""Podaci zadataka i tačni odgovori (jedan izvor istine: strane crtaju iz ovoga, verify.py proverava, katalog.md se piše odavde).
Pozicije: (red, kolona) od gore levo, brojanje od 0."""

ZADACI = {
    4: dict(vrsta="otvoreno", naslov="Šta nosimo u misiju", ponuda=["lupa", "sveska", "boca", "list", "lopta", "knjiga"], broj_izbora=3),
    5: dict(vrsta="izbor", pitanje="У чему се два листа разликују?", opcije=["БОЈА", "ОБЛИК", "ВЕЛИЧИНА"], tacno=2,
            veza="велики и мали лист су исти по боји и облику"),
    6: dict(vrsta="razvrstavanje", grupe=["priroda", "pravi_covek"],
            stavke=[("list", "priroda"), ("sveska", "pravi_covek"), ("cvet", "priroda"), ("olovka", "pravi_covek"), ("kamen", "priroda"), ("boca", "pravi_covek")]),
    7: dict(vrsta="brojanje", n=12, opcije=[12, 14, 16], tacno=0),
    8: dict(vrsta="sabiranje", a=4, b=3, opcije=[6, 7, 8], tacno=1),
    9: dict(vrsta="oduzimanje", a=8, b=2, opcije=[4, 5, 6], tacno=2),
    10: dict(vrsta="niz", redovi=[
        dict(niz=["list", "kamen", "list", "kamen", "list", None], jedinica=["list", "kamen"], opcije=["kamen", "cvet", "list"], tacno=0),
        dict(niz=["kocka", "lopta", "cvet", "kocka", "lopta", "cvet", "kocka", None], jedinica=["kocka", "lopta", "cvet"], opcije=["cvet", "kocka", "lopta"], tacno=2)]),
    11: dict(vrsta="put", start=(2, 0), cilj=(0, 2), blokirana=[(1, 1), (2, 1)],
             slike={(2, 0): "kocka", (0, 2): "list", (1, 1): "kamen", (2, 1): "kamen"}),
    12: dict(vrsta="plan", start=(2, 0), koraci=[("d", 2), ("g", 2)], cilj_slika="list",
             mreza={(0, 0): "cvet", (0, 1): "olovka", (0, 2): "list", (1, 0): "sveska", (1, 1): "kamen", (1, 2): "lopta", (2, 0): "kocka", (2, 1): "boca", (2, 2): "knjiga"}),
    13: dict(vrsta="kopiranje", delovi=[dict(kolone=2, redovi=2, slike=["list", "kamen", "kocka", "cvet"]),
                                         dict(kolone=3, redovi=2, slike=["lupa", "sveska", "boca", "lopta", "knjiga", "olovka"])]),
    14: dict(vrsta="brojanje", n=3, opcije=[3, 4, 5], tacno=0),
    15: dict(vrsta="redosled", slike=["zmaj3", "zmaj1", "zmaj2"], redni_brojevi=[3, 1, 2], kljuc=["kraj", "početak", "problem"]),
}

# stanice i strane (za tablu i pečate)
STANICE = [("ПОСМАТРАЊЕ", (4, 6)), ("КОЛИЧИНА", (7, 9)), ("ПРОСТОР И НИЗ", (10, 13)), ("ПРИЧА И САРАДЊА", (14, 15)), ("КРЕЋЕМО СЕ", (16, 17))]
