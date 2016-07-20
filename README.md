# parse2ncmb

[Parse.com](http://parse.com) のエクスポートデータを[ニフティクラウドmobile backend(NCMB)](http://mb.cloud.nifty.com) にインポートするためのツールです。

## 準備

* 手元に git clone します。
```
$ git clone repository
```
* 移行先のNCMBアプリの app_key/client_key を config/default.yaml に登録します。
* npm モジュールをインストールします。
```
$ npm install
```

## Parse.com のデータエクスポート

Parse.com のエクスポートデータを用意します。

* Parse.com のダッシュボードから
  * 「App Settings」
  * → 「General」
  * → 「Export app data」
  * → 「Export Data」ボタンを押します。
* 「Your app is being exported! We'll email you a link when it's ready.」というメッセージが表示されるので、登録メールアドレスにリンクが届くのを待ちます。
* メールが届いたら、そこに書かれている URL からデータをダウンロードします。
* データをダウンロードしたら、適当なディレクトリに展開します。
```
$ unzip xxxxxxxx-xxxxxxx_export.zip
```

## データインポート

parse2ncmb ディレクトリに移動して、ツールを起動します。

```
$ cd parse2ncmb
$ ./parse2ncmb <parseデータを展開したディレクトリ>
```

NCMBダッシュボードでデータが登録されていることを確認して下さい。

## Copyright
see ./LICENSE.txt




