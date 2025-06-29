// ハーベスト・ポーター v2.1.1
// 農業経営シミュレーションゲーム
// 更新内容: トラクター操作画面のエラー修正、cargo初期化処理改善

console.log('🚜 ハーベスト・ポーター v2.1.1 読み込み完了');

// 最小限のゲームクラス（テスト用）
class HarvestPorterGame {
    constructor() {
        console.log('ゲーム初期化開始');
        this.version = '2.1.1';
        this.money = 1000;
        this.bankruptcyEnabled = false;
        this.isGameOver = false;
        
        this.fields = [
            { id: 0, state: 'empty', crop: null, plantTime: 0, growthTime: 0 },
            { id: 1, state: 'empty', crop: null, plantTime: 0, growthTime: 0 },
            { id: 2, state: 'empty', crop: null, plantTime: 0, growthTime: 0 },
            { id: 3, state: 'empty', crop: null, plantTime: 0, growthTime: 0 },
            { id: 4, state: 'empty', crop: null, plantTime: 0, growthTime: 0 }
        ];
        
        this.tractors = [
            { id: 0, capacity: 10, currentLoad: 0, state: 'idle', returnTime: 0, roundTripTime: 8000, cargo: [] }
        ];
        
        this.ownedSeeds = ['apple', 'orange'];
        this.selectedSeedType = 'apple';
        
        // 倍速設定を追加
        this.gameSpeed = 1;
        this.speedMultiplier = 1;
        
        // 労働者システムを追加
        this.workers = [];
        this.currentWorkerId = 0;
        this.workerTypes = {
            planter: {
                name: 'うえてさん',
                icon: '👨‍🌾',
                hireCost: 200,
                wageCost: 50,
                description: 'じどうてきにたねをうえます'
            },
            harvester: {
                name: 'しゅうかくさん',
                icon: '👩‍🌾',
                hireCost: 300,
                wageCost: 60,
                description: 'じどうてきにしゅうかくします'
            },
            driver: {
                name: 'うんてんしゅさん',
                icon: '🚛',
                hireCost: 500,
                wageCost: 80,
                description: 'まんたんのトラクターをじどうしゅっかします'
            }
        };
        
        console.log('労働者タイプが初期化されました:', Object.keys(this.workerTypes));
        
        this.cropData = {
            apple: { name: 'りんご', icon: '🍎', seedPrice: 50, growthTime: 10000, sellPrice: 80, unlocked: true },
            orange: { name: 'みかん', icon: '🍊', seedPrice: 30, growthTime: 8000, sellPrice: 50, unlocked: true },
            banana: { name: 'バナナ', icon: '🍌', seedPrice: 80, growthTime: 12000, sellPrice: 120, unlocked: false },
            grape: { name: 'ぶどう', icon: '🍇', seedPrice: 100, growthTime: 15000, sellPrice: 150, unlocked: false },
            strawberry: { name: 'いちご', icon: '🍓', seedPrice: 60, growthTime: 9000, sellPrice: 90, unlocked: false },
            watermelon: { name: 'すいか', icon: '🍉', seedPrice: 150, growthTime: 20000, sellPrice: 250, unlocked: false },
            corn: { name: 'とうもろこし', icon: '🌽', seedPrice: 40, growthTime: 11000, sellPrice: 70, unlocked: false },
            tomato: { name: 'トマト', icon: '🍅', seedPrice: 35, growthTime: 7000, sellPrice: 60, unlocked: false }
        };
        
        console.log('ゲーム初期化完了');
        this.init();
    }
    
    init() {
        console.log('init開始');
        this.loadGame(); // セーブデータを読み込み
        
        // 既存のトラクターにcargoプロパティを確実に追加
        this.tractors.forEach(tractor => {
            if (!tractor.cargo) {
                tractor.cargo = [];
                console.log(`トラクター#${tractor.id}にcargoプロパティを追加`);
            }
        });
        
        this.updateDisplay();
        this.renderFields(); // 畑の表示を追加
        this.renderTractors(); // トラクターの表示を追加
        this.renderSeedSelector(); // 種選択の表示を追加
        this.renderWorkers(); // 労働者の表示を追加
        this.updateBankruptcyToggleButton(); // 破産システムボタンの表示を更新
        this.startGameLoop(); // ゲームループを開始
        console.log('init完了');
    }
    
    // ゲームループ
    startGameLoop() {
        setInterval(() => {
            this.updateTractors();
            this.updateWorkers(); // 労働者の処理を追加
            this.renderTractors(); // トラクター表示を定期更新
        }, 1000); // 1秒ごとに更新
        
        // 自動セーブ（30秒ごと）
        setInterval(() => {
            this.saveGame(false); // 自動セーブでは通知を表示しない
        }, 30000);
        
        // 給料支払い（60秒ごと）
        setInterval(() => {
            this.payWages();
        }, 60000);
        
        // バージョン情報を表示
        this.showVersionInfo();
    }
    
    // バージョン情報表示
    showVersionInfo() {
        console.log(`%c🚜 ハーベスト・ポーター v${this.version}`, 'color: #2d4a22; font-size: 16px; font-weight: bold;');
        console.log('更新内容: トラクター操作難易度調整、お金アイテム追加、トラクター運転手改善');
        
        // 初回起動時のみ通知を表示
        if (!localStorage.getItem('harvestPorterVersionShown_' + this.version)) {
            setTimeout(() => {
                this.showNotification(`🎉 v${this.version} にアップデート！新機能が追加されました`, 'info');
            }, 2000);
            localStorage.setItem('harvestPorterVersionShown_' + this.version, 'true');
        }
    }
    
    // トラクター状態更新
    updateTractors() {
        this.tractors.forEach(tractor => {
            if (tractor.state === 'transporting' && tractor.returnTime <= Date.now()) {
                // 出荷完了処理は既にsetTimeoutで処理されているので、ここでは状態チェックのみ
                // 表示更新のためのトリガー
            }
        });
    }
    
    updateDisplay() {
        const moneyElement = document.getElementById('money');
        if (moneyElement) {
            moneyElement.textContent = this.money;
        }
    }
    
