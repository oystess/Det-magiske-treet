#!/usr/bin/env bash
# Kjører alle sjekkene mot appen. Playwright installeres midlertidig og
# fjernes etterpå, så repoet forblir avhengighetsfritt.
#
#   ./sjekk/kjor.sh              alle grupper
#   ./sjekk/kjor.sh lyd uu       bare noen
#   BEHOLD=1 ./sjekk/kjor.sh     la Playwright ligge (raskere ved gjentatte kjøringer)
#   APP_FIL=/sti/til/kopi.html ./sjekk/kjor.sh   test en annen fil

set -uo pipefail
cd "$(dirname "$0")/.."

GRUPPER=("state" "oppforsel" "sikkerhetskopi" "lyd" "uu" "geometri" "regler")
[ $# -gt 0 ] && GRUPPER=("$@")

RYDD=0
if [ ! -d node_modules/playwright ]; then
  echo "Installerer Playwright midlertidig …"
  npm install playwright --no-save --silent >/dev/null 2>&1 || {
    echo "Fikk ikke installert Playwright. Sjekkene trenger den."; exit 2; }
  [ "${BEHOLD:-0}" = "1" ] || RYDD=1
fi

FEIL=0
for g in "${GRUPPER[@]}"; do
  echo "── $g ──"
  node "sjekk/$g.js" || FEIL=1
done

[ "$RYDD" = "1" ] && rm -rf node_modules package-lock.json

echo
if [ "$FEIL" = "0" ]; then echo "ALT GRØNT"; else echo "NOE FEILER"; fi
exit $FEIL
