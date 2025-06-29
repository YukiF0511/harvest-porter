# 🚜 ハーベスト・ポーター (Harvest Porter)

**農業経営シミュレーションゲーム** - ブラウザで楽しめる本格的な農場経営体験

[![Version](https://img.shields.io/badge/version-v2.1.2-green.svg)](https://github.com/your-username/harvest-porter)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Language](https://img.shields.io/badge/language-JavaScript-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

## 🌟 特徴

### 🎮 ゲーム概要
- **作物栽培**: 8種類の作物を植えて収穫し、お金を稼ぐ
- **トラクターシステム**: 効率的な出荷で収益を最大化
- **労働者雇用**: 自動化で効率的な農場経営
- **手動運転ミニゲーム**: スキルに応じたボーナス獲得
- **難易度調整**: 貨物価値に応じた挑戦的なゲームプレイ

### 🚀 主要機能

#### 🌱 作物システム
- **8種類の作物**: りんご、みかん、バナナ、ぶどう、いちご、すいか、とうもろこし、トマト
- **成長時間**: 作物ごとに異なる成長サイクル
- **価格変動**: 作物ごとの収益性を考慮した戦略的栽培

#### 🚜 トラクターシステム
- **自動出荷**: 効率的な作物配送システム
- **手動運転**: ミニゲームで追加ボーナス獲得
- **難易度スケーリング**: 貨物価値に応じた操作難易度
- **お金アイテム**: 運転中に💰を拾ってボーナス獲得

#### 👥 労働者システム
- **3種類の労働者**:
  - 🌾 **植え付け作業員**: 自動で種を植える
  - 🧺 **収穫作業員**: 自動で作物を収穫
  - 🚛 **トラクター運転手**: 満タン時に自動出荷

#### 💰 経済システム
- **破産システム**: リアルな経営の緊張感
- **給料支払い**: 労働者への定期的な賃金支払い
- **投資戦略**: 効率的な設備投資と人材配置

## 🎯 ゲームプレイ

### 基本的な流れ
1. **種を植える** - 畑に作物の種を植える
2. **成長を待つ** - 作物が育つまで待機
3. **収穫する** - 育った作物を収穫
4. **出荷する** - トラクターで市場に出荷
5. **利益で拡大** - 得た収益で農場を拡大

### 戦略要素
- **作物選択**: 成長時間と収益のバランス
- **労働者配置**: 自動化による効率化
- **トラクター運用**: 手動 vs 自動の収益比較
- **資金管理**: 投資タイミングの最適化

## 🛠️ 技術仕様

### 使用技術
- **HTML5**: セマンティックなマークアップ
- **CSS3**: レスポンシブデザイン、アニメーション
- **JavaScript (ES6+)**: モダンな言語機能を活用
- **Canvas API**: 手動運転ミニゲーム
- **LocalStorage**: セーブデータの永続化

### 対応環境
- **デスクトップ**: Chrome, Firefox, Safari, Edge
- **モバイル**: iOS Safari, Android Chrome
- **タブレット**: iPad, Android タブレット

## 🚀 クイックスタート

### 1. リポジトリをクローン
```bash
git clone https://github.com/your-username/harvest-porter.git
cd harvest-porter
```

### 2. ローカルサーバーで起動
```bash
# Python 3の場合
python3 -m http.server 8000

# Node.jsの場合
npx serve .

# VS Code Live Server拡張機能を使用
# または直接index.htmlをブラウザで開く
```

### 3. ブラウザでアクセス
```
http://localhost:8000
```

## 🔧 開発者向け

### バージョン管理

#### 自動バージョン更新（推奨）
```bash
# パッチバージョン更新（バグ修正）
python3 version-manager.py patch "バグ修正の説明"

# マイナーバージョン更新（新機能追加）
python3 version-manager.py minor "新機能の説明"

# メジャーバージョン更新（大幅な変更）
python3 version-manager.py major "大幅な変更の説明"
```

#### 手動バージョン更新
```bash
# シェルスクリプトを使用
./update-version.sh 2.1.3 "更新内容の説明"
```

### ファイル構成
```
harvest-porter/
├── index.html              # メインHTML
├── harvest-porter.js       # ゲームロジック (1800+ lines)
├── harvest-porter.css      # スタイルシート
├── version-manager.py      # バージョン管理スクリプト
├── update-version.sh       # バージョン更新スクリプト
├── CHANGELOG.md           # 更新履歴
└── README.md              # このファイル
```

### コード品質
- **モジュラー設計**: 機能ごとに整理されたコード構造
- **エラーハンドリング**: 堅牢なエラー処理
- **デバッグ機能**: 開発者向けコンソールログ
- **セーブデータ互換性**: 後方互換性を保持

## 📱 スクリーンショット

### メイン画面
- 直感的なUI/UX
- レスポンシブデザイン
- リアルタイム更新

### トラクターミニゲーム
- Canvas APIを使用した滑らかなアニメーション
- 難易度調整システム
- 収集要素とボーナスシステム

## 🎯 今後の予定

### v2.2.0 予定機能
- [ ] 新しい作物の追加
- [ ] 天候システム
- [ ] 市場価格変動
- [ ] 実績システム

### v3.0.0 予定機能
- [ ] マルチプレイヤー機能
- [ ] 農場カスタマイズ
- [ ] イベントシステム
- [ ] データ分析ダッシュボード

## 🤝 コントリビューション

プルリクエストやイシューの報告を歓迎します！

### 開発に参加する方法
1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

### バグレポート
- [Issues](https://github.com/your-username/harvest-porter/issues) でバグを報告
- 再現手順を詳しく記載してください

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルを参照してください。

## 📞 サポート

- **Issues**: [GitHub Issues](https://github.com/your-username/harvest-porter/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/harvest-porter/discussions)

## 🙏 謝辞

- ゲームアイデアとフィードバックを提供してくれたコミュニティの皆様
- オープンソースライブラリの開発者の皆様

---

**🎮 今すぐプレイして、あなたの農場帝国を築き上げましょう！**