    // 畑の表示機能（元のデザインを復元）
    renderFields() {
        const container = document.getElementById('fields-container');
        if (!container) {
            console.log('fields-container が見つかりません');
            return;
        }
        
        // 既存の畑要素を更新するか、新しく作成する
        this.fields.forEach(field => {
            let fieldElement = container.querySelector(`[data-field-id="${field.id}"]`);
            
            if (!fieldElement) {
                // 新しい畑要素を作成
                fieldElement = document.createElement('div');
                fieldElement.dataset.fieldId = field.id;
                // イベントリスナーを一度だけ設定
                fieldElement.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.handleFieldClick(field.id);
                });
                container.appendChild(fieldElement);
            }
            
            // クラス名を更新
            fieldElement.className = `field ${field.state}`;
            
            let content = '';
            let progressBar = '';
            
            switch (field.state) {
                case 'empty':
                    content = '<div class="field-content">➕</div>';
                    break;
                case 'planted':
                    const crop = this.cropData[field.crop];
                    const elapsed = Date.now() - field.plantTime;
                    const progress = Math.min((elapsed / field.growthTime) * 100, 100);
                    content = `<div class="field-content">${crop.icon}</div>`;
                    progressBar = `
                        <div class="field-progress">
                            <div class="progress-bar" style="width: ${progress}%"></div>
                        </div>
                    `;
                    break;
                case 'ready':
                    const readyCrop = this.cropData[field.crop];
                    content = `
                        <div class="harvest-arrow">⬇️</div>
                        <div class="field-content">${readyCrop.icon}</div>
                    `;
                    break;
            }
            
            fieldElement.innerHTML = content + progressBar;
        });
        
        console.log('畑の表示完了（元のデザイン）');
    }
    
    // トラクターの表示機能
    renderTractors() {
        const container = document.getElementById('tractors-container');
        if (!container) {
            console.log('tractors-container が見つかりません');
            return;
        }
        
        container.innerHTML = '';
        
        this.tractors.forEach(tractor => {
            const tractorElement = document.createElement('div');
            tractorElement.className = `tractor ${tractor.state}`;
            
            const capacityPercent = (tractor.currentLoad / tractor.capacity) * 100;
            let statusText = tractor.state === 'idle' ? 'たいきちゅう' : 'うんぱんちゅう';
            let timerText = '';
            let controlButton = '';
            
            console.log(`トラクター #${tractor.id + 1} - 状態: ${tractor.state}, 積載: ${tractor.currentLoad}/${tractor.capacity}`);
            
            if (tractor.state === 'transporting') {
                const remaining = Math.max(0, tractor.returnTime - Date.now());
                const seconds = Math.ceil(remaining / 1000);
                timerText = `<div class="timer">⏰ もどるまで: ${seconds}びょう</div>`;
            } else if (tractor.currentLoad > 0) {
                // 積載がある待機中のトラクターには操作ボタンを表示
                controlButton = `<button class="tractor-control-btn" onclick="openTractorControl(${tractor.id})">🎮 そうさ (${tractor.currentLoad}こ)</button>`;
                console.log('操作ボタンを表示:', tractor.id, tractor.currentLoad);
            } else {
                // 空の待機中トラクター
                controlButton = `<div class="tractor-empty">つみにがありません</div>`;
            }
            
            tractorElement.innerHTML = `
                <div class="tractor-header">
                    <span>🚜 トラクター #${tractor.id + 1}</span>
                    <span class="tractor-status ${tractor.state}">${statusText}</span>
                </div>
                <div class="capacity-bar">
                    <div class="capacity-fill" style="width: ${capacityPercent}%">
                        ${tractor.currentLoad}/${tractor.capacity}
                    </div>
                </div>
                ${timerText}
                ${controlButton}
            `;
            
            container.appendChild(tractorElement);
        });
        
        console.log('トラクターの表示完了');
    }
    
    // 種選択機能
    renderSeedSelector() {
        const container = document.getElementById('seed-selector');
        if (!container) {
            console.log('seed-selector が見つかりません');
            return;
        }
        
        container.innerHTML = '';
        
        console.log('種選択UI描画:', this.ownedSeeds, '選択中:', this.selectedSeedType);
        
        this.ownedSeeds.forEach(seedKey => {
            const crop = this.cropData[seedKey];
            const option = document.createElement('div');
            const isSelected = seedKey === this.selectedSeedType;
            option.className = `seed-selector-option ${isSelected ? 'selected' : ''}`;
            option.dataset.seed = seedKey;
            
            console.log(`種オプション作成: ${seedKey}, 選択状態: ${isSelected}`);
            
            // イベントリスナーを使用してクリック処理を改善
            option.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('種オプションクリック:', seedKey);
                this.selectSeedType(seedKey);
            });
            
            option.innerHTML = `
                <div class="seed-icon">${crop.icon}</div>
                <div class="seed-info">
                    <div class="seed-name">${crop.name}</div>
                    <div class="seed-price">${crop.seedPrice} G</div>
                </div>
            `;
            
            container.appendChild(option);
        });
        
        console.log('種選択の表示完了');
    }
    
    // 種選択処理
    selectSeedType(seedKey) {
        console.log('種選択:', seedKey);
        this.selectedSeedType = seedKey;
        this.renderSeedSelector(); // 表示を更新
        
        const crop = this.cropData[seedKey];
        this.showNotification(`${crop.icon} ${crop.name}をえらびました`, 'info');
    }
    
    // 畑クリック処理
    handleFieldClick(fieldId) {
        const field = this.fields[fieldId];
        console.log(`畑 ${fieldId} がクリックされました。状態: ${field.state}`);
        
        if (field.state === 'empty') {
            // 空の畑の場合、種を植える
            this.plantSeed(fieldId);
        } else if (field.state === 'ready') {
            // 収穫可能な場合、収穫する
            this.harvestField(fieldId);
        } else {
            this.showNotification('まだしゅうかくできません', 'info');
        }
    }
    
    // 種植え機能
    plantSeed(fieldId) {
        const field = this.fields[fieldId];
        const crop = this.cropData[this.selectedSeedType];
        
        if (this.money >= crop.seedPrice) {
            this.money -= crop.seedPrice;
            field.state = 'planted';
            field.crop = this.selectedSeedType;
            field.plantTime = Date.now();
            field.growthTime = crop.growthTime;
            
            this.showNotification(`${crop.name}のたねをうえました！`, 'success');
            this.updateDisplay();
            this.renderFields();
            
            // 成長タイマーを開始（倍速を適用）
            const adjustedGrowthTime = crop.growthTime / this.speedMultiplier;
            setTimeout(() => {
                this.growCrop(fieldId);
            }, adjustedGrowthTime);
            
        } else {
            this.showNotification('おかねがたりません！', 'error');
        }
    }
    
    // 作物成長処理
    growCrop(fieldId) {
        const field = this.fields[fieldId];
        if (field.state === 'planted') {
            field.state = 'ready';
            const crop = this.cropData[field.crop];
            this.showNotification(`🌾 ${crop.name}がしゅうかくできるようになりました！`, 'success');
            this.renderFields();
        }
    }
    
    // 収穫機能
    harvestField(fieldId) {
        const field = this.fields[fieldId];
        const crop = this.cropData[field.crop];
        
        console.log('収穫開始:', fieldId, crop.name);
        console.log('収穫前のトラクター状態:', this.tractors);
        
        // 利用可能なトラクターを探す
        const availableTractor = this.tractors.find(t => t.state === 'idle' && t.currentLoad < t.capacity);
        console.log('利用可能なトラクター:', availableTractor);
        
        if (availableTractor) {
            // トラクターに積み込み
            availableTractor.currentLoad += 1;
            availableTractor.cargo.push({
                cropType: field.crop,
                sellPrice: crop.sellPrice
            });
            console.log('トラクターに積み込み完了。新しい積載量:', availableTractor.currentLoad);
            console.log('積載内容:', availableTractor.cargo);
            
            // 畑をリセット
            field.state = 'empty';
            field.crop = null;
            field.plantTime = 0;
            field.growthTime = 0;
            
            this.showNotification(`✅ ${crop.name}をしゅうかくしました！トラクターにつみこみました`, 'success');
            
            // トラクターが満載になったら自動出荷の提案または自動実行
            if (availableTractor.currentLoad >= availableTractor.capacity) {
                // トラクター運転手がいるかチェック
                const driverWorker = this.workers.find(w => w.type === 'driver' && w.isActive);
                if (driverWorker) {
                    // 運転手がいる場合は自動出荷
                    this.startSimpleDelivery(availableTractor.id);
                    this.showNotification(`🚛 運転手がトラクターを自動出荷しました！`, 'success');
                } else {
                    // 運転手がいない場合は手動操作を促す
                    this.showNotification(`🚜 トラクターがまんさいです！そうさしてしゅっかしましょう`, 'info');
                }
            }
        } else {
            console.log('利用可能なトラクターがないため直接販売');
            // トラクターが利用できない場合は直接販売
            this.money += crop.sellPrice;
            
            field.state = 'empty';
            field.crop = null;
            field.plantTime = 0;
            field.growthTime = 0;
            
            this.showNotification(`✅ ${crop.name}をしゅうかくしました！ +${crop.sellPrice}G`, 'success');
        }
        
        console.log('収穫後のトラクター状態:', this.tractors);
        
        this.updateDisplay();
        this.renderFields();
        this.renderTractors(); // トラクター表示を更新
    }
    
    showNotification(message, type = 'info') {
        console.log(`通知: ${message} (${type})`);
        
        // 通知表示機能を追加
        const container = document.getElementById('notification-container');
        if (container) {
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.textContent = message;
            
            // セーブ通知の場合は特別なスタイルを追加
            if (message.includes('ほぞん')) {
                notification.classList.add('save-notification');
                notification.innerHTML = `
                    <div class="notification-icon">💾</div>
                    <div class="notification-text">${message}</div>
                `;
            }
            
            container.appendChild(notification);
            
            // セーブ通知は5秒、その他は3秒で削除
            const displayTime = message.includes('ほぞん') ? 5000 : 3000;
            setTimeout(() => {
                if (container.contains(notification)) {
                    notification.classList.add('fade-out');
                    setTimeout(() => {
                        if (container.contains(notification)) {
                            container.removeChild(notification);
                        }
                    }, 300);
                }
            }, displayTime);
        }
    }
    
    // HTMLから呼び出される関数を追加
    saveGame(showNotification = true) {
        const saveData = {
            money: this.money,
            fields: this.fields,
            tractors: this.tractors,
            workers: this.workers,
            currentWorkerId: this.currentWorkerId,
            ownedSeeds: this.ownedSeeds,
            selectedSeedType: this.selectedSeedType,
            bankruptcyEnabled: this.bankruptcyEnabled,
            gameSpeed: this.gameSpeed,
            speedMultiplier: this.speedMultiplier,
            saveTime: Date.now()
        };
        
        try {
            localStorage.setItem('harvestPorterSave', JSON.stringify(saveData));
            if (showNotification) {
                this.showNotification('💾 ゲームをほぞんしました！', 'success');
                console.log('手動セーブ完了:', saveData);
            } else {
                console.log('自動セーブ完了');
            }
        } catch (error) {
            console.error('セーブエラー:', error);
            if (showNotification) {
                this.showNotification('❌ セーブにしっぱいしました', 'error');
            }
        }
    }
    
    loadGame() {
        try {
            const saveData = localStorage.getItem('harvestPorterSave');
            if (saveData) {
                const data = JSON.parse(saveData);
                console.log('ロードデータ:', data);
                
                // データを復元
                this.money = data.money || 1000;
                this.fields = data.fields || [
                    { id: 0, state: 'empty', crop: null, plantTime: 0, growthTime: 0 },
                    { id: 1, state: 'empty', crop: null, plantTime: 0, growthTime: 0 },
                    { id: 2, state: 'empty', crop: null, plantTime: 0, growthTime: 0 },
                    { id: 3, state: 'empty', crop: null, plantTime: 0, growthTime: 0 },
                    { id: 4, state: 'empty', crop: null, plantTime: 0, growthTime: 0 }
                ];
                this.tractors = data.tractors || [
                    { id: 0, capacity: 10, currentLoad: 0, state: 'idle', returnTime: 0, roundTripTime: 8000, cargo: [] }
                ];
                
                // 古いセーブデータ対応：cargoプロパティがないトラクターに追加
                this.tractors.forEach(tractor => {
                    if (!tractor.cargo) {
                        tractor.cargo = [];
                    }
                });
                this.workers = data.workers || [];
                this.currentWorkerId = data.currentWorkerId || 0;
                this.ownedSeeds = data.ownedSeeds || ['apple', 'orange'];
                this.selectedSeedType = data.selectedSeedType || 'apple';
                this.bankruptcyEnabled = data.bankruptcyEnabled || false;
                this.gameSpeed = data.gameSpeed || 1;
                this.speedMultiplier = data.speedMultiplier || 1;
                
                // 進行中の作物の成長タイマーを復元
                this.restoreGrowthTimers();
                
                // 進行中のトラクター配送を復元
                this.restoreTractorTimers();
                
                console.log('ロード完了');
                this.showNotification('📂 セーブデータをよみこみました！', 'success');
            } else {
                console.log('セーブデータが見つかりません。初期状態で開始します。');
            }
        } catch (error) {
            console.error('ロードエラー:', error);
            this.showNotification('❌ ロードにしっぱいしました', 'error');
        }
    }
    
    // 作物の成長タイマーを復元
    restoreGrowthTimers() {
        this.fields.forEach((field, fieldId) => {
            if (field.state === 'planted' && field.plantTime && field.growthTime) {
                const elapsed = Date.now() - field.plantTime;
                const adjustedGrowthTime = field.growthTime / this.speedMultiplier;
                const remaining = adjustedGrowthTime - elapsed;
                
                if (remaining > 0) {
                    // まだ成長中
                    setTimeout(() => {
                        this.growCrop(fieldId);
                    }, remaining);
                } else {
                    // 既に成長完了している
                    field.state = 'ready';
                }
            }
        });
    }
    
    // トラクターの配送タイマーを復元
    restoreTractorTimers() {
        this.tractors.forEach((tractor, tractorId) => {
            if (tractor.state === 'transporting' && tractor.returnTime) {
                const remaining = tractor.returnTime - Date.now();
                
                if (remaining > 0) {
                    // まだ配送中
                    const earnings = this.calculateCargoValue(tractor);
                    setTimeout(() => {
                        this.completeDelivery(tractorId, earnings);
                    }, remaining);
                } else {
                    // 既に配送完了している
                    const earnings = this.calculateCargoValue(tractor);
                    this.completeDelivery(tractorId, earnings);
                }
            }
        });
    }
    
    resetGame() {
        if (confirm('本当にゲームをリセットしますか？すべての進行状況が失われます。')) {
            localStorage.removeItem('harvestPorterSave');
            this.showNotification('🗑️ ゲームをリセットしました', 'info');
            setTimeout(() => {
                location.reload();
            }, 1000);
        }
    }
    
    toggleBankruptcySystem() {
        this.bankruptcyEnabled = !this.bankruptcyEnabled;
        console.log('破産システム:', this.bankruptcyEnabled ? 'ON' : 'OFF');
        this.showNotification(`はさんシステムを${this.bankruptcyEnabled ? 'ON' : 'OFF'}にしました`, 'info');
        this.updateBankruptcyToggleButton();
    }
    
    updateBankruptcyToggleButton() {
        const toggleButton = document.getElementById('bankruptcy-toggle');
        if (toggleButton) {
            toggleButton.textContent = this.bankruptcyEnabled ? 
                '💸 はさんシステム: ON' : 
                '💰 はさんシステム: OFF';
            toggleButton.className = this.bankruptcyEnabled ? 
                'menu-btn bankruptcy-on' : 
                'menu-btn bankruptcy-off';
        }
    }
    
    // トラクターの積載価値を計算
    calculateCargoValue(tractor) {
        console.log('calculateCargoValue called with:', tractor);
        
        if (!tractor) {
            console.warn('トラクターが存在しません');
            return 0;
        }
        
        if (!tractor.cargo || tractor.cargo.length === 0) {
            // 古いセーブデータ対応：cargoがない場合は80G固定で計算
            console.log('cargoが存在しないため、固定価格で計算:', tractor.currentLoad * 80);
            return tractor.currentLoad * 80;
        }
        
        const totalValue = tractor.cargo.reduce((total, item) => total + item.sellPrice, 0);
        console.log('cargo価値計算結果:', totalValue);
        return totalValue;
    }
    
    // 簡単出荷機能
    startSimpleDelivery(tractorId) {
        const tractor = this.tractors.find(t => t.id === tractorId);
        if (!tractor || tractor.state !== 'idle' || tractor.currentLoad === 0) {
            this.showNotification('🚜 しゅっかできません', 'error');
            return;
        }
        
        // 出荷開始
        const earnings = this.calculateCargoValue(tractor); // 実際の作物価格で計算
        tractor.state = 'transporting';
        
        // 倍速を適用した運搬時間
        const adjustedRoundTripTime = tractor.roundTripTime / this.speedMultiplier;
        tractor.returnTime = Date.now() + adjustedRoundTripTime;
        
        this.showNotification(`🚚 トラクターがしゅっかにでかけました！ ${adjustedRoundTripTime / 1000}びょうでもどります`, 'success');
        
        // 出荷完了タイマー
        setTimeout(() => {
            this.completeDelivery(tractorId, earnings);
        }, adjustedRoundTripTime);
        
        // 表示を更新
        this.renderTractors();
        
        // モーダルを閉じる
        closeTractorControl();
    }
    
    // 出荷完了処理
    completeDelivery(tractorId, earnings) {
        const tractor = this.tractors[tractorId];
        if (!tractor) return;
        
        // トラクターをリセット
        tractor.state = 'idle';
        tractor.currentLoad = 0;
        tractor.returnTime = 0;
        tractor.cargo = []; // 積載内容をクリア
        
        // お金を追加
        this.money += earnings;
        
        this.showNotification(`💰 しゅっかかんりょう！ +${earnings}G`, 'success');
        
        // 表示を更新
        this.updateDisplay();
        this.renderTractors();
    }
    
    // 倍速機能
    toggleGameSpeed() {
        const speeds = [1, 2, 4, 8];
        const currentIndex = speeds.indexOf(this.gameSpeed);
        const nextIndex = (currentIndex + 1) % speeds.length;
        
        this.gameSpeed = speeds[nextIndex];
        this.speedMultiplier = this.gameSpeed;
        
        // ボタンの表示を更新
        const speedText = document.getElementById('speed-text');
        const speedBtn = document.getElementById('speed-toggle-btn');
        
        if (speedText && speedBtn) {
            speedText.textContent = `${this.gameSpeed}x`;
            
            // ボタンのクラスを更新
            speedBtn.className = 'speed-toggle-btn';
            if (this.gameSpeed === 2) speedBtn.classList.add('speed-2x');
            else if (this.gameSpeed === 4) speedBtn.classList.add('speed-4x');
            else if (this.gameSpeed === 8) speedBtn.classList.add('speed-8x');
        }
        
        // 通知を表示
        this.showNotification(`⚡ ゲーム速度: ${this.gameSpeed}x`, 'info');
    }
    
    // 手動トラクター運転ゲーム開始
    startTractorGame(tractorId) {
        const tractor = this.tractors[tractorId];
        if (!tractor || tractor.state !== 'idle' || tractor.currentLoad === 0) {
            this.showNotification('🚜 うんてんできません', 'error');
            return;
        }
        
        // トラクターを運搬中状態にする
        tractor.state = 'transporting';
        const earnings = tractor.currentLoad * 80;
        
        // 簡単出荷インターフェースを隠してゲーム画面を表示
        const modal = document.getElementById('tractor-control-modal');
        const deliveryInterface = modal.querySelector('.delivery-interface');
        const canvas = modal.querySelector('#tractor-canvas');
        const instructions = modal.querySelector('.control-instructions');
        const stats = modal.querySelector('.game-stats');
        
        if (deliveryInterface) deliveryInterface.style.display = 'none';
        if (canvas) canvas.style.display = 'block';
        if (instructions) {
            instructions.style.display = 'block';
            // 操作説明を更新
            instructions.innerHTML = `
                <p>📱 タッチ/マウス移動: 上下操作</p>
                <p>⚡ アクセル: 自動（燃料がある限り加速）</p>
                <p>⌨️ キーボード: ↑↓ または WASD で上下移動</p>
                <p>🎯 目標: 障害物を避けてゴール倉庫に到達！</p>
            `;
        }
        if (stats) stats.style.display = 'block';
        
        // トラクターミニゲームを開始
        this.currentTractorGame = new TractorMiniGame(tractor, (success, finalLoad, bonusMoney) => {
            this.completeTractorGame(tractorId, success, finalLoad, earnings, bonusMoney);
        });
        
        this.showNotification('🚜 うんてんかいし！がんばって！', 'success');
        this.renderTractors(); // トラクター表示を更新
    }
    
    // トラクターゲーム完了処理
    completeTractorGame(tractorId, success, finalLoad, baseEarnings, bonusMoney = 0) {
        const tractor = this.tractors[tractorId];
        if (!tractor) return;
        
        // トラクターをリセット
        tractor.state = 'idle';
        tractor.currentLoad = 0;
        tractor.returnTime = 0;
        tractor.cargo = []; // 積載内容をクリア
        
        let earnings = 0;
        if (success) {
            // 成功時は実際の貨物価値 + 運転ボーナス + 拾ったお金
            const cargoValue = this.calculateCargoValue(tractor) || (finalLoad * 80);
            const drivingBonus = finalLoad * 20; // 運転ボーナス20G/個
            earnings = cargoValue + drivingBonus + bonusMoney;
            this.showNotification(`🎉 うんてんせいこう！ +${earnings}G (ボーナス+${drivingBonus + bonusMoney}G)`, 'success');
        } else {
            // 失敗時は半額 + 拾ったお金
            earnings = Math.floor(baseEarnings * 0.5) + bonusMoney;
            this.showNotification(`😅 うんてんしっぱい... +${earnings}G (はんがく+ボーナス${bonusMoney}G)`, 'warning');
        }
        
        // お金を追加
        this.money += earnings;
        
        // 表示を更新
        this.updateDisplay();
        this.renderTractors();
        
        // モーダルを閉じる
        closeTractorControl();
        
        // ゲームインスタンスをクリア
        this.currentTractorGame = null;
    }
    
    // 畑購入機能
    buyField() {
        const fieldPrice = 500; // 畑の価格
        const maxFields = 50; // 最大畑数
        
        if (this.fields.length >= maxFields) {
            this.showNotification(`🚫 はたけは${maxFields}こまでしかかえません`, 'warning');
            return;
        }
        
        if (this.money >= fieldPrice) {
            this.money -= fieldPrice;
            
            // 新しい畑を追加
            const newFieldId = this.fields.length;
            this.fields.push({
                id: newFieldId,
                state: 'empty',
                crop: null,
                plantTime: 0,
                growthTime: 0
            });
            
            this.showNotification(`✅ あたらしいはたけをこうにゅうしました！ (-${fieldPrice}G)`, 'success');
            this.updateDisplay();
            this.renderFields();
        } else {
            this.showNotification(`💰 おかねがたりません！ (${fieldPrice}G ひつよう)`, 'error');
        }
    }
    
    // トラクター購入機能
    buyTractor() {
        const tractorPrice = 800; // トラクターの価格
        const maxTractors = 5; // 最大トラクター数
        
        if (this.tractors.length >= maxTractors) {
            this.showNotification(`🚫 トラクターは${maxTractors}だいまでしかかえません`, 'warning');
            return;
        }
        
        if (this.money >= tractorPrice) {
            this.money -= tractorPrice;
            
            // 新しいトラクターを追加
            const newTractorId = this.tractors.length;
            this.tractors.push({
                id: newTractorId,
                capacity: 10,
                currentLoad: 0,
                state: 'idle',
                returnTime: 0,
                roundTripTime: 8000,
                cargo: []
            });
            
            this.showNotification(`✅ あたらしいトラクターをこうにゅうしました！ (-${tractorPrice}G)`, 'success');
            this.updateDisplay();
            this.renderTractors();
        } else {
            this.showNotification(`💰 おかねがたりません！ (${tractorPrice}G ひつよう)`, 'error');
        }
    }
    
    // ショップの種表示機能
    renderShopSeeds() {
        const container = document.getElementById('seeds-list');
        if (!container) {
            console.log('seeds-list が見つかりません');
            return;
        }
        
        container.innerHTML = '';
        
        // 購入可能な種を表示
        Object.entries(this.cropData).forEach(([key, crop]) => {
            if (!this.ownedSeeds.includes(key)) {
                const seedElement = document.createElement('div');
                seedElement.className = 'shop-item';
                
                const canAfford = this.money >= crop.seedPrice;
                
                seedElement.innerHTML = `
                    <div class="item-info">
                        <h3>${crop.icon} ${crop.name}の種</h3>
                        <p>成長時間: ${crop.growthTime / 1000}秒 | 売値: ${crop.sellPrice}G</p>
                    </div>
                    <div class="item-purchase">
                        <span class="price">${crop.seedPrice}G</span>
                        <button onclick="game.buySeed('${key}')" ${!canAfford ? 'disabled' : ''}>
                            ${canAfford ? 'こうにゅう' : 'おかねがたりません'}
                        </button>
                    </div>
                `;
                
                container.appendChild(seedElement);
            }
        });
        
        // 購入可能な種がない場合
        if (container.children.length === 0) {
            container.innerHTML = '<p class="no-items">すべての種をしょじしています！</p>';
        }
        
        console.log('ショップの種表示完了');
    }
    
    // 種購入機能
    buySeed(seedKey) {
        const crop = this.cropData[seedKey];
        
        if (this.ownedSeeds.includes(seedKey)) {
            this.showNotification(`${crop.name}の種はすでにしょじしています`, 'info');
            return;
        }
        
        if (this.money >= crop.seedPrice) {
            this.money -= crop.seedPrice;
            this.ownedSeeds.push(seedKey);
            
            this.showNotification(`🌱 ${crop.name}の種をこうにゅうしました！ (-${crop.seedPrice}G)`, 'success');
            this.updateDisplay();
            this.renderShopSeeds(); // ショップ表示を更新
            this.renderSeedSelector(); // 種選択UIも更新
        } else {
            this.showNotification(`💰 おかねがたりません！ (${crop.seedPrice}G ひつよう)`, 'error');
        }
    }
    
    // 労働者雇用機能
    hireWorker(workerType) {
        console.log('雇用しようとしている労働者タイプ:', workerType);
        console.log('利用可能な労働者タイプ:', Object.keys(this.workerTypes));
        
        const workerInfo = this.workerTypes[workerType];
        if (!workerInfo) {
            console.log('労働者情報が見つかりません:', workerType);
            this.showNotification('❌ ふめいなろうどうしゃタイプです', 'error');
            return;
        }
        
        const maxWorkers = 5; // 最大労働者数
        if (this.workers.length >= maxWorkers) {
            this.showNotification(`🚫 ろうどうしゃは${maxWorkers}にんまでしかやとえません`, 'warning');
            return;
        }
        
        if (this.money >= workerInfo.hireCost) {
            this.money -= workerInfo.hireCost;
            this.currentWorkerId++;
            
            const newWorker = {
                id: this.currentWorkerId,
                type: workerType,
                name: workerInfo.name,
                icon: workerInfo.icon,
                isActive: true,
                wageCost: workerInfo.wageCost,
                lastWorkTime: Date.now()
            };
            
            this.workers.push(newWorker);
            
            this.showNotification(`✅ ${workerInfo.name}をやといました！ (-${workerInfo.hireCost}G)`, 'success');
            this.updateDisplay();
            this.renderWorkers();
        } else {
            this.showNotification(`💰 おかねがたりません！ (${workerInfo.hireCost}G ひつよう)`, 'error');
        }
    }
    
    // 労働者解雇機能
    fireWorker(workerId) {
        const workerIndex = this.workers.findIndex(w => w.id === workerId);
        if (workerIndex === -1) {
            this.showNotification('❌ ろうどうしゃがみつかりません', 'error');
            return;
        }
        
        const worker = this.workers[workerIndex];
        if (confirm(`${worker.name}をかいこしますか？`)) {
            this.workers.splice(workerIndex, 1);
            this.showNotification(`👋 ${worker.name}をかいこしました`, 'info');
            this.renderWorkers();
        }
    }
    
    // 労働者の表示機能
    renderWorkers() {
        const container = document.getElementById('workers-container');
        if (!container) {
            console.log('workers-container が見つかりません');
            return;
        }
        
        container.innerHTML = '';
        
        this.workers.forEach(worker => {
            const workerElement = document.createElement('div');
            workerElement.className = `worker ${worker.isActive ? 'active' : 'inactive'}`;
            
            const statusText = worker.isActive ? 'はたらきちゅう' : 'きゅうけいちゅう';
            const toggleButtonText = worker.isActive ? 'きゅうけい' : 'さいかい';
            
            workerElement.innerHTML = `
                <div class="worker-header">
                    <span>${worker.icon} ${worker.name} #${worker.id}</span>
                    <span class="worker-status ${worker.isActive ? 'active' : 'inactive'}">${statusText}</span>
                </div>
                <div class="worker-info">
                    <p>きゅうりょう: ${worker.wageCost}G/ふん</p>
                    <p>しゅるい: ${this.workerTypes[worker.type].description}</p>
                </div>
                <div class="worker-controls">
                    <button onclick="game.toggleWorker(${worker.id})" class="toggle-btn">
                        ${toggleButtonText}
                    </button>
                    <button onclick="game.fireWorker(${worker.id})" class="fire-btn">
                        かいこ
                    </button>
                </div>
            `;
            
            container.appendChild(workerElement);
        });
        
        if (this.workers.length === 0) {
            container.innerHTML = '<p class="no-workers">ろうどうしゃはいません</p>';
        }
        
        console.log('労働者の表示完了');
    }
    
    // 労働者の作業切り替え
    toggleWorker(workerId) {
        const worker = this.workers.find(w => w.id === workerId);
        if (!worker) {
            this.showNotification('❌ ろうどうしゃがみつかりません', 'error');
            return;
        }
        
        worker.isActive = !worker.isActive;
        const statusText = worker.isActive ? 'さいかい' : 'きゅうけい';
        this.showNotification(`${worker.icon} ${worker.name}が${statusText}しました`, 'info');
        this.renderWorkers();
    }
    
    // 労働者の自動作業処理
    updateWorkers() {
        this.workers.forEach(worker => {
            if (worker.isActive) {
                if (worker.type === 'planter') {
                    this.autoPlantSeeds();
                } else if (worker.type === 'harvester') {
                    this.autoHarvestCrops();
                } else if (worker.type === 'driver') {
                    this.autoOperateTractors();
                }
            }
        });
    }
    
    // 自動種植え
    autoPlantSeeds() {
        const emptyField = this.fields.find(f => f.state === 'empty');
        if (emptyField && this.ownedSeeds.length > 0) {
            const crop = this.cropData[this.selectedSeedType];
            if (this.money >= crop.seedPrice) {
                this.plantSeed(emptyField.id);
            }
        }
    }
    
    // 自動収穫
    autoHarvestCrops() {
        const readyField = this.fields.find(f => f.state === 'ready');
        if (readyField) {
            this.harvestField(readyField.id);
        }
    }
    
    // 自動トラクター操作
    autoOperateTractors() {
        // 満タンで待機中のトラクターを探す
        const fullTractor = this.tractors.find(t => t.state === 'idle' && t.currentLoad >= t.capacity);
        if (fullTractor) {
            // 自動出荷を実行
            this.startSimpleDelivery(fullTractor.id);
            console.log(`運転手がトラクター#${fullTractor.id}を自動出荷しました（満タン: ${fullTractor.currentLoad}/${fullTractor.capacity}）`);
        }
    }
    
    // 給料支払い
    payWages() {
        let totalWages = 0;
        this.workers.forEach(worker => {
            if (worker.isActive) {
                totalWages += worker.wageCost;
            }
        });
        
        if (totalWages > 0) {
            if (this.money >= totalWages) {
                this.money -= totalWages;
                this.showNotification(`💸 きゅうりょうをしはらいました (-${totalWages}G)`, 'info');
            } else {
                // 給料が払えない場合、労働者を休ませる
                this.workers.forEach(worker => {
                    if (worker.isActive) {
                        worker.isActive = false;
                    }
                });
                this.showNotification('💰 きゅうりょうがたりないため、ろうどうしゃをきゅうけいさせました', 'warning');
                this.renderWorkers();
            }
            this.updateDisplay();
        }
    }
}

