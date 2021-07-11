# # WorldAccessNotification

# BOT追加
下のURLにアクセスすると Discord の チャンネルにBOT が追加できます。

[WorldAccessNotification BOT を 追加する](https://discord.com/api/oauth2/authorize?client_id=863341003880923156&permissions=67584&scope=bot)

# 通知ツール使い方

BOT追加した後に いつくかコマンドで設定する必用があります。 設定は BOTを招待した チャンネルで行います。

## ワールドID の 見つけ方
cluster に ワールドをアップロードすると URLが決定されます。 

![図1](doc/img1.png)

例えばこのワールドの場合 `https://cluster.mu/w/` 以降が ワールドID です。  
この ワールドID が 各コマンド で利用するIDとなります。 

https://cluster.mu/w/e10c8416-6f4c-4f91-a606-2b07441a0583  
https://cluster.mu/w/[ワールドID]

## !set コマンド
通知を受け取るために必用な設定です。 ワールドURL を指定した場合は 自動で ワールドID と タイトルが設定されます。

```
!set [ワールドID] [ワールド名]
または
!set [ワールドのURL] 
```

## !pv コマンド
訪問者数 を 教えてもらえます。 

```
!pv [ワールドID]
```

# Unity アイテムへの設定方法

1. WAN Unityパッケージを [ココから](unity/wan.unitypackage) ダウンロードする
2. 設置したいワールドのUnityプロジェクトをひらいて インポートする
3. Assets -> t_furu -> WorldAccessNotification を開くと WAN Prefab がある
4. どこでもいいので ワールド に WAN Prefab を配置する
5. 配置した WAN を `Unpack Prefab` する
6. VideoPlayer の Source URL に したのURLを設定する  
   `https://us-central1-worldaccessnotification.cloudfunctions.net/api/access/[ワールドID]`
7. ワールドに入室してみて Discord BOT に通知が来るか確認する


# 質問 や 不明点があれば

Twitter [@t_furu](https://twitter.com/t_furu) 宛にメッセージください。  
DM よりツイートの方が 反応いいです。
