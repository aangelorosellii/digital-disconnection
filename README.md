# Digital Disconnection

Web app mobile-first con due aree separate:

- pagina pubblica dove ogni partecipante inserisce manualmente i propri dati
- dashboard admin privata dove solo l'organizzatore vede l'analisi aggregata

## Struttura

- `index.html`: form pubblico per nome, average screen time e voci
- `admin.html`: dashboard privata con grafico aggregato
- `server.py`: server locale e API
- `upload.js`: invio del form dei partecipanti
- `admin.js`: aggregazione e visualizzazione dei dati

## Avvio locale

```bash
python3 server.py
```

## URL

- pagina pubblica: `http://localhost:8000`
- dashboard admin: `http://localhost:8000/admin?key=solo-io`

Puoi cambiare la chiave admin con:

```bash
ADMIN_KEY=una-chiave-piu-sicura python3 server.py
```

## Come funziona

1. I partecipanti aprono la home dal QR code.
2. Inseriscono average screen time in minuti.
3. Aggiungono app o categorie principali con i relativi minuti.
4. Il server salva il contributo.
5. La dashboard admin aggrega tutti i contributi e mostra il grafico.
