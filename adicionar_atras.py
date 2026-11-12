#!/usr/bin/env python3
"""
Coloca no avatar.js a parte de TRÁS de um cabelo (ou de qualquer peça).

Uso:
  python3 adicionar_atras.py avatar.js  PEÇA  CORPO  atras.png  [frente.png]

Exemplos:
  python3 adicionar_atras.py avatar.js cabelo1 corpo1 cabelo1_corpo1_atras.png cabelo1_corpo1_frente.png
  python3 adicionar_atras.py avatar.js cabelo2 corpo2 cabelo2_corpo2_atras.png

  PEÇA  = nome da peça no CLOTHES (cabelo1, cabelo2, kairon_cabelo...)
  CORPO = corpo1, corpo2 ou corpo1_perto
  atras.png  = parte que fica ATRÁS do corpo
  frente.png = (opcional) a parte que fica POR CIMA do corpo e das roupas.
               Se você não passar, a imagem da frente que já está no avatar.js continua como está.

REGRA: as duas imagens precisam ter o MESMO tamanho (em pixels) da imagem original do cabelo
e ficam na mesma posição. Exporte as duas do mesmo arquivo/canvas, sem cortar as bordas.
Antes de mexer, o script salva uma cópia do avatar.js como avatar.js.bak
"""
import re, sys, base64, shutil, io

def uri(path):
    return 'data:image/png;base64,' + base64.b64encode(open(path, 'rb').read()).decode()

def tamanho(path_ou_bytes):
    try:
        from PIL import Image
    except ImportError:
        return None
    im = Image.open(io.BytesIO(path_ou_bytes) if isinstance(path_ou_bytes, bytes) else path_ou_bytes)
    return im.size

def main():
    if len(sys.argv) < 5:
        print(__doc__); sys.exit(1)
    arq, peca, corpo, atras = sys.argv[1:5]
    frente = sys.argv[5] if len(sys.argv) > 5 else None
    s = open(arq, encoding='utf8').read()

    # bloco da peça: de "\n peca:{n:'" até a próxima peça (ou o fim de CLOTHES)
    m = re.search(r"\n %s:\{n:'" % re.escape(peca), s)
    if not m:
        sys.exit("Não achei a peça '%s' no %s" % (peca, arq))
    ini = m.start()
    fim = re.search(r"\n (?:\w+:\{n:'|\};)", s[m.end():])
    fim = m.end() + fim.start() if fim else len(s)
    bloco = s[ini:fim]

    # entrada do corpo dentro da peça
    pat = re.compile(r"(\b%s:\{x:-?\d+,y:-?\d+,src:')(data:image/png;base64,[A-Za-z0-9+/=]+)(')(,srcAtras:'data:image/png;base64,[A-Za-z0-9+/=]+')?" % re.escape(corpo))
    e = pat.search(bloco)
    if not e:
        sys.exit("A peça '%s' não tem versão para '%s'." % (peca, corpo))

    frente_atual = e.group(2)
    tam_orig = tamanho(base64.b64decode(frente_atual.split(',', 1)[1]))
    for nome, p in (('atras', atras), ('frente', frente)):
        if p and tam_orig and tamanho(p) != tam_orig:
            sys.exit("A imagem %s tem tamanho %s, mas o cabelo original tem %s. As duas partes precisam ter o mesmo tamanho." % (nome, tamanho(p), tam_orig))

    nova_frente = uri(frente) if frente else frente_atual
    novo = e.group(1) + nova_frente + e.group(3) + ",srcAtras:'" + uri(atras) + "'"
    bloco2 = bloco[:e.start()] + novo + bloco[e.end():]
    shutil.copyfile(arq, arq + '.bak')
    open(arq, 'w', encoding='utf8').write(s[:ini] + bloco2 + s[fim:])
    print("Pronto: %s / %s agora tem frente + atrás. (backup: %s.bak)" % (peca, corpo, arq))

main()
