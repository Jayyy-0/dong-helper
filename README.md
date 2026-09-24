# Dong Helper

ベトナムドンの換算・出すお札・適正価格チェック・割り勘ツール(英語/日本語、INR/AUD/JPY/USD)。
GitHub Pagesで無料公開でき、レートはGitHub Actionsで毎日自動更新されます。

## ファイル構成

| ファイル | 役割 |
|---|---|
| `index.html` / `app.js` / `style.css` | ツール本体 |
| `config.js` | **収益化の設定はここだけ**(アフィリエイトURL、GoatCounter) |
| `shared.js` | アフィリエイトリンクの差し替え・クリック計測 |
| `rates.json` | 為替レート(毎日自動で上書き) |
| `scripts/update_rates.py` | レート取得スクリプト(予備API・異常値チェック付き) |
| `.github/workflows/update-rates.yml` | 毎日 07:00(ベトナム時間)に実行 |
| `ja/index.html` | 日本語版のトップ(`python scripts/build_ja.py` で `index.html` から自動生成。直接編集しない) |
| `guides/*.html`, `ja/vietnam-okane.html` | 検索流入用のガイド記事 |
| `sw.js`, `manifest.webmanifest` | オフライン対応・ホーム画面追加 |
| `privacy.html` | プライバシーポリシー(連絡先を書き換える) |
| `sitemap.xml`, `robots.txt` | `YOUR-DOMAIN` を公開URLに置き換える |

## 公開手順

1. GitHubで公開(Public)リポジトリ `dong-helper` を作る
2. このフォルダの中身をすべてアップロード(`.github` フォルダも含む)
3. Settings → Pages → Branch を `main` / `(root)` にして保存
4. Actions タブ → 「Update exchange rates」→「Run workflow」で初回実行
5. 数分後 `https://ユーザー名.github.io/dong-helper/` で公開

Claude Code を使う場合は、このフォルダで
「このフォルダをGitHubリポジトリにしてGitHub Pagesで公開して」と頼めば、ほぼ任せられます。

## 収益化の設定

1. 各アフィリエイトに登録し、発行されたリンクを `config.js` の `url` に貼る
2. [GoatCounter](https://www.goatcounter.com/) に無料登録し、コードを `config.js` の `goatcounter` に入れる
   → アフィリエイトのクリック数(`aff-airalo` など)、共有、ホーム画面追加が計測されます
3. 独自ドメインを取ったら `siteUrl`、`sitemap.xml`、`robots.txt` を更新
4. AdSenseは独自ドメインで審査に通ってから、`index.html` のコメント部分を外す

詳しい戦略は `MONETIZATION.md` を参照。

## 価格データの更新

`app.js` の `ITEMS` に「一般的な価格 [下限, 上限, これを超えたら高すぎ]」が入っています。
現地で実際に払った値段をもとに更新してください。この“新しくて正確な相場”が、他の換算アプリとの一番の差になります。

## ローカル確認

`index.html` を直接開くとレートの読み込みだけ失敗し、内蔵レートで動きます。
正しく確認するには、何らかのローカルサーバー(例: `python -m http.server`)で開いてください。

## 出典

為替レート: [ExchangeRate-API](https://www.exchangerate-api.com)(無料版は出典表示が条件。フッターに記載済み)、
予備: [fawazahmed0/currency-api](https://github.com/fawazahmed0/exchange-api)
