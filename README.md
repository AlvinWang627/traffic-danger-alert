# 交通危險警示 App

這是一個使用 React Native Expo (TypeScript) 開發的交通危險警示 App，可以即時監測使用者位置是否接近已知的危險路段，並提供警示。

## 功能特點

- 即時位置追蹤
- 危險路段警示
- 背景運作支援
- 自定義警示距離
- 震動和聲音提醒

## 技術規格

- 框架：React Native Expo
- 語言：TypeScript
- 目標平台：Android
- 發布目標：Google Play Store

## 開發環境需求

- Node.js (v14 或更新版本)
- npm 或 yarn
- Expo CLI
- Android Studio
- Android SDK

## 安裝步驟

1. 克隆專案
```bash
git clone [repository-url]
cd traffic-danger-alert
```

2. 安裝依賴
```bash
npm install
# 或
yarn install
```

3. 啟動開發伺服器
```bash
npm start
# 或
yarn start
```

## 專案結構

```
src/
├── components/         # UI 元件
├── screens/           # 畫面
├── services/          # 服務層
├── utils/             # 工具函數
├── types/             # TypeScript 型別定義
├── constants/         # 常數定義
└── assets/            # 靜態資源
```

## 使用說明

1. 開啟 App
2. 授予位置權限
3. 點擊「開始偵測」按鈕
4. 當接近危險路段時，App 會發出震動和聲音提醒
5. 抵達目的地後，點擊「完成」按鈕停止偵測

## 設定選項

- 警示距離：可調整警示觸發的距離（預設 100 公尺）
- 震動提醒：開啟/關閉震動功能
- 聲音提醒：開啟/關閉聲音提醒
- 背景運作：設定是否在背景持續運作

## 開發者文件

詳細的開發文件請參考 `docs/design.md`。

## 授權

[授權資訊]

## 聯絡方式

[聯絡資訊]
