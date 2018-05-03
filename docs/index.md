# SendGrid kintoneプラグインとは
本プラグインはkintoneからSendGridを利用してメール送信するためのものです。kintone上で管理している顧客リストや会員リストなどに対して、メールを一斉送信できます。メールのテンプレートはSendGridの[Webダッシュボード](https://sendgrid.com/templates/)上で編集します。メール本文に対して宛先ごとに文字の埋め込み（宛名やクーポンコードなど）を行うことができます。

# ソースコード
[こちらのリポジトリ](https://github.com/SendGridJP/kintone-sendgrid-plugin)にて公開しています。

# ライセンス
[MITライセンス](https://github.com/SendGridJP/kintone-sendgrid-plugin/blob/master/LICENSE.txt)で提供しています。

# サポートとカスタマイズ
ご不明な点がございましたら、[GithubリポジトリのIssue](https://github.com/SendGridJP/kintone-sendgrid-plugin/issues)よりお問い合わせください。

機能改善や不具合修正については[Pull Request](https://github.com/SendGridJP/kintone-sendgrid-plugin/pulls)を受け付けています。ただし、機能改善については汎用的なものに限ります。プラグインのカスタマイズが必要な場合は、利用者ご自身で行なってください。その際、[plugin-sdk](https://github.com/kintone/plugin-sdk)でパッケージングする必要があります。パッケージングの手順は[こちら](https://developer.cybozu.io/hc/ja/articles/203283794)をご確認ください。

[こちらのサポート窓口](https://support.sendgrid.kke.co.jp/hc/ja)ではプラグインのサポートやカスタマイズは承っておりません。ご了承ください。

# 前提条件
- [kintone](https://kintone.cybozu.com/jp/)のシステム管理権限を持ったアカウント
- [SendGrid](https://sendgrid.kke.co.jp)のアカウント

# 利用方法

## 1. kintoneアプリの準備
本プラグインが動作するためにアプリ側では宛先アドレスを格納するフィールドが必要になります。宛先アドレスを格納するフィールドは次の条件を満たしている必要があります。

- 「文字列(1行)」フィールドまたは、「リンク」フィールド(入力値の種類＝メールアドレス)であること

## 2. プラグインのインストールと有効化

### 2-1. プラグインの読み込み
最新版のプラグインを[こちらからダウンロード](https://github.com/SendGridJP/kintone-sendgrid-plugin/blob/master/plugin.zip?raw=true)して読み込みます。詳しい手順は[こちら](https://help.cybozu.com/ja/k/admin/plugin.html)を参照してください。

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
次に、**送信設定** タブを選択します。メール設定ではFrom（メールの送信元アドレス）、Toフィールド（宛先アドレスを格納するフィールド）の設定を行います。

[![](images/15-4.png)](images/15-4.png)

### 3-3. テンプレート設定
テンプレート設定では、送信するメール本文のタイプ（マルチパートまたはテキスト）と、標準で使用するテンプレートを選択します。テンプレートの管理は[SendGridのダッシュボード上](https://sendgrid.com/templates)で行います。詳しい手順については[ドキュメント](https://sendgrid.kke.co.jp/docs/Tutorials/A_Transaction_Mail/using_templates.html#-Edit)を参照してください。テンプレート編集後、「**テンプレートの取得**」ボタンを選択してテンプレート選択プルダウンを更新してください。

[![](images/15-5.png)](images/15-5.png)

### 3-4. 置換設定
置換設定では、テンプレート上の置換用タグと対応するkintoneフィールドを設定できます。この設定を利用することで、メール本文に宛先ごとに異なる文字列をkintoneのフィールドから取得して埋め込むことができます。

以下はメール本文中の「%name%」タグをkintoneの姓フィールドの値で置換してメール送信する例です。

[![](images/15-6.png)](images/15-6.png)

### 3-5. 設定の保存

設定が完了したら「保存」ボタンを選択して設定を保存します。

[![](images/15-7.png)](images/15-7.png)

最後にkintoneのアプリ設定を更新してください。

[![](images/15-8.png)](images/15-8.png)

## 4. メール送信

一覧画面の上部にメールテンプレートの選択ドロップダウンとメール送信ボタンが表示されるので、レコードを絞り込んでメール送信ボタンを選択することでメール送信されます。

宛先フィールドが空のレコードについては送信対象外となります。一方、同じ宛先のレコードが複数指定された場合、同じ宛先に複数通送信されます。

[![](images/15-9.png)](images/15-9.png)

[![](images/15-10.png)](images/15-10.png)

[![](images/15-11.png)](images/15-11.png)

置換設定を行った場合、テンプレート上の置換タグが各レコードの対応するフィールドの値に置換されてメール送信されます。

[![](images/15-12.png)](images/15-12.png)
