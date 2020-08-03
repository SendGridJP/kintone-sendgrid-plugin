# SendGrid kintoneプラグインとは
本プラグインはkintoneからSendGridを利用してメール送信するためのものです。kintone上で管理している顧客リストや会員リストなどに対して、メールを一斉送信できます。メールのテンプレートはSendGridの[Webダッシュボード](https://sendgrid.com/templates/)上で編集します。メール本文に対して宛先ごとに文字の埋め込み（宛名やクーポンコード）などを行うことができます。

# 前提条件
- [kintone](https://kintone.cybozu.com/jp/)のシステム管理権限を持ったアカウント
- [SendGrid](https://sendgrid.kke.co.jp)のアカウント
- 以下いずれかのブラウザ
  - [Google Chrome](https://www.google.com/intl/ja_jp/chrome/)
  - [mozilla firefox](https://www.mozilla.org/ja/firefox/)  
  Internet Explorerで動作させるには[旧バージョン](https://github.com/SendGridJP/kintone-sendgrid-plugin/releases/tag/10)をご利用ください。

# 利用方法

## 1. kintoneアプリの準備
本プラグインを利用するためにkintoneアプリ側では宛先アドレスを格納するフィールドが必要になります。宛先アドレスとして指定可能なフィールドは以下いずれかである必要があります。
※本プラグインはメールアドレスの形式チェックを行いません。kintone上でメールアドレスの形式チェックを行えるよう「リンク」フィールド（メールアドレス）の利用を推奨します。

- 「文字列(1行)」フィールド
- 「ラジオボタン」フィールド
- 「ドロップタウン」フィールド
- 「リンク」フィールド

## 2. プラグインのインストールと有効化

### 2-1. プラグインの読み込み
最新版のプラグインを[こちらからダウンロード](https://github.com/SendGridJP/kintone-sendgrid-plugin/blob/master/dist/plugin.zip?raw=true)して読み込みます。詳しい手順は[こちら](https://help.cybozu.com/ja/k/admin/plugin.html)を参照してください。

### 2-2. アプリへのプラグインの追加
「**アプリの設定 > 設定 > プラグイン**」からSendGridプラグインを追加します。

[![](images/15-0.png)](images/15-0.png)
[![](images/15-1.png)](images/15-1.png)

## 3. プラグインの設定
プラグインを追加したら **歯車アイコン** をクリックしてSendGridプラグインの設定画面を開きます。

[![](images/15-2.png)](images/15-2.png)

### 3-1. APIキーの設定
**共通設定** タブでSendGridのAPIキーを設定します。SendGridの[Webダッシュボード](https://app.sendgrid.com/settings/api_keys)でAPIキーを生成します。APIキーに必要なパーミッションについてはプラグインの設定画面を参照してください。生成したAPIキーを設定画面内のテキストボックスに貼り付けます。

[![](images/15-3.png)](images/15-3.png)

### 3-2. メール設定
次に、**送信設定** タブを選択します。メール設定ではFrom（メールの送信元アドレス）、From表示名、To（宛先アドレスを格納するフィールド）、To表示名、メール本文の種別（マルチパートまたはテキスト）の設定を行います。ToとTo表示名は対応するkintoneフィールドを選択します。

[![](images/15-4.png)](images/15-4.png)

### 3-3. テンプレート設定
テンプレート設定では、テンプレートの種類（DynamicまたはLegacy）、標準で使用するテンプレートを選択します。テンプレートはSendGridのダッシュボード上で編集します。詳しい手順は以下を参照してください。

- [Dynamicテンプレートの編集](https://sendgrid.kke.co.jp/docs/Tutorials/A_Transaction_Mail/using_dynamic_templates.html)
- [Legacyテンプレートの編集](https://sendgrid.kke.co.jp/docs/Tutorials/A_Transaction_Mail/using_templates.html)

テンプレート編集後、テンプレート一覧を更新してください。

[![](images/15-5.png)](images/15-5.png)

### 3-4. サンドボックスモード
サンドボックスモードを有効にすると、メール送信リクエストの内容を確認できるようになります。テンプレートの設定確認にご利用ください。サンドボックスモードを無効にするとメール送信ができるようになります。

[![](images/15-5-1.png)](images/15-5-1.png)

### 3-5. 置換設定
Legacyテンプレートを選択した場合、置換設定が利用できます。置換設定では、テンプレート上の置換用タグと対応するkintoneフィールドを指定します。この設定を利用することで、メール本文に宛先ごとに異なる文字列をkintoneのフィールドから取得して埋め込むことができます。

以下はメール本文中の「%name%」タグをkintoneの「名前」フィールドの値で置換してメール送信する例です。

[![](images/15-6.png)](images/15-6.png)

### 3-6. Dynamic Template Data設定
Dynamicテンプレートを選択した場合、Dynamic Template Data設定が利用できます。Dynamic Template Data設定では、テンプレート上のタグと対応するkintoneフィールドを指定します。この設定を利用することで、メール本文に宛先ごとに異なる文字列をkintoneのフィールドから取得して埋め込んだり、if句の条件指定やイテレータを利用することができます。

#### 3-6-1. 文字列の置換

メール本文や件名にkintoneフォールドの値を埋め込む場合、テンプレートにタグを `{{}}` でくくった文字列を埋め込みます（例： `{{name}}`）。一方、Dynamic Template Data設定では、タグとそれに対応するkintoneフィールドを選択します。以下はメール本文中の「`name`」タグをkintoneの「名前」フィールドの値で置換してメール送信する例です。

[![](images/15-6-1.png)](images/15-6-1.png)
[![](images/15-6-2.png)](images/15-6-2.png)
[![](images/15-6-3.png)](images/15-6-3.png)

#### 3-6-2. if〜else句

kintoneのデータでif~else句を制御する場合、テンプレートにタグと共にif句を記載します（例： `{{#if coupon}}` 〜 `{{/if}}`）。一方、Dynamic Template Data設定で、タグとそれに対応するkintoneフィールドを選択します。if句の制御に利用するkintoneフィールドは「ドロップダウン」を利用します。「ドロップダウン」フィールドが無選択の状態を `false` 、選択状態を `true` として扱います。「ドロップダウン」フィールドの値で制御することはできません。

[![](images/15-6-4.png)](images/15-6-4.png)
[![](images/15-6-5.png)](images/15-6-5.png)

#### 3-6-3. イテレータ

配列データを返すkintoneフィールドを指定するとイテレータが利用できます。テンプレートにタグと共にeach句を記載します（例： `{{#each albums}}` 〜 `{{/each}}`）。一方、Dynamic Template Data設定で、タグとそれに対応するkintoneフィールドを選択します。イテレータに利用することのできるkintoneフィールドは配列を返すフィールドのみです。詳しくは[kintoneのドキュメント](https://developer.cybozu.io/hc/ja/articles/202166330)をご参照ください。

[![](images/15-6-6.png)](images/15-6-6.png)
[![](images/15-6-7.png)](images/15-6-7.png)

### 3-7. 配信停止設定

配信停止設定を利用する場合、「配信停止グループを利用する」を有効化して、利用するグループ名を選択します。

[![](images/15-13.png)](images/15-13.png)

続いて、テンプレートに配信停止タグを記載します。テンプレート種別によって利用可能な配信停止タグが異なります。

#### 3-7-1. Dynamicテンプレートで配信停止タグを記載する

Dynamicテンプレートでは以下2種類の配信停止タグが利用できます。

- ワンクリック配信停止用タグ
  `{{{unsubscribe}}}`
- 配信停止管理用タグ
  `{{{unsubscribe_preferences}}}`

[![](images/15-14.png)](images/15-14.png)

#### 3-7-2. Legacyテンプレートで配信停止タグを記載する

Legacyテンプレートでは以下2種類の配信停止タグが利用できます。

- ワンクリック配信停止用タグ
  `<%asm_group_unsubscribe_raw_url%>`
- 配信停止管理用タグ
  `<%asm_preferences_raw_url%>`

[![](images/15-15.png)](images/15-15.png)

### 3-8. 設定の保存

設定が完了したら「保存」ボタンを選択して設定を保存します。

[![](images/15-7.png)](images/15-7.png)

最後にkintoneのアプリ設定を更新してください。

[![](images/15-8.png)](images/15-8.png)

## 4. メール送信

一覧画面の上部にメールテンプレートの選択ドロップダウンとメール送信ボタンが表示されるので、レコードを絞り込んでメール送信ボタンを選択します。

[![](images/15-9-0.png)](images/15-9-0.png)

### 4-1. 送信リクエストのチェック

サンドボックスモードを有効化した状態で、メール送信ボタンを選択するとサンドボックスモードの旨メッセージが表示されます。「OK」ボタンを選択するとデバッグ用にメール送信リクエストのパラメータが表示されます。さらに「OK」ボタンを選択すると、メールの送信リクエストのチェック結果を表示します。

[![](images/15-9-1.png)](images/15-9-1.png)
[![](images/15-9-2.png)](images/15-9-2.png)
[![](images/15-9-3.png)](images/15-9-3.png)
[![](images/15-9-4.png)](images/15-9-4.png)

### 4-2. メール送信

サンドボックスモードを無効化した状態でメール送信ボタンを選択すると、メール送信前に確認メッセージが表示されます。「送信」ボタンを選択することでメール送信されます。宛先フィールドが空のレコードについては送信対象外となります。一方、同じ宛先のレコードが複数指定された場合、同じ宛先に複数通送信されます。

[![](images/15-9.png)](images/15-9.png)
[![](images/15-10.png)](images/15-10.png)
[![](images/15-11.png)](images/15-11.png)

テンプレートが適用されてメール送信されます。

[![](images/15-12.png)](images/15-12.png)

配信停止設定を利用した場合、タグが配信停止リンクに置換されます。

[![](images/15-16.png)](images/15-16.png)

# ライセンス
[MITライセンス](https://github.com/SendGridJP/kintone-sendgrid-plugin/blob/master/LICENSE.txt)で提供しています。

# ソースコード
[こちらのリポジトリ](https://github.com/SendGridJP/kintone-sendgrid-plugin)にて公開しています。

# サポートとカスタマイズ
ご不明な点がございましたら、[GithubリポジトリのIssue](https://github.com/SendGridJP/kintone-sendgrid-plugin/issues)よりお問い合わせください。

機能改善や不具合修正については[Pull Request](https://github.com/SendGridJP/kintone-sendgrid-plugin/pulls)を受け付けています。ただし、機能改善については汎用的なものに限ります。プラグインのカスタマイズが必要な場合は、利用者ご自身で行なってください。その際、[plugin-sdk](https://github.com/kintone/plugin-sdk)でパッケージングする必要があります。パッケージングの手順は[こちら](https://developer.cybozu.io/hc/ja/articles/203283794)をご確認ください。

[こちらのサポート窓口](https://support.sendgrid.kke.co.jp/hc/ja)ではプラグインのサポートやカスタマイズは**承っておりません**。ご了承ください。
