@echo off
title Anki Decks Maker for Genki Study Resources
color 1F

set /p id="Press ENTER to generate Anki decks for Genki (3rd Edition). "

python anki_decks_maker.py /lessons

pause
