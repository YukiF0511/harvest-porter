#!/bin/bash

# バージョン更新スクリプト
# 使用方法: ./update-version.sh 2.1.2 "バグ修正とパフォーマンス改善"

if [ $# -ne 2 ]; then
    echo "使用方法: $0 <バージョン番号> <更新内容>"
    echo "例: $0 2.1.2 \"バグ修正とパフォーマンス改善\""
    exit 1
fi

NEW_VERSION=$1
UPDATE_DESCRIPTION=$2

echo "🔄 バージョンを $NEW_VERSION に更新中..."

# HTMLファイルのバージョン更新
sed -i "s/v[0-9]\+\.[0-9]\+\.[0-9]\+/v$NEW_VERSION/g" index.html

# JavaScriptファイルのバージョン更新
sed -i "s/v[0-9]\+\.[0-9]\+\.[0-9]\+/v$NEW_VERSION/g" harvest-porter.js
sed -i "s/this\.version = '[0-9]\+\.[0-9]\+\.[0-9]\+'/this.version = '$NEW_VERSION'/g" harvest-porter.js

# 更新内容の更新
sed -i "s/\/\/ 更新内容: .*/\/\/ 更新内容: $UPDATE_DESCRIPTION/g" harvest-porter.js

echo "✅ バージョン更新完了!"
echo "📝 変更内容:"
echo "   - バージョン: v$NEW_VERSION"
echo "   - 更新内容: $UPDATE_DESCRIPTION"

# Gitコミット
echo "🔄 Gitコミット中..."
git add index.html harvest-porter.js
git commit -m "Update version to v$NEW_VERSION: $UPDATE_DESCRIPTION"

echo "🎉 バージョン更新とコミットが完了しました!"