// HTMLから呼び出されるグローバル関数
function toggleShop() {
    console.log('ショップ切り替え');
    const modal = document.getElementById('shop-modal');
    if (modal) {
        modal.classList.toggle('active');
        
        if (modal.classList.contains('active')) {
            // ショップが開かれた時に商品を表示
            game.renderShopSeeds();
        }
    }
}

function toggleGameMenu() {
    console.log('ゲームメニュー切り替え（テスト版）');
    const modal = document.getElementById('game-menu-modal');
    if (modal) {
        modal.classList.toggle('active');
    }
}

function toggleGameSpeed() {
    console.log('ゲーム速度切り替え');
    if (game) {
        game.toggleGameSpeed();
    }
}

function buyField() {
    console.log('畑購入');
    if (game) {
        game.buyField();
    }
}

function buyTractor() {
    console.log('トラクター購入');
    if (game) {
        game.buyTractor();
    }
}

function switchTab(tabName) {
    console.log('タブ切り替え:', tabName);
    // タブ切り替えロジック
    const tabs = document.querySelectorAll('.shop-tab');
    const sections = document.querySelectorAll('.shop-section');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    sections.forEach(section => section.classList.remove('active'));
    
    const activeTab = document.querySelector(`[onclick="switchTab('${tabName}')"]`);
    const activeSection = document.getElementById(`shop-${tabName}`);
    
    if (activeTab) activeTab.classList.add('active');
    if (activeSection) activeSection.classList.add('active');
}

