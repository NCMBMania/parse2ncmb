# parse2ncmb

[Parse.com](http://parse.com) のエクスポートデータを[ニフティクラウドmobile backend(NCMB)](http://mb.cloud.nifty.com) にインポートするためのツールです。

## 準備

* 手元に git clone します。
```
$ git clone git@github.com:NCMBMania/parse2ncmb.git
```
* 移行先のNCMBアプリの app_key/client_key を config/default.yaml に登録します。
  * config-dist.yaml に雛形がありますので、それをコピーして使うと良いでしょう。
```
$ cd parse2ncmb/config
$ cp config-dist.yaml config.yaml
$ vi config.yaml
```
* npm モジュールをインストールします。
```
$ cd ..
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

### DataObject のインポート

オブジェクトIDの変換処理のために2段階に分けて実行します。
まずはID変換の必要のない DataObject 等のインポートを行います。

```
$ cd parse2ncmb
$ ./parse2ncmb --phase 1 <parseデータを展開したディレクトリ>
```

### Relation, Pointer のインポート

次にID変換の必要なリレーション、ポインター等のインポートを行います。

```
$ cd parse2ncmb
$ ./parse2ncmb --phase 2 <parseデータを展開したディレクトリ>
```

NCMBダッシュボードでデータが登録されていることを確認して下さい。

## 制限事項

### ポインタについて
 Parse のデータモデルでは一つのプロパティに複数のポインタを登録できますが、NCMB では一つのプロパティに登録できるポインタは一つのみです。変換元データに複数のポインタがあった場合は、最初のデータのみポインタとして登録します。

## ユーザへのポインタについて
ユーザ情報へのポインタは現時点ではサポートしていません。これは NCMB では標準でユーザ情報に本人のみ読み書き可という ACL が設定されており、ポインタの登録ができないためです。

## Copyright
see ./LICENSE.txt




