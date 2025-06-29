// 最小限のゲームクラス（テスト用）
class HarvestPorterGame {
    constructor() {
        console.log('ゲーム初期化開始');
        this.money = 1000;
        this.bankruptcyEnabled = false;
        this.isGameOver = false;
        
        this.fields = [
            { id: 0, state: 'empty', crop: null, plantTime: 0, growthTime: 0 }
        ];
        
        this.tractors = [
            { id: 0, capacity: 10, currentLoad: 0, state: 'idle', returnTime: 0, roundTripTime: 8000 }
        ];
        
        this.ownedSeeds = ['apple', 'orange'];
        this.selectedSeedType = 'apple';
        
        this.cropData = {
            apple: { name: 'りんご', icon: '🍎', seedPrice: 50, growthTime: 10000, sellPrice: 80, unlocked: true },
            orange: { name: 'みかん', icon: '🍊', seedPrice: 30, growthTime: 8000, sellPrice: 50, unlocked: true }
        };
        
        console.log('ゲーム初期化完了');
        this.init();
    }
    
    init() {
        console.log('init開始');
        this.updateDisplay();
        console.log('init完了');
    }
    
    updateDisplay() {
        const moneyElement = document.getElementById('money');
        if (moneyElement) {
            moneyElement.textContent = this.money;
        }
    }
    
    showNotification(message, type = 'info') {
        console.log(`通知: ${message} (${type})`);
    }
}

// ゲーム初期化
let game;
window.addEventListener('load', () => {
    console.log('ページ読み込み完了');
    try {
        game = new HarvestPorterGame();
        console.log('ゲームインスタンス作成成功');
    } catch (error) {
        console.error('ゲームインスタンス作成エラー:', error);
    }
});

console.log('JavaScriptファイル読み込み完了');