// トラクター操作関数
function openTractorControl(tractorId) {
    console.log('トラクター操作画面を開く - ID:', tractorId);
    console.log('現在のトラクター状態:', game.tractors);
    
    // 指定されたIDのトラクターを取得
    const targetTractor = game.tractors.find(t => t.id === tractorId);
    console.log('対象トラクター:', targetTractor);
    
    if (!targetTractor) {
        game.showNotification('🚜 指定されたトラクターが見つかりません', 'error');
        return;
    }
    
    // トラクターが操作可能かチェック
    if (targetTractor.state !== 'idle' || targetTractor.currentLoad <= 0) {
        game.showNotification('🚜 このトラクターは操作できません（待機中で積載が必要です）', 'warning');
        return;
    }
    
    const modal = document.getElementById('tractor-control-modal');
    if (modal) {
        modal.classList.add('active');
        
        // 既存のHTML構造を利用して、簡単出荷ボタンを追加
        const gameArea = modal.querySelector('.tractor-game-area');
        if (gameArea) {
            // 既存のcanvasを隠して、簡単出荷インターフェースを表示
            const canvas = modal.querySelector('#tractor-canvas');
            const instructions = modal.querySelector('.control-instructions');
            const stats = modal.querySelector('.game-stats');
            
            if (canvas) canvas.style.display = 'none';
            if (instructions) instructions.style.display = 'none';
            if (stats) stats.style.display = 'none';
            
            // 簡単出荷インターフェースを作成
            let deliveryInterface = modal.querySelector('.delivery-interface');
            if (!deliveryInterface) {
                deliveryInterface = document.createElement('div');
                deliveryInterface.className = 'delivery-interface';
                gameArea.appendChild(deliveryInterface);
            }
            
            deliveryInterface.innerHTML = `
                <div class="delivery-info">
                    <h3>🚜 トラクター #${targetTractor.id + 1}</h3>
                    <p><strong>つみに:</strong> ${targetTractor.currentLoad}/${targetTractor.capacity}こ</p>
                    <p><strong>じょうたい:</strong> ${targetTractor.state === 'idle' ? 'たいきちゅう' : 'うんぱんちゅう'}</p>
                    <p><strong>しゅうにゅうよてい:</strong> ${game.calculateCargoValue(targetTractor)}G</p>
                </div>
                <div class="delivery-buttons">
                    <button onclick="game.startTractorGame(${targetTractor.id})" class="manual-delivery-btn">
                        🎮 じぶんでうんてん
                    </button>
                    <button onclick="game.startSimpleDelivery(${targetTractor.id})" class="delivery-btn">
                        📦 かんたんしゅっか
                    </button>
                    <button onclick="closeTractorControl()" class="cancel-btn">
                        ❌ キャンセル
                    </button>
                </div>
            `;
        }
    } else {
        console.log('モーダルが見つからないため、確認ダイアログを表示');
        // モーダルが見つからない場合は簡単な確認ダイアログ
        const proceed = confirm(`🚜 トラクターでしゅっかしますか？\nつみに: ${targetTractor.currentLoad}こ\nしゅうにゅう: ${game.calculateCargoValue(targetTractor)}G`);
        if (proceed) {
            game.startSimpleDelivery(targetTractor.id);
        }
    }
}

