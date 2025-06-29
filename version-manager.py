#!/usr/bin/env python3
"""
ハーベスト・ポーター バージョン管理スクリプト
使用方法: python version-manager.py [patch|minor|major] "更新内容"
"""

import re
import sys
import subprocess
from datetime import datetime

def get_current_version():
    """現在のバージョンを取得"""
    with open('harvest-porter.js', 'r', encoding='utf-8') as f:
        content = f.read()
        match = re.search(r"this\.version = '(\d+)\.(\d+)\.(\d+)'", content)
        if match:
            return tuple(map(int, match.groups()))
    return (2, 1, 1)  # デフォルト

def increment_version(current_version, increment_type):
    """バージョンを増加"""
    major, minor, patch = current_version
    
    if increment_type == 'major':
        return (major + 1, 0, 0)
    elif increment_type == 'minor':
        return (major, minor + 1, 0)
    elif increment_type == 'patch':
        return (major, minor, patch + 1)
    else:
        raise ValueError("increment_type must be 'major', 'minor', or 'patch'")

def update_files(new_version, update_description):
    """ファイルを更新"""
    version_str = f"{new_version[0]}.{new_version[1]}.{new_version[2]}"
    
    # HTMLファイル更新
    with open('index.html', 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    html_content = re.sub(r'v\d+\.\d+\.\d+', f'v{version_str}', html_content)
    
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    # JavaScriptファイル更新
    with open('harvest-porter.js', 'r', encoding='utf-8') as f:
        js_content = f.read()
    
    # バージョン番号の更新
    js_content = re.sub(r'v\d+\.\d+\.\d+', f'v{version_str}', js_content)
    js_content = re.sub(r"this\.version = '\d+\.\d+\.\d+'", f"this.version = '{version_str}'", js_content)
    
    # 更新内容の更新
    js_content = re.sub(r'// 更新内容: .*', f'// 更新内容: {update_description}', js_content)
    
    with open('harvest-porter.js', 'w', encoding='utf-8') as f:
        f.write(js_content)
    
    return version_str

def git_commit(version_str, update_description):
    """Gitコミット"""
    try:
        subprocess.run(['git', 'add', 'index.html', 'harvest-porter.js'], check=True)
        subprocess.run(['git', 'commit', '-m', f'Update version to v{version_str}: {update_description}'], check=True)
        return True
    except subprocess.CalledProcessError:
        return False

def main():
    if len(sys.argv) != 3:
        print("使用方法: python version-manager.py [patch|minor|major] \"更新内容\"")
        print("例: python version-manager.py patch \"バグ修正\"")
        print("例: python version-manager.py minor \"新機能追加\"")
        print("例: python version-manager.py major \"大幅な変更\"")
        sys.exit(1)
    
    increment_type = sys.argv[1]
    update_description = sys.argv[2]
    
    if increment_type not in ['patch', 'minor', 'major']:
        print("エラー: increment_typeは 'patch', 'minor', 'major' のいずれかである必要があります")
        sys.exit(1)
    
    # 現在のバージョンを取得
    current_version = get_current_version()
    print(f"📋 現在のバージョン: v{current_version[0]}.{current_version[1]}.{current_version[2]}")
    
    # 新しいバージョンを計算
    new_version = increment_version(current_version, increment_type)
    version_str = f"{new_version[0]}.{new_version[1]}.{new_version[2]}"
    
    print(f"🔄 新しいバージョン: v{version_str}")
    print(f"📝 更新内容: {update_description}")
    
    # ファイルを更新
    print("🔄 ファイルを更新中...")
    update_files(new_version, update_description)
    
    # Gitコミット
    print("🔄 Gitコミット中...")
    if git_commit(version_str, update_description):
        print("✅ バージョン更新とコミットが完了しました!")
        print(f"🎉 v{version_str} リリース準備完了!")
    else:
        print("⚠️  Gitコミットに失敗しました。手動でコミットしてください。")

if __name__ == "__main__":
    main()
