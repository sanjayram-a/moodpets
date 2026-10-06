# Moodpets

Type a sentence; after 1 s of silence the server predicts the emotion (GoEmotions, 27 + neutral) and a dog or sheep shows it.

- `ml/train.py` – trains TF-IDF (1–2 grams, 30k features) + one-vs-rest logistic regression on CPU and exports weights to `web/model/`.
- `web/` – Next.js app. `POST /api/predict` scores the text in pure TypeScript (no Python, torch or ONNX at runtime).

```
# retrain (optional, ~10 s)
cd ml && python train.py
# run
cd web && npm install && npm run dev      # http://localhost:3000
npm test                                  # model sanity tests
```
