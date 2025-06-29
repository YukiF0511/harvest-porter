# 🚜 ハーベスト・ポーター

農業経営シミュレーションゲーム

## 🎮 ゲーム概要
- 作物を植えて収穫し、お金を稼ぐ農場経営ゲーム
- トラクターを使った出荷システム
- 労働者を雇って自動化
- 手動運転ミニゲームでボーナス獲得

## 🔧 開発者向け

### バージョン管理

#### 自動バージョン更新（推奨）
```bash
# パッチバージョン更新（バグ修正）
python version-manager.py patch "バグ修正の説明"

# マイナーバージョン更新（新機能追加）
python version-manager.py minor "新機能の説明"

# メジャーバージョン更新（大幅な変更）
python version-manager.py major "大幅な変更の説明"
```

#### 手動バージョン更新
```bash
# シェルスクリプトを使用
./update-version.sh 2.1.2 "更新内容の説明"
```

#### 手動更新が必要なファイル
バージョン更新時は以下のファイルを更新してください：
1. `index.html` - バージョン表示部分
2. `harvest-porter.js` - ヘッダーコメントとversion変数
3. `CHANGELOG.md` - 更新履歴

### バージョン番号の規則
- **メジャー (X.0.0)**: 大幅な変更、互換性のない変更
- **マイナー (X.Y.0)**: 新機能追加、後方互換性あり
- **パッチ (X.Y.Z)**: バグ修正、小さな改善

## 📁 ファイル構成
```
harvest-porter/
├── index.html              # メインHTML
├── harvest-porter.js       # ゲームロジック
├── harvest-porter.css      # スタイルシート
├── version-manager.py      # バージョン管理スクリプト
├── update-version.sh       # バージョン更新スクリプト
├── CHANGELOG.md           # 更新履歴
└── README.md              # このファイル
```

## 🚀 デプロイ
1. バージョンを更新
2. 変更をコミット
3. ファイルをサーバーにアップロード

## 📝 更新履歴
詳細な更新履歴は [CHANGELOG.md](CHANGELOG.md) を参照してください。
