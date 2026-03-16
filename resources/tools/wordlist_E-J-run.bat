@echo off
title xlsx wordlist Maker for Genki Study Resources
color 1F

set /p id="Press ENTER to generate wordlists for Genki (3rd Edition). "

python wordlist_E-J.py /lessons

pause