function closeTractorControl() {
    console.log('トラクター操作画面を閉じる');
    const modal = document.getElementById('tractor-control-modal');
    if (modal) {
        modal.classList.remove('active');
        
        // 元の表示に戻す
        const canvas = modal.querySelector('#tractor-canvas');
        const instructions = modal.querySelector('.control-instructions');
        const stats = modal.querySelector('.game-stats');
        const deliveryInterface = modal.querySelector('.delivery-interface');
        
        if (canvas) canvas.style.display = 'block';
        if (instructions) instructions.style.display = 'block';
        if (stats) stats.style.display = 'block';
        if (deliveryInterface) deliveryInterface.remove();
    }
}

// モーダル制御関数
function closeSeedModal() {
    console.log('種モーダルを閉じる（テスト版）');
    const modal = document.getElementById('seed-modal');
    if (modal) {
        modal.classList.remove('active');
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

// モーダル外クリックで閉じる処理
document.addEventListener('DOMContentLoaded', () => {
    // ショップモーダル
    const shopModal = document.getElementById('shop-modal');
    if (shopModal) {
        shopModal.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                toggleShop();
            }
        });
    }
    
    // ゲームメニューモーダル
    const gameMenuModal = document.getElementById('game-menu-modal');
    if (gameMenuModal) {
        gameMenuModal.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                toggleGameMenu();
            }
        });
    }
    
    // 種モーダル
    const seedModal = document.getElementById('seed-modal');
    if (seedModal) {
        seedModal.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                closeSeedModal();
            }
        });
    }
});

