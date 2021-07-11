import * as functions from "firebase-functions";
import * as FirebaseAdmin from "firebase-admin";

import * as express from "express";
import * as cors from "cors";

import {Client, Message} from "discord.js";

const firebaseApp = FirebaseAdmin.initializeApp();
const db = firebaseApp.firestore();

const client = new Client();
const DISCORD_TOKEN: string = functions.config().discord.token;

const CMD_PREFIX = "!";
const NUM_SHARDS = 10;

// discord
client.on("ready", () => {
  if (client.user == null) {
    console.log("client.user is null");
    return;
  }
  console.log(`${client.user.tag} でログインしています。`);
});

client.on("message", async (message: Message) => {
  console.log("on message", message.content);
  if (message.author.bot) {
    return;
  }
  if (message.content.startsWith(`${CMD_PREFIX}set`)) {
    // !set :identifier :worldname
    // identifier, worldname, message.channel.id を DB に登録する
    console.log("message.channel.id", message.channel.id);
    const words = message.content.split(" ");
    console.log("words", words.length, words);
    if (words.length != 3) {
      message
          .channel
          .send("!set コマンドのパラメータが足りません。 !set :identifier :worldname");
      return;
    }
    const identifier = words[1];
    const worldname = words[2];

    // DB に登録する
    const ref = db.collection(identifier).doc("access");
    const batch = db.batch();
    batch.set(ref, {
      channel: message.channel.id,
      worldname: worldname,
      num_shards: NUM_SHARDS,
    });
    batch.commit();
    // 分散カウンタも登録
    await createCounter(ref, NUM_SHARDS);

    message.channel.send(`${worldname} を設定しました`);
  } else if (message.content.startsWith(`${CMD_PREFIX}pv`)) {
    // !pv :identifier
    const words = message.content.split(" ");
    if (words.length != 2) {
      message.channel.send("!pv コマンドのパラメータが足りません。 !pv :identifier");
      return;
    }
    const identifier = words[1];
    // DB から トータルアクセス数 を取得して返却する
    const ref = db.collection(identifier).doc("access");
    const result = await getCount(ref);
    message.channel.send(`アクセス数は ${result} です`);
  }
});
// discordへログインしてみる
client.login(DISCORD_TOKEN);

const app = express();
app.use(cors( {origin: true} ));

// 分散カウンタ
// https://firebase.google.com/docs/firestore/solutions/counters?hl=ja

// 分散カウンタ 作成
const createCounter = async (ref: any, numShards: number) => {
  const batch = db.batch();
  for (let i = 0; i < numShards; i++) {
    const shardRef = ref.collection("shards").doc(i.toString());
    const doc = await shardRef.get("count");
    // console.log("cnt", doc.exists);
    if (!doc.exists) {
      // 未定義なら追加する
      batch.set(shardRef, {count: 0});
    }
  }
  return batch.commit();
};

// 分散カウンタ カウントアップ
const incrementCounter = (db: any, ref: any, numShards: number) => {
  const shardId = Math.floor(Math.random() * numShards).toString();
  console.log("incrementCounter", shardId);
  const shardRef = ref.collection("shards").doc(shardId);
  return shardRef
      .update("count", FirebaseAdmin.firestore.FieldValue.increment(1));
};

// 分散カウンタ 合計
const getCount = (ref: any) => {
  return ref.collection("shards").get().then((snapshot: any) => {
    let totalCount = 0;
    snapshot.forEach((doc: any) => {
      totalCount += doc.data().count;
    });
    return totalCount;
  });
};

// アクセス数を記録する API
app.get("/access/:identifier", async (req, res) => {
  // discordへログインしてみる
  client.login(DISCORD_TOKEN);

  const identifier = req.params.identifier;
  // TODO identifier に一致した 入室数を増やす
  const ref = db.collection(identifier).doc("access");
  // await createCounter(ref, NUM_SHARDS);
  await incrementCounter(db, ref, NUM_SHARDS);
  const result = await getCount(ref);
  console.log("result", result);

  // TODO identifier に一致した チャンネルを取得 入室 を 通知をする
  const doc = await ref.get();
  if (doc.exists) {
    const data: any = doc.data();
    const worldname = data.worldname;
    const channelId = data.channel;
    const channel = client.channels.cache.get(channelId) as any;
    if (typeof channel != "undefined" && "send" in channel) {
      channel.send(`${worldname} に入室がありました`);
    }
  }
  // return res.status(200).json({status: "OK", result: result});

  // 動画URLに転送
  // https://drive.google.com/file/d/19_y98QgM0VSlRczNbQwUomU6OMCmai9o/view?usp=sharing
  const docsurl = "https://drive.google.com/uc?id=19_y98QgM0VSlRczNbQwUomU6OMCmai9o";
  return res.redirect(docsurl);
});

exports.api = functions
    .region("asia-northeast1")
    .https.onRequest(app);
