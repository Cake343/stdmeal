# syntax=docker/dockerfile:1
#
# stdmeal — obraz produkcyjny.
#
# Dwa etapy:
#   1. build  — Node skleja źródła w jeden plik (i po drodze odpala testy,
#               więc obraz nie powstanie z zepsutego kodu),
#   2. runtime — nginx bez roota, który serwuje ten jeden plik.
#
# Efekt: finalny obraz nie zawiera Node'a, npm, źródeł ani testów — tylko
# nginx-alpine i ~140 kB HTML-a. Nie ma tu czego zaktualizować ani zepsuć.

# ——— etap 1: build ————————————————————————————————————————————
FROM node:22-alpine AS build

WORKDIR /app

# Zero zależności = zero `npm install`. Kopiujemy tylko to, czego build dotyka.
COPY package.json ./
COPY index.html ./
COPY src ./src
COPY tools ./tools
COPY test ./test

# Testy w buildzie są celowe: zepsuty commit nie zamieni się w obraz.
RUN node --test && node tools/build.mjs

# ——— etap 2: runtime ——————————————————————————————————————————
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime

LABEL org.opencontainers.image.title="stdmeal" \
      org.opencontainers.image.description="Kompilator promptów na jedzenie — klikasz lodówkę, dostajesz prompt do LLM-a." \
      org.opencontainers.image.url="https://github.com/Cake343/stdmeal" \
      org.opencontainers.image.source="https://github.com/Cake343/stdmeal" \
      org.opencontainers.image.licenses="MIT" \
      org.opencontainers.image.vendor="oakloud"

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

# Obraz bazowy chodzi jako uid 101 i słucha na 8080 — żadnych uprawnień roota.
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --spider http://127.0.0.1:8080/healthz || exit 1