console.log('JavaScriptファイル読み込み完了');

// トラクター操作ミニゲーム
class TractorMiniGame {
    constructor(tractor, onComplete) {
        this.tractor = tractor;
        this.onComplete = onComplete;
        this.canvas = document.getElementById('tractor-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 貨物の価値を計算して難易度を設定
        this.cargoValue = game.calculateCargoValue(tractor);
        this.difficulty = this.calculateDifficulty(this.cargoValue);
        
        // ゲーム状態
        this.isRunning = true;
        this.gameTime = Math.max(30, 60 - this.difficulty * 5); // 難易度に応じて時間制限を調整
        this.currentLoad = tractor.currentLoad;
        this.maxLoad = tractor.capacity;
        
        // トラクターの位置と状態
        this.tractorX = 50;
        this.tractorY = 200;
        this.speed = 0;
        this.maxSpeed = Math.max(3, 5 - this.difficulty * 0.3); // 難易度に応じて最大速度を調整
        this.fuel = 100;
        this.distance = 0;
        this.targetDistance = 2000 + this.difficulty * 200; // 難易度に応じて距離を延長
        
        // 障害物
        this.obstacles = [];
        this.lastObstacleTime = 0;
        this.obstacleFrequency = Math.max(800, 2000 - this.difficulty * 200); // 難易度に応じて障害物頻度を調整
        
        // お金アイテム
        this.moneyItems = [];
        this.lastMoneyTime = 0;
        this.moneyFrequency = 3000; // 3秒ごとにお金アイテム生成
        
        // 倉庫と配達地点（画面上の表示位置）
        this.warehouseX = 30;
        this.warehouseY = 180;
        this.deliveryX = 550;
        this.deliveryY = 180;
        
        // 実際のゲーム進行（スクロール効果）
        this.worldOffset = 0; // 世界のオフセット
        
        // ゴール倉庫の実際の位置
        this.goalWarehouseX = this.targetDistance; // 目標距離の位置に配置
        this.goalWarehouseWidth = 60;
        this.goalWarehouseHeight = 60;
        
        // 入力状態
        this.keys = {};
        this.mouseDown = false;
        this.touchY = null; // タッチ位置を追跡
        
        // 自動アクセル設定
        this.autoAccel = true;
        this.accelPower = 0.15; // 自動アクセルの強さ
        
        this.init();
    }
    
    // 難易度計算（貨物価値に基づく）
    calculateDifficulty(cargoValue) {
        // 基準価格を800G（りんご10個）とし、それを超える分で難易度を上げる
        const baseDifficulty = Math.max(0, Math.floor((cargoValue - 800) / 200));
        return Math.min(baseDifficulty, 10); // 最大難易度10
    }
    
    init() {
        // イベントリスナーを設定
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        
        // タッチイベントを追加
        this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        this.canvas.addEventListener('touchend', this.handleTouchEnd, { passive: false });
        
        // ゲームループを開始
        this.gameLoop();
        
        // タイマーを開始
        this.gameTimer = setInterval(() => {
            this.gameTime--;
            if (this.gameTime <= 0) {
                this.endGame(false);
            }
        }, 1000);
    }
    
    handleKeyDown(e) {
        this.keys[e.key] = true;
    }
    
    handleKeyUp(e) {
        this.keys[e.key] = false;
    }
    
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseY = e.clientY - rect.top;
        
        // マウスY座標でトラクターの上下移動
        this.tractorY = Math.max(75, Math.min(325, mouseY - 15)); // 道路内に制限
    }
    
    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        this.touchY = touch.clientY - rect.top;
        
