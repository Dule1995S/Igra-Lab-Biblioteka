#!/usr/bin/env python3
"""Gradi ovu bojanku zajedničkim alatom iz knjizice/_zajednicko.
  python3 gradi.py aseti STARI.pdf   |   python3 gradi.py pdf   |   python3 gradi.py katalog"""
import sys, os
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.normpath(os.path.join(HERE, "..", "..", "..", "_zajednicko"))); sys.path.insert(0, HERE)
import knjiga, pokreni
sys.exit(pokreni.main(knjiga, sys.argv[1:]) or 0)
