#! /usr/bin/env node
const ora = require("ora");
const fs = require("fs/promises");
const path = require("path");
const axios = require("axios");
const crypto = require("crypto");
const inquirer = require("inquirer");

const API = "https://fanyi-api.baidu.com/api/trans/vip/translate";
const APPID = "20180531000170065";
const random = Math.random().toString();

function createSign(value, random) {
  const APPSECRET = "uyYDBl5MJFTxXuE5pWuf";
  return crypto
    .createHash("md5")
    .update(`${APPID}${value}${random}${APPSECRET}`)
    .digest("hex");
}
// 获取npm命令 用户指定的文件夹名参数npm adduser

const argv = process.argv[process.argv.length - 1];

const basePath = argv.replace(/-/g, "");

// 获取用户指定语种
const designatedLanguage = async () => {
  const targetLanguage = await inquirer.prompt([
    {
      message: "🕵️‍♀️：请选择☝ 你要翻译的✨目标语言✨", // 问题
      type: "list", // 回答问题的方式
      name: "target_lang", // 表单的name
      // 表单的value
      choices: [
        { name: "中文🚀", value: "zh" },
        { name: "英语🍀", value: "en" },
      ],
    },
  ]);
  return targetLanguage;
};

// 生成翻译函数
const translate = async (language) => {
  const files = await fs.readdir(basePath).catch((error) => {
    console.log(error);
  });
  console.log(basePath);

  const fileExtnameMap = {};
  files.forEach((item) => {
    const extname = path.extname(item);
    fileExtnameMap[item.replace(extname, "")] = extname;
  });
  const q = Object.keys(fileExtnameMap).join("\n");

  const spinner = ora("正在翻译 🏃‍♀️ 🏃‍♀️ 🏃‍♀️");

  spinner.start();

  const res = await axios
    .get(API, {
      params: {
        q,
        from: "auto",
        to: language,
        appid: APPID,
        salt: random,
        sign: createSign(q, random),
      },
    })
    .catch((error) => {
      console.log(error);
    })
    .finally(() => spinner.stop());
  console.log(res.data.trans_result);
  res.data.trans_result.forEach(({ src, dst }) => {
    const extname = fileExtnameMap[src];
    fs.rename(
      path.join(basePath, `${src}${extname}`),
      path.join(basePath, `${dst}${extname}`.replace(/\s/g, "_").toLowerCase())
    );
  });
};

if (argv.split(".")[0] == "--") {
  // 如果命令参数不是 '--' 报错提示正确输入命令

  console.log();
  (async () => {
    // 获取用户选择语种
    const targetLanguage = await designatedLanguage();
    console.log(targetLanguage.target_lang);
    // 调用翻译函数
    translate(targetLanguage.target_lang);
  })();
} else {
  console.log("☝ ☝ ☝   输入指令不正确！！！");
}