        // 初期位置設定
        this.tractorY = Math.max(75, Math.min(325, this.touchY - 15));
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        this.touchY = touch.clientY - rect.top;
        
        // タッチY座標でトラクターの上下移動
        this.tractorY = Math.max(75, Math.min(325, this.touchY - 15)); // 道路内に制限
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        this.touchY = null;
    }
    
    gameLoop() {
        if (!this.isRunning) return;
        
        this.update();
        this.draw();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        // 自動アクセル（常に一定速度で進む）
        if (this.autoAccel && this.fuel > 0) {
            this.speed = Math.min(this.speed + this.accelPower, this.maxSpeed);
            this.fuel = Math.max(0, this.fuel - 0.15); // 燃料消費を調整
        } else {
            // 燃料切れまたは手動操作時
            if (this.keys[' '] || this.keys['ArrowUp']) {
                this.speed = Math.min(this.speed + 0.2, this.maxSpeed);
                this.fuel = Math.max(0, this.fuel - 0.2);
            } else {
                this.speed = Math.max(0, this.speed - 0.1);
            }
        }
        
        // 燃料切れチェック
        if (this.fuel <= 0) {
            this.speed = Math.max(0, this.speed - 0.3);
        }
        
        // キーボードでの上下移動（タブレット以外用）
        if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) {
            this.tractorY = Math.max(75, this.tractorY - 3);
        }
        if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']) {
            this.tractorY = Math.min(325, this.tractorY + 3);
        }
        
        // 距離を更新
        this.distance += this.speed;
        this.worldOffset += this.speed;
        
        // 障害物を生成（難易度に応じて頻度調整）
        if (Date.now() - this.lastObstacleTime > this.obstacleFrequency) {
            this.obstacles.push({
                x: 700, // 画面右端から登場
                y: Math.random() * 200 + 100, // 道路内にランダム配置（範囲を調整）
                type: ['🌳', '🪨', '🚧', '🐄', '🚗'][Math.floor(Math.random() * 5)], // 障害物の種類を増加
                width: 25,
                height: 25
            });
            this.lastObstacleTime = Date.now();
        }
        
        // お金アイテムを生成
        if (Date.now() - this.lastMoneyTime > this.moneyFrequency) {
            this.moneyItems.push({
                x: 700, // 画面右端から登場
                y: Math.random() * 200 + 100, // 道路内にランダム配置
                type: '💰',
                width: 20,
                height: 20,
                value: Math.floor(Math.random() * 50) + 10 // 10-60Gランダム
            });
            this.lastMoneyTime = Date.now();
        }
        
        // 障害物を移動（スクロール効果）
        this.obstacles.forEach(obstacle => {
            obstacle.x -= this.speed + 1; // 背景より少し速く移動
        });
        
        // お金アイテムを移動
        this.moneyItems.forEach(money => {
            money.x -= this.speed + 1;
        });
        
        // 画面外の障害物を削除
        this.obstacles = this.obstacles.filter(obstacle => obstacle.x > -50);
        
        // 画面外のお金アイテムを削除
        this.moneyItems = this.moneyItems.filter(money => money.x > -50);
        
        // 衝突判定
        this.obstacles.forEach(obstacle => {
            if (this.checkCollision(this.tractorX, this.tractorY, 30, 30, obstacle.x, obstacle.y, obstacle.width, obstacle.height)) {
                this.currentLoad = Math.max(0, this.currentLoad - 1);
                this.speed = Math.max(0, this.speed - 1.5); // 衝突時の減速を調整
                this.fuel = Math.max(0, this.fuel - 3); // 衝突時の燃料ロスを調整
                
                // 障害物を削除
                const index = this.obstacles.indexOf(obstacle);
                if (index > -1) {
                    this.obstacles.splice(index, 1);
                }
                
                // 衝突エフェクト（画面を少し揺らす）
                this.shakeEffect = 8;
            }
        });
        
        // お金アイテムの衝突判定
        this.moneyItems.forEach(money => {
            if (this.checkCollision(this.tractorX, this.tractorY, 30, 30, money.x, money.y, money.width, money.height)) {
                // お金を獲得
                this.collectedMoney = (this.collectedMoney || 0) + money.value;
                
                // お金アイテムを削除
                const index = this.moneyItems.indexOf(money);
                if (index > -1) {
                    this.moneyItems.splice(index, 1);
                }
                
                // 獲得エフェクト
                this.showMoneyEffect = 30; // 30フレーム表示
                this.lastMoneyValue = money.value;
            }
        });
        
        // 画面揺れエフェクト
        if (this.shakeEffect > 0) {
            this.shakeEffect--;
        }
        
        // ゴール判定（ゴール倉庫との衝突判定）
        const goalWarehouseScreenX = this.goalWarehouseX - this.worldOffset;
        if (goalWarehouseScreenX <= this.tractorX + 30 && goalWarehouseScreenX + this.goalWarehouseWidth >= this.tractorX) {
            // トラクターがゴール倉庫に到達
            if (this.tractorY + 30 >= this.warehouseY && this.tractorY <= this.warehouseY + this.goalWarehouseHeight) {
                this.endGame(true);
                return;
            }
        }
        
        // 積荷が全部なくなったら失敗
        if (this.currentLoad <= 0) {
            this.endGame(false);
        }
    }
    
    checkCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
        return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
    }
    
    draw() {
        // 画面揺れエフェクト
        let shakeX = 0, shakeY = 0;
        if (this.shakeEffect > 0) {
            shakeX = (Math.random() - 0.5) * this.shakeEffect;
            shakeY = (Math.random() - 0.5) * this.shakeEffect;
        }
        
        this.ctx.save();
        this.ctx.translate(shakeX, shakeY);
        
        // 背景をクリア
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 道路を描画
        this.ctx.fillStyle = '#666';
        this.ctx.fillRect(0, 50, this.canvas.width, 300);
        
        // 道路の線（スクロール効果）
        this.ctx.strokeStyle = '#FFF';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([20, 20]);
        const lineOffset = (this.worldOffset * 2) % 40;
        this.ctx.lineDashOffset = -lineOffset;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 200);
        this.ctx.lineTo(this.canvas.width, 200);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // 背景の木々（遠景効果）
        for (let i = 0; i < 10; i++) {
            const treeX = (i * 80 - (this.worldOffset * 0.3)) % (this.canvas.width + 100);
            if (treeX > -50) {
                this.ctx.font = '16px Arial';
                this.ctx.fillText('🌲', treeX, 40);
                this.ctx.fillText('🌲', treeX, 380);
            }
        }
        
        // スタート地点の倉庫（最初だけ表示）
        if (this.distance < 100) {
            const warehouseX = this.warehouseX - this.worldOffset;
            if (warehouseX > -50) {
                this.ctx.fillStyle = '#8B4513';
                this.ctx.fillRect(warehouseX, this.warehouseY, 40, 40);
                this.ctx.fillStyle = '#000';
                this.ctx.font = '12px Arial';
                this.ctx.fillText('スタート', warehouseX + 5, this.warehouseY - 5);
            }
        }
        
        // ゴール倉庫を描画（常に表示、近づくと大きく表示）
        const goalWarehouseScreenX = this.goalWarehouseX - this.worldOffset;
        const distanceToGoal = this.targetDistance - this.distance;
        
        if (goalWarehouseScreenX > -100 && goalWarehouseScreenX < this.canvas.width + 50) {
            // ゴール倉庫が画面内にある場合
            const warehouseSize = Math.min(60, Math.max(40, 100 - distanceToGoal / 20)); // 近づくと大きくなる
            
            // 倉庫の影
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.fillRect(goalWarehouseScreenX + 5, this.warehouseY + 5, warehouseSize, warehouseSize);
            
            // 倉庫本体
            this.ctx.fillStyle = '#8B4513';
            this.ctx.fillRect(goalWarehouseScreenX, this.warehouseY, warehouseSize, warehouseSize);
            
            // 倉庫の屋根
            this.ctx.fillStyle = '#A0522D';
            this.ctx.beginPath();
            this.ctx.moveTo(goalWarehouseScreenX - 5, this.warehouseY);
            this.ctx.lineTo(goalWarehouseScreenX + warehouseSize/2, this.warehouseY - 15);
            this.ctx.lineTo(goalWarehouseScreenX + warehouseSize + 5, this.warehouseY);
            this.ctx.fill();
            
            // 倉庫のドア
            this.ctx.fillStyle = '#654321';
            this.ctx.fillRect(goalWarehouseScreenX + warehouseSize/3, this.warehouseY + warehouseSize/3, warehouseSize/3, warehouseSize*2/3);
            
            // ゴールテキスト
            this.ctx.fillStyle = '#000';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('🏁 ゴール', goalWarehouseScreenX + warehouseSize/2, this.warehouseY - 20);
            
            // 距離が近い場合は矢印を表示
            if (distanceToGoal < 200) {
                this.ctx.fillStyle = '#FF4500';
                this.ctx.font = '20px Arial';
                this.ctx.fillText('→', goalWarehouseScreenX - 30, this.warehouseY + warehouseSize/2);
            }
            
            this.ctx.textAlign = 'left'; // テキスト配置をリセット
        } else if (distanceToGoal < 500) {
            // ゴール倉庫が画面外でも近い場合は方向を示す
            this.ctx.fillStyle = '#FF4500';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.fillText(`ゴールまで ${Math.floor(distanceToGoal)}m →`, this.canvas.width - 200, 50);
        }
        
        // トラクターを描画（画面中央固定）
        this.ctx.fillStyle = '#00FF00';
        this.ctx.fillRect(this.tractorX, this.tractorY, 30, 30);
        this.ctx.fillStyle = '#000';
        this.ctx.font = '20px Arial';
        this.ctx.fillText('🚜', this.tractorX + 2, this.tractorY + 22);
        
        // 積荷を表示
        this.ctx.fillStyle = '#000';
        this.ctx.font = '12px Arial';
        this.ctx.fillText(`つみに: ${this.currentLoad}`, this.tractorX - 5, this.tractorY - 5);
        
        // 障害物を描画
        this.obstacles.forEach(obstacle => {
            this.ctx.font = '20px Arial';
            this.ctx.fillText(obstacle.type, obstacle.x, obstacle.y + 20);
        });
        
        // お金アイテムを描画
        this.moneyItems.forEach(money => {
            this.ctx.font = '16px Arial';
            this.ctx.fillText(money.type, money.x, money.y + 16);
        });
        
        // プログレスバー
        const progressPercent = this.distance / this.targetDistance;
        const progressWidth = (this.canvas.width - 40) * progressPercent;
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(20, 10, this.canvas.width - 40, 20);
        this.ctx.fillStyle = progressPercent > 0.8 ? '#4CAF50' : '#2196F3';
        this.ctx.fillRect(20, 10, progressWidth, 20);
        
        // ゲーム情報を表示
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '14px Arial';
        this.ctx.fillRect(10, 35, 220, 130);
        this.ctx.fillStyle = '#000';
        this.ctx.fillText(`のこりじかん: ${this.gameTime}びょう`, 15, 50);
        
        // distanceToGoalは既に上で宣言されているので再宣言しない
        this.ctx.fillText(`ゴールまで: ${Math.floor(distanceToGoal)}m`, 15, 65);
        
        this.ctx.fillText(`ねんりょう: ${Math.floor(this.fuel)}%`, 15, 80);
        this.ctx.fillText(`そくど: ${Math.floor(this.speed * 10)}km/h`, 15, 95);
        this.ctx.fillText(`つみに: ${this.currentLoad}/${this.maxLoad}`, 15, 110);
        this.ctx.fillText(`なんいど: ${this.difficulty}`, 15, 125);
        this.ctx.fillText(`しゅうにゅう: ${this.cargoValue}G`, 15, 140);
        if (this.collectedMoney > 0) {
            this.ctx.fillText(`ボーナス: +${this.collectedMoney}G`, 15, 155);
        }
        
        // ゴールが近い場合は特別な表示
        if (distanceToGoal < 100) {
            this.ctx.fillStyle = '#FF4500';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.fillText('🏁 ゴールちかく！', 15, 170);
        }
        
        // お金獲得エフェクト
        if (this.showMoneyEffect > 0) {
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = 'bold 18px Arial';
            this.ctx.fillText(`+${this.lastMoneyValue}G!`, this.tractorX + 35, this.tractorY - 10);
            this.showMoneyEffect--;
        }
        
        this.ctx.restore();
    }
    
    endGame(success) {
        this.isRunning = false;
        
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
        
        // イベントリスナーを削除
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('touchstart', this.handleTouchStart);
        this.canvas.removeEventListener('touchmove', this.handleTouchMove);
        this.canvas.removeEventListener('touchend', this.handleTouchEnd);
        
        // コールバックを呼び出し（獲得したお金も含める）
        this.onComplete(success, this.currentLoad, this.collectedMoney || 0);
    }
}
