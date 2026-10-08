# Police des PDF

`NotoSansCJKkr-Regular.otf` est la police Noto Sans CJK KR Regular officielle,
utilisée pour le latin, les accents français et le coréen. Le fichier complet est
livré avec l’API (~16 Mo) ; PDFKit intègre seulement les glyphes utilisés dans le PDF.
Aucun téléchargement de police ni service externe n’est appelé à l’exécution.

Source : [notofonts/noto-cjk, Sans/OTF/Korean](https://github.com/notofonts/noto-cjk/tree/main/Sans/OTF/Korean).
Licence SIL Open Font License 1.1 : `OFL.txt`, copie du fichier `Sans/LICENSE`
du dépôt officiel. La police est distribuée sans modification.

Le déploiement de l’API doit conserver `assets/fonts` à côté de `dist`.
Le chemin est relatif au module et fonctionne en développement comme après build,
indépendamment du répertoire depuis lequel le serveur est lancé.
