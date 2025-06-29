// ゲーム状態管理
class HarvestPorterGame {
    constructor() {
        this.money = 2000; // 初期資金を増加
        // 初期農場を5つに増加
        this.fields = [
            { id: 0, state: 'empty', crop: null, plantTime: 0, growthTime: 0 },
            { id: 1, state: 'empty', crop: null, plantTime: 0, growthTime: 0 },
            { id: 2, state: 'empty', crop: null, plantTime: 0, growthTime: 0 },
            { id: 3, state: 'empty', crop: null, plantTime: 0, growthTime: 0 },
            { id: 4, state: 'empty', crop: null, plantTime: 0, growthTime: 0 }
        ];
        this.tractors = [{ id: 0, capacity: 10, currentLoad: 0, state: 'idle', returnTime: 0, roundTripTime: 8000 }];
        this.ownedSeeds = ['apple', 'orange'];
        this.fieldPrice = 800;
        this.tractorPrice = 2000;
        this.currentFieldId = 4; // 5つの農場があるので4から開始
        this.currentTractorId = 0;
        this.selectedSeedType = 'apple'; // 現在選択されている種
        
        // 破産システム
        this.bankruptcyEnabled = false; // 破産システムの初期状態はOFF
        this.isGameOver = false; // ゲームオーバー状態
        
        // デバッグ用倍速設定
        this.gameSpeed = 1; // 1x, 2x, 4x, 8x
        this.speedMultiplier = 1;
        
        // 労働者システム
        this.workers = [];
        this.currentWorkerId = -1;
        this.workerTypes = {
            planter: { 
                name: '種植え作業員', 
                icon: '👨‍🌾', 
                hireCost: 1500, 
                dailyWage: 100,
                description: '空の畑に自動で種を植えます'
            },
            harvester: { 
                name: 'しゅうかくさぎょういん', 
                icon: '👩‍🌾', 
                hireCost: 2000, 
                dailyWage: 150,
                description: 'しゅうかくできるさくもつをじどうでしゅうかくします'
            }
        };
        
        this.lastWagePayment = Date.now();
        this.wageInterval = 30000; // 30秒ごとに賃金支払い
        
        this.cropData = {
            apple: { name: 'りんご', icon: '🍎', seedPrice: 30, growthTime: 6000, sellPrice: 50, unlocked: true }, // 成長時間短縮
            orange: { name: 'みかん', icon: '🍊', seedPrice: 20, growthTime: 4000, sellPrice: 35, unlocked: true }, // 成長時間短縮
            tomato: { name: 'トマト', icon: '🍅', seedPrice: 60, growthTime: 8000, sellPrice: 100, unlocked: false },
            corn: { name: 'とうもろこし', icon: '🌽', seedPrice: 50, growthTime: 7000, sellPrice: 80, unlocked: false },
            carrot: { name: 'にんじん', icon: '🥕', seedPrice: 35, growthTime: 5000, sellPrice: 60, unlocked: false },
            potato: { name: 'じゃがいも', icon: '🥔', seedPrice: 25, growthTime: 6000, sellPrice: 45, unlocked: false },
            strawberry: { name: 'いちご', icon: '🍓', seedPrice: 80, growthTime: 10000, sellPrice: 130, unlocked: false },
            grape: { name: 'ぶどう', icon: '🍇', seedPrice: 100, growthTime: 12000, sellPrice: 160, unlocked: false }
        };
        
        this.init();
    }
    
    init() {
        this.loadGame(); // セーブデータを読み込み
        
        // デバッグ: 初期状態を確認
        console.log('初期化完了:');
        console.log('所持種:', this.ownedSeeds);
        console.log('選択種:', this.selectedSeedType);
        console.log('作物データ:', this.cropData);
        
        this.updateDisplay();
        this.renderFields();
        this.renderTractors();
        this.renderWorkers();
        this.renderSeedSelector();
        this.renderShopSeeds();
        this.startGameLoop();
        this.startAutoSave(); // 自動セーブを開始
        
        // 破産システムボタンの初期化
        this.updateBankruptcyToggleButton();
        
        // 倍速ボタンの初期化
        setTimeout(() => {
            const speedText = document.getElementById('speed-text');
            const speedBtn = document.getElementById('speed-toggle-btn');
            
            if (speedText && speedBtn) {
                speedText.textContent = `${this.gameSpeed}x`;
                speedBtn.className = 'speed-toggle-btn';
                if (this.gameSpeed === 2) speedBtn.classList.add('speed-2x');
                else if (this.gameSpeed === 4) speedBtn.classList.add('speed-4x');
                else if (this.gameSpeed === 8) speedBtn.classList.add('speed-8x');
            }
            
            // 初期状態でのヒント表示
            this.showNotification('💡 メニューからはさんシステムをせっていできます', 'info');
        }, 100);
    }
    
    startGameLoop() {
        this.gameLoopInterval = setInterval(() => {
            if (!this.isGameOver) {
                // 倍速に応じて複数回更新
                for (let i = 0; i < this.speedMultiplier; i++) {
                    this.updateFields();
                    this.updateTractors();
                    this.updateWorkers();
                    this.payWages();
                }
                this.checkBankruptcy(); // 破産チェック
                this.updateDisplay();
            }
        }, 100);
    }
    
    checkBankruptcy() {
        if (this.money <= 0) {
            if (this.bankruptcyEnabled) {
                // 破産システムが有効な場合
                this.triggerBankruptcy();
            } else {
                // 破産システムが無効な場合、援助金を提供
                this.provideEmergencyAid();
            }
        }
    }
    
    triggerBankruptcy() {
        this.isGameOver = true;
        this.showBankruptcyScreen();
    }
    
    provideEmergencyAid() {
        if (this.money <= 0) {
            const aidAmount = 500;
            this.money = aidAmount;
            this.showNotification(`💰 えんじょきん ${aidAmount}G をもらいました！`, 'success');
        }
    }
    
    showBankruptcyScreen() {
        const bankruptcyModal = document.createElement('div');
        bankruptcyModal.className = 'bankruptcy-modal';
        bankruptcyModal.innerHTML = `
            <div class="bankruptcy-container">
                <div class="bankruptcy-header">
                    <h2>💸 はさん</h2>
                    <p>おかねがなくなってしまいました...</p>
                </div>
                <div class="bankruptcy-content">
                    <div class="bankruptcy-icon">😢</div>
                    <p>ゲームオーバーです</p>
                    <p>さいしょからやりなおしますか？</p>
                </div>
                <div class="bankruptcy-buttons">
                    <button onclick="game.restartGame()" class="restart-btn">
                        🔄 さいしょからはじめる
                    </button>
                    <button onclick="game.toggleBankruptcySystem()" class="settings-btn">
                        ⚙️ はさんシステムをOFFにする
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(bankruptcyModal);
    }
    
    restartGame() {
        // 破産画面を閉じる
        const bankruptcyModal = document.querySelector('.bankruptcy-modal');
        if (bankruptcyModal) {
            document.body.removeChild(bankruptcyModal);
        }
        
        // ゲーム状態をリセット
        this.money = 1000;
        this.fields = [
            { id: 0, state: 'empty', crop: null, plantTime: 0, growthTime: 0 },
            { id: 1, state: 'empty', crop: null, plantTime: 0, growthTime: 0 },
            { id: 2, state: 'empty', crop: null, plantTime: 0, growthTime: 0 },
            { id: 3, state: 'empty', crop: null, plantTime: 0, growthTime: 0 },
            { id: 4, state: 'empty', crop: null, plantTime: 0, growthTime: 0 }
        ];
        this.tractors = [{ id: 0, capacity: 10, currentLoad: 0, state: 'idle', returnTime: 0, roundTripTime: 8000 }];
        this.ownedSeeds = ['apple', 'orange'];
        this.fieldPrice = 800;
        this.tractorPrice = 2000;
        this.currentFieldId = 4;
        this.currentTractorId = 0;
        this.workers = [];
        this.currentWorkerId = -1;
        this.isGameOver = false;
        
        // 表示を更新
        this.updateDisplay();
        this.renderFields();
        this.renderTractors();
        this.renderWorkers();
        this.renderShopSeeds();
        
        this.showNotification('🎮 ゲームをさいしょからはじめました！', 'success');
    }
    
    toggleBankruptcySystem() {
        this.bankruptcyEnabled = !this.bankruptcyEnabled;
        
        // 破産画面を閉じる
        const bankruptcyModal = document.querySelector('.bankruptcy-modal');
        if (bankruptcyModal) {
            document.body.removeChild(bankruptcyModal);
        }
        
        // 援助金を提供してゲーム継続
        if (!this.bankruptcyEnabled) {
            this.isGameOver = false;
            this.provideEmergencyAid();
            this.showNotification('⚙️ はさんシステムをOFFにしました', 'success');
        }
        
        // メニューの表示を更新
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
    
    updateWorkers() {
        this.workers.forEach(worker => {
            if (worker.type === 'planter' && worker.isActive) {
                this.autoPlantSeeds();
            } else if (worker.type === 'harvester' && worker.isActive) {
                this.autoHarvestCrops();
            }
        });
    }
    
    autoPlantSeeds() {
        // 2秒に1回程度の頻度で自動植え付け
        if (Math.random() < 0.02) {
            const emptyField = this.fields.find(f => f.state === 'empty');
            if (emptyField && this.ownedSeeds.length > 0) {
                // ランダムに所持している種から選択
                const randomSeed = this.ownedSeeds[Math.floor(Math.random() * this.ownedSeeds.length)];
                const crop = this.cropData[randomSeed];
                
                if (this.money >= crop.seedPrice) {
                    this.money -= crop.seedPrice;
                    emptyField.state = 'growing';
                    emptyField.crop = randomSeed;
                    emptyField.plantTime = Date.now();
                    emptyField.growthTime = crop.growthTime;
                    
                    this.createFarmerAnimation(emptyField.id, 'planting');
                    this.addFieldStateChangeAnimation(emptyField.id);
                }
            }
        }
    }
    
    autoHarvestCrops() {
        // 1.5びょうに1かいていどのひんどでじどうしゅうかく
        if (Math.random() < 0.03) {
            const readyField = this.fields.find(f => f.state === 'ready');
            const availableTractor = this.tractors.find(t => t.state === 'idle' && t.currentLoad < t.capacity);
            
            if (readyField && availableTractor) {
                const crop = this.cropData[readyField.crop];
                
                this.createFarmerAnimation(readyField.id, 'harvesting');
                
                setTimeout(() => {
                    this.createHarvestEffect(readyField.id, crop.icon);
                    this.createLoadingAnimation(readyField.id, crop.icon);
                    
                    availableTractor.currentLoad++;
                    
                    readyField.state = 'empty';
                    readyField.crop = null;
                    readyField.plantTime = 0;
                    readyField.growthTime = 0;
                    
                    this.addFieldStateChangeAnimation(readyField.id);
                    
                    if (availableTractor.currentLoad >= availableTractor.capacity) {
                        setTimeout(() => {
                            this.shipTractor(availableTractor);
                        }, 500);
                    }
                }, 1500);
            }
        }
    }
    
    payWages() {
        const now = Date.now();
        if (now - this.lastWagePayment >= this.wageInterval) {
            let totalWages = 0;
            
            this.workers.forEach(worker => {
                if (worker.isActive) {
                    totalWages += this.workerTypes[worker.type].dailyWage;
                }
            });
            
            if (totalWages > 0) {
                if (this.money >= totalWages) {
                    this.money -= totalWages;
                    this.showNotification(`💸 賃金を支払いました: -${totalWages} G`, 'warning');
                } else {
                    // 資金不足の場合、労働者を解雇
                    this.workers.forEach(worker => {
                        if (worker.isActive) {
                            worker.isActive = false;
                            this.showNotification(`😢 ${this.workerTypes[worker.type].name}を解雇しました（資金不足）`, 'error');
                        }
                    });
                }
            }
            
            this.lastWagePayment = now;
        }
    }
    
    updateFields() {
        this.fields.forEach(field => {
            if (field.state === 'growing') {
                const elapsed = Date.now() - field.plantTime;
                const progress = elapsed / field.growthTime;
                
                if (progress >= 1) {
                    field.state = 'ready';
                    // 成長完了アニメーション
                    this.createGrowthCompleteEffect(field.id);
                    this.showNotification(`🌾 ${this.cropData[field.crop].name}がしゅうかくできるようになりました！`, 'success');
                } else {
                    // プログレスバーの更新は表示更新で行う
                }
            }
        });
    }
    
    updateTractors() {
        this.tractors.forEach(tractor => {
            if (tractor.state === 'transporting') {
                if (Date.now() >= tractor.returnTime) {
                    tractor.state = 'idle';
                    tractor.currentLoad = 0;
                    
                    // トラクター帰還アニメーション
                    this.createTractorReturnEffect(tractor.id);
                    this.showNotification(`🚜 トラクターが戻ってきました！`, 'success');
                }
            }
        });
    }
    
    updateDisplay() {
        const moneyElement = document.getElementById('money');
        const oldMoney = parseInt(moneyElement.textContent);
        
        if (this.money > oldMoney) {
            // お金が増えた時のアニメーション
            moneyElement.parentElement.classList.add('money-increase');
            setTimeout(() => {
                moneyElement.parentElement.classList.remove('money-increase');
            }, 600);
        }
        
        moneyElement.textContent = this.money;
        document.getElementById('field-price').textContent = `${this.fieldPrice} G`;
        document.getElementById('tractor-price').textContent = `${this.tractorPrice} G`;
        
        // ゲーム統計を更新
        document.getElementById('field-count').textContent = this.fields.length;
        document.getElementById('tractor-count').textContent = this.tractors.length;
        document.getElementById('seed-count').textContent = this.ownedSeeds.length;
        
        this.renderFields();
        this.renderTractors();
        this.renderWorkers();
        this.renderSeedSelector();
    }
    
    renderFields() {
        const container = document.getElementById('fields-container');
        
        // 既存の畑要素を更新するか、新しく作成する
        this.fields.forEach(field => {
            let fieldElement = container.querySelector(`[data-field-id="${field.id}"]`);
            
            if (!fieldElement) {
                // あたらしいはたけ要素を作成
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
                case 'growing':
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
        
        // 削除された畑要素を除去
        const existingFields = container.querySelectorAll('.field');
        existingFields.forEach(element => {
            const fieldId = parseInt(element.dataset.fieldId);
            if (!this.fields.find(f => f.id === fieldId)) {
                element.remove();
            }
        });
    }
    
    renderTractors() {
        const container = document.getElementById('tractors-container');
        container.innerHTML = '';
        
        this.tractors.forEach(tractor => {
            const tractorElement = document.createElement('div');
            tractorElement.className = `tractor ${tractor.state}`;
            
            const capacityPercent = (tractor.currentLoad / tractor.capacity) * 100;
            let statusText = tractor.state === 'idle' ? '待機中' : '運搬中';
            let timerText = '';
            let controlButton = '';
            
            if (tractor.state === 'transporting') {
                const remaining = Math.max(0, tractor.returnTime - Date.now());
                const seconds = Math.ceil(remaining / 1000);
                timerText = `<div class="timer">⏰ 戻るまで: ${seconds}秒</div>`;
            } else {
                // 待機中のトラクターには操作ボタンを表示
                controlButton = `<button class="tractor-control-btn" onclick="openTractorControl()">🎮 操作</button>`;
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
    }
    
    renderShopSeeds() {
        const container = document.getElementById('seeds-list');
        container.innerHTML = '';
        
        Object.entries(this.cropData).forEach(([key, crop]) => {
            if (!crop.unlocked) {
                const seedElement = document.createElement('div');
                seedElement.className = 'shop-item';
                
                const canAfford = this.money >= crop.seedPrice;
                
                seedElement.innerHTML = `
                    <div class="item-info">
                        <h3>${crop.icon} ${crop.name}の種</h3>
                        <p>成長時間: ${crop.growthTime / 1000}秒 | 売値: ${crop.sellPrice} G</p>
                    </div>
                    <div class="item-purchase">
                        <span class="price">${crop.seedPrice} G</span>
                        <button onclick="game.buySeed('${key}')" ${!canAfford ? 'disabled' : ''}>
                            ${canAfford ? '購入' : '資金不足'}
                        </button>
                    </div>
                `;
                
                container.appendChild(seedElement);
            }
        });
    }
    
    handleFieldClick(fieldId) {
        const field = this.fields.find(f => f.id === fieldId);
        
        if (field.state === 'empty') {
            // 現在選択されている種を直接植える
            const crop = this.cropData[this.selectedSeedType];
            if (crop && crop.unlocked && this.ownedSeeds.includes(this.selectedSeedType)) {
                if (this.money >= crop.seedPrice) {
                    this.money -= crop.seedPrice;
                    this.plantSeedDirect(fieldId, this.selectedSeedType);
                } else {
                    this.showNotification('💰 おかねがたりません！', 'error');
                }
            } else if (!crop.unlocked || !this.ownedSeeds.includes(this.selectedSeedType)) {
                this.showNotification(`❌ ${crop.name}の種はまだ購入していません`, 'error');
            }
        } else if (field.state === 'ready') {
            this.harvestField(fieldId);
        }
    }
    
    plantSeedDirect(fieldId, seedKey) {
        const field = this.fields.find(f => f.id === fieldId);
        const crop = this.cropData[seedKey];
        
        // 農家アニメーションを表示
        this.createFarmerAnimation(fieldId, 'planting');
        
        // 少し遅らせて実際の植え付けを実行
        setTimeout(() => {
            field.state = 'growing';
            field.crop = seedKey;
            field.plantTime = Date.now();
            field.growthTime = crop.growthTime;
            
            // 畑の状態変化アニメーション
            this.addFieldStateChangeAnimation(fieldId);
            
            // 種植えエフェクト
            this.createPlantingEffect(fieldId);
            
            this.showNotification(`🌱 ${crop.name}をうえました！`, 'success');
            this.updateDisplay();
        }, 1000);
    }
    
    selectSeedType(seedKey) {
        console.log('種選択:', seedKey, 'が所持種に含まれているか:', this.ownedSeeds.includes(seedKey));
        
        if (this.ownedSeeds.includes(seedKey)) {
            this.selectedSeedType = seedKey;
            this.updateSeedSelector();
            this.showNotification(`🌰 ${this.cropData[seedKey].name}を選択しました`, 'success');
            console.log('種選択完了:', this.selectedSeedType);
        } else {
            console.log('エラー: 種が所持リストにありません');
        }
    }
    
    updateSeedSelector() {
        // 種選択UIを更新
        document.querySelectorAll('.seed-selector-option').forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.seed === this.selectedSeedType) {
                option.classList.add('selected');
            }
        });
    }
    
    showSeedModal() {
        const modal = document.getElementById('seed-modal');
        const options = document.getElementById('seed-options');
        options.innerHTML = '';
        
        this.ownedSeeds.forEach(seedKey => {
            const crop = this.cropData[seedKey];
            const option = document.createElement('div');
            option.className = 'seed-option';
            option.onclick = () => this.plantSeed(seedKey);
            
            option.innerHTML = `
                <div class="seed-icon">${crop.icon}</div>
                <div class="seed-name">${crop.name}</div>
            `;
            
            options.appendChild(option);
        });
        
        modal.classList.add('active');
    }
    
    plantSeed(seedKey) {
        const field = this.fields.find(f => f.id === this.selectedField);
        const crop = this.cropData[seedKey];
        
        // 農家アニメーションを表示
        this.createFarmerAnimation(this.selectedField, 'planting');
        
        // 少し遅らせて実際の植え付けを実行
        setTimeout(() => {
            field.state = 'growing';
            field.crop = seedKey;
            field.plantTime = Date.now();
            field.growthTime = crop.growthTime;
            
            // 畑の状態変化アニメーション
            this.addFieldStateChangeAnimation(this.selectedField);
            
            // 種植えエフェクト
            this.createPlantingEffect(this.selectedField);
            
            this.showNotification(`🌱 ${crop.name}をうえました！`, 'success');
            this.updateDisplay();
        }, 1000);
        
        this.closeSeedModal();
    }
    
    harvestField(fieldId) {
        const field = this.fields.find(f => f.id === fieldId);
        const crop = this.cropData[field.crop];
        
        // 待機中のトラクターを探す
        const availableTractor = this.tractors.find(t => t.state === 'idle' && t.currentLoad < t.capacity);
        
        if (!availableTractor) {
            this.showNotification('⚠️ 利用可能なトラクターがありません！', 'warning');
            return;
        }
        
        // のうかのしゅうかくアニメーションをひょうじ
        this.createFarmerAnimation(fieldId, 'harvesting');
        
        // アニメーションごにじっさいのしゅうかくしょりをじっこう
        setTimeout(() => {
            // しゅうかくエフェクト
            this.createHarvestEffect(fieldId, crop.icon);
            
            // トラクターへの積み込みアニメーション
            this.createLoadingAnimation(fieldId, crop.icon);
            
            // トラクターに積み込み
            availableTractor.currentLoad++;
            
            // 畑をリセット
            field.state = 'empty';
            field.crop = null;
            field.plantTime = 0;
            field.growthTime = 0;
            
            // 畑の状態変化アニメーション
            this.addFieldStateChangeAnimation(fieldId);
            
            this.showNotification(`✅ ${crop.name}をしゅうかくしました！`, 'success');
            
            // トラクターが満載になったら出荷
            if (availableTractor.currentLoad >= availableTractor.capacity) {
                setTimeout(() => {
                    this.shipTractor(availableTractor);
                }, 500);
            }
            
            this.updateDisplay();
        }, 1500);
    }
    
    createHarvestEffect(fieldId, icon) {
        const fieldElement = document.querySelector(`[data-field-id="${fieldId}"]`);
        const rect = fieldElement.getBoundingClientRect();
        
        const effect = document.createElement('div');
        effect.className = 'harvest-effect';
        effect.textContent = icon;
        effect.style.left = rect.left + rect.width / 2 + 'px';
        effect.style.top = rect.top + rect.height / 2 + 'px';
        
        document.body.appendChild(effect);
        
        setTimeout(() => {
            document.body.removeChild(effect);
        }, 1000);
    }
    
    createFarmerAnimation(fieldId, action) {
        const fieldElement = document.querySelector(`[data-field-id="${fieldId}"]`);
        const rect = fieldElement.getBoundingClientRect();
        
        const farmer = document.createElement('div');
        farmer.className = `farmer-animation farmer-${action}`;
        
        // アクションに応じて農家の絵文字を変更
        const farmerIcons = {
            planting: '👨‍🌾',
            harvesting: '👩‍🌾'
        };
        
        farmer.textContent = farmerIcons[action] || '👨‍🌾';
        farmer.style.left = rect.left + rect.width / 2 + 'px';
        farmer.style.top = rect.top + rect.height / 2 + 'px';
        
        document.body.appendChild(farmer);
        
        // アニメーション時間に応じて削除
        const duration = action === 'planting' ? 2000 : 2500;
        setTimeout(() => {
            if (document.body.contains(farmer)) {
                document.body.removeChild(farmer);
            }
        }, duration);
    }
    
    createPlantingEffect(fieldId) {
        const fieldElement = document.querySelector(`[data-field-id="${fieldId}"]`);
        const rect = fieldElement.getBoundingClientRect();
        
        const effects = ['✨', '🌟', '💫'];
        
        effects.forEach((effect, index) => {
            setTimeout(() => {
                const sparkle = document.createElement('div');
                sparkle.className = 'planting-effect';
                sparkle.textContent = effect;
                sparkle.style.left = rect.left + rect.width / 2 + (index - 1) * 20 + 'px';
                sparkle.style.top = rect.top + rect.height / 2 + (index - 1) * 15 + 'px';
                
                document.body.appendChild(sparkle);
                
                setTimeout(() => {
                    if (document.body.contains(sparkle)) {
                        document.body.removeChild(sparkle);
                    }
                }, 1500);
            }, index * 200);
        });
    }
    
    createLoadingAnimation(fieldId, icon) {
        const fieldElement = document.querySelector(`[data-field-id="${fieldId}"]`);
        const rect = fieldElement.getBoundingClientRect();
        
        const loading = document.createElement('div');
        loading.className = 'loading-animation';
        loading.textContent = `📦${icon}`;
        loading.style.left = rect.left + rect.width / 2 + 'px';
        loading.style.top = rect.top + rect.height / 2 + 'px';
        
        document.body.appendChild(loading);
        
        setTimeout(() => {
            if (document.body.contains(loading)) {
                document.body.removeChild(loading);
            }
        }, 1500);
    }
    
    addFieldStateChangeAnimation(fieldId) {
        const fieldElement = document.querySelector(`[data-field-id="${fieldId}"]`);
        if (fieldElement) {
            fieldElement.classList.add('state-changing');
            setTimeout(() => {
                fieldElement.classList.remove('state-changing');
            }, 500);
        }
    }
    
    addTractorShippingAnimation(tractorId) {
        // トラクター要素を見つけるのは少し複雑なので、全てのトラクターをチェック
        const tractorElements = document.querySelectorAll('.tractor');
        if (tractorElements[tractorId]) {
            tractorElements[tractorId].classList.add('shipping');
            setTimeout(() => {
                tractorElements[tractorId].classList.remove('shipping');
            }, 1000);
        }
    }
    
    createGrowthCompleteEffect(fieldId) {
        const fieldElement = document.querySelector(`[data-field-id="${fieldId}"]`);
        if (!fieldElement) return;
        
        const rect = fieldElement.getBoundingClientRect();
        
        // 成長完了の光るエフェクト
        const effects = ['🌟', '✨', '💫', '🌟', '✨'];
        
        effects.forEach((effect, index) => {
            setTimeout(() => {
                const sparkle = document.createElement('div');
                sparkle.className = 'planting-effect';
                sparkle.textContent = effect;
                
                // 円形に配置
                const angle = (index / effects.length) * 2 * Math.PI;
                const radius = 40;
                const x = rect.left + rect.width / 2 + Math.cos(angle) * radius;
                const y = rect.top + rect.height / 2 + Math.sin(angle) * radius;
                
                sparkle.style.left = x + 'px';
                sparkle.style.top = y + 'px';
                
                document.body.appendChild(sparkle);
                
                setTimeout(() => {
                    if (document.body.contains(sparkle)) {
                        document.body.removeChild(sparkle);
                    }
                }, 1500);
            }, index * 100);
        });
        
        // 畑自体にも光るエフェクト
        this.addFieldStateChangeAnimation(fieldId);
    }
    
    createTractorReturnEffect(tractorId) {
        // トラクター要素を見つける
        const tractorElements = document.querySelectorAll('.tractor');
        if (tractorElements[tractorId]) {
            const tractorElement = tractorElements[tractorId];
            const rect = tractorElement.getBoundingClientRect();
            
            // 帰還エフェクト
            const effects = ['🎉', '🎊', '✨'];
            
            effects.forEach((effect, index) => {
                setTimeout(() => {
                    const celebration = document.createElement('div');
                    celebration.className = 'planting-effect';
                    celebration.textContent = effect;
                    celebration.style.left = rect.left + rect.width / 2 + (index - 1) * 30 + 'px';
                    celebration.style.top = rect.top + rect.height / 2 - 20 + 'px';
                    
                    document.body.appendChild(celebration);
                    
                    setTimeout(() => {
                        if (document.body.contains(celebration)) {
                            document.body.removeChild(celebration);
                        }
                    }, 1500);
                }, index * 150);
            });
            
            // トラクター自体にもアニメーション
            tractorElement.classList.add('shipping');
            setTimeout(() => {
                tractorElement.classList.remove('shipping');
            }, 1000);
        }
    }
    
    shipTractor(tractor) {
        // トラクター操作ゲームを開始
        this.startTractorGame(tractor);
    }
    
    startTractorGame(tractor) {
        // トラクター操作ゲーム画面を表示
        const gameModal = document.createElement('div');
        gameModal.className = 'tractor-game-modal';
        gameModal.innerHTML = `
            <div class="tractor-game-container">
                <div class="tractor-game-header">
                    <h3>🚜 トラクターうんてんゲーム</h3>
                    <p>じゅうじキーでトラクターをうごかして<br>そうこまでとどけよう！</p>
                    <div class="game-info">
                        <span class="load-info">つみに: ${tractor.currentLoad}こ</span>
                        <span class="timer-info">のこりじかん: <span id="game-timer">30</span>びょう</span>
                    </div>
                </div>
                <canvas id="tractor-game-canvas" width="600" height="400"></canvas>
                <div class="tractor-game-controls">
                    <p>じゅうじキー: いどう</p>
                    <p>しょうがいぶつにあたるとやさいをおとします！</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(gameModal);
        
        // ゲームを初期化
        const game = new TractorMiniGame(tractor, (success, remainingLoad) => {
            document.body.removeChild(gameModal);
            this.completeTractorShipping(tractor, success, remainingLoad);
        });
        
        game.start();
    }
    
    completeTractorShipping(tractor, success, remainingLoad) {
        if (success) {
            // せいこうじの処理
            const earnings = remainingLoad * 50;
            this.money += earnings;
            
            tractor.state = 'transporting';
            tractor.returnTime = Date.now() + tractor.roundTripTime;
            tractor.currentLoad = 0;
            
            this.addTractorShippingAnimation(tractor.id);
            this.showNotification(`🎉 はいたつせいこう！ +${earnings} G`, 'success');
        } else {
            // しっぱいじの処理
            const lostLoad = tractor.currentLoad - remainingLoad;
            const earnings = remainingLoad * 50;
            
            if (remainingLoad > 0) {
                this.money += earnings;
                this.showNotification(`😅 ${lostLoad}こおとしましたが、${remainingLoad}ことどけました！ +${earnings} G`, 'warning');
            } else {
                this.showNotification(`😱 すべてのやさいをおとしてしまいました...`, 'error');
            }
            
            tractor.state = 'transporting';
            tractor.returnTime = Date.now() + tractor.roundTripTime;
            tractor.currentLoad = 0;
            
            this.addTractorShippingAnimation(tractor.id);
        }
    }
    
    buyField() {
        if (this.money >= this.fieldPrice) {
            this.money -= this.fieldPrice;
            this.currentFieldId++;
            this.fields.push({
                id: this.currentFieldId,
                state: 'empty',
                crop: null,
                plantTime: 0,
                growthTime: 0
            });
            
            this.fieldPrice = Math.floor(this.fieldPrice * 1.5);
            
            // 購入成功アニメーション
            this.addPurchaseSuccessAnimation();
            this.showNotification('🌱 あたらしいはたけをこうにゅうしました！', 'success');
            this.updateDisplay();
        } else {
            this.showNotification('💰 おかねがたりません！', 'error');
        }
    }
    
    buyTractor() {
        if (this.money >= this.tractorPrice) {
            this.money -= this.tractorPrice;
            this.currentTractorId++;
            this.tractors.push({
                id: this.currentTractorId,
                capacity: 10,
                currentLoad: 0,
                state: 'idle',
                returnTime: 0,
                roundTripTime: 8000
            });
            
            this.tractorPrice = Math.floor(this.tractorPrice * 1.8);
            
            // 購入成功アニメーション
            this.addPurchaseSuccessAnimation();
            this.showNotification('🚜 あたらしいトラクターをこうにゅうしました！', 'success');
            this.updateDisplay();
        } else {
            this.showNotification('💰 おかねがたりません！', 'error');
        }
    }
    
    // デバッグ用倍速機能
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
    
    buySeed(seedKey) {
        const crop = this.cropData[seedKey];
        
        if (this.money >= crop.seedPrice) {
            this.money -= crop.seedPrice;
            crop.unlocked = true;
            this.ownedSeeds.push(seedKey);
            
            // 購入成功アニメーション
            this.addPurchaseSuccessAnimation();
            this.showNotification(`🌰 ${crop.name}の種をこうにゅうしました！`, 'success');
            this.renderShopSeeds();
            this.renderSeedSelector(); // 種選択UIも更新
            this.updateDisplay();
        } else {
            this.showNotification('💰 おかねがたりません！', 'error');
        }
    }
    
    hireWorker(workerType) {
        const workerInfo = this.workerTypes[workerType];
        
        if (this.money >= workerInfo.hireCost) {
            this.money -= workerInfo.hireCost;
            this.currentWorkerId++;
            
            const newWorker = {
                id: this.currentWorkerId,
                type: workerType,
                isActive: true,
                hireTime: Date.now()
            };
            
            this.workers.push(newWorker);
            
            this.addPurchaseSuccessAnimation();
            this.showNotification(`👷 ${workerInfo.name}を雇いました！`, 'success');
            this.updateDisplay();
        } else {
            this.showNotification('💰 おかねがたりません！', 'error');
        }
    }
    
    fireWorker(workerId) {
        const workerIndex = this.workers.findIndex(w => w.id === workerId);
        if (workerIndex !== -1) {
            const worker = this.workers[workerIndex];
            const workerInfo = this.workerTypes[worker.type];
            
            this.workers.splice(workerIndex, 1);
            this.showNotification(`👋 ${workerInfo.name}を解雇しました`, 'warning');
            this.updateDisplay();
        }
    }
    
    toggleWorker(workerId) {
        const worker = this.workers.find(w => w.id === workerId);
        if (worker) {
            worker.isActive = !worker.isActive;
            const workerInfo = this.workerTypes[worker.type];
            const status = worker.isActive ? '作業開始' : '作業停止';
            this.showNotification(`${workerInfo.icon} ${workerInfo.name}が${status}しました`, 'success');
            this.updateDisplay();
        }
    }
    
    renderWorkers() {
        const container = document.getElementById('workers-container');
        container.innerHTML = '';
        
        if (this.workers.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666; font-size: 0.9em;">ろうどうしゃなし<br>ショップでこようできます</p>';
            return;
        }
        
        this.workers.forEach(worker => {
            const workerInfo = this.workerTypes[worker.type];
            const workerElement = document.createElement('div');
            workerElement.className = `worker ${worker.isActive ? 'active' : 'inactive'}`;
            
            workerElement.innerHTML = `
                <div class="worker-header">
                    <span class="worker-name">${workerInfo.icon} ${workerInfo.name}</span>
                    <span class="worker-status ${worker.isActive ? 'active' : 'inactive'}">
                        ${worker.isActive ? '作業中' : '停止中'}
                    </span>
                </div>
                <div class="worker-wage">賃金: ${workerInfo.dailyWage} G/30秒</div>
                <div class="worker-controls">
                    <button class="worker-btn toggle" onclick="game.toggleWorker(${worker.id})">
                        ${worker.isActive ? '停止' : '開始'}
                    </button>
                    <button class="worker-btn fire" onclick="game.fireWorker(${worker.id})">
                        解雇
                    </button>
                </div>
            `;
            
            container.appendChild(workerElement);
        });
    }
    
    renderSeedSelector() {
        const container = document.getElementById('seed-selector');
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
        
        // 初期選択状態を確実に設定
        this.updateSeedSelector();
    }
    
    addPurchaseSuccessAnimation() {
        const shopContent = document.querySelector('.shop-content');
        if (shopContent) {
            shopContent.classList.add('purchase-success');
            setTimeout(() => {
                shopContent.classList.remove('purchase-success');
            }, 800);
        }
    }
    
    startAutoSave() {
        // 30秒ごとに自動セーブ
        setInterval(() => {
            this.saveGame();
        }, 30000);
    }
    
    saveGame() {
        const saveData = {
            money: this.money,
            fields: this.fields,
            tractors: this.tractors,
            ownedSeeds: this.ownedSeeds,
            fieldPrice: this.fieldPrice,
            tractorPrice: this.tractorPrice,
            currentFieldId: this.currentFieldId,
            currentTractorId: this.currentTractorId,
            selectedSeedType: this.selectedSeedType,
            workers: this.workers,
            currentWorkerId: this.currentWorkerId,
            lastWagePayment: this.lastWagePayment,
            cropData: this.cropData,
            gameSpeed: this.gameSpeed,
            speedMultiplier: this.speedMultiplier,
            bankruptcyEnabled: this.bankruptcyEnabled, // 破産システム設定を保存
            saveTime: Date.now()
        };
        
        try {
            localStorage.setItem('harvestPorterSave', JSON.stringify(saveData));
            this.showNotification('💾 ゲームを保存しました', 'success');
        } catch (error) {
            this.showNotification('❌ 保存に失敗しました', 'error');
            console.error('Save failed:', error);
        }
    }
    
    loadGame() {
        try {
            const saveData = localStorage.getItem('harvestPorterSave');
            if (saveData) {
                const data = JSON.parse(saveData);
                
                // データを復元
                this.money = data.money || 2000;
                this.fields = data.fields || [
                    { id: 0, state: 'empty', crop: null, plantTime: 0, growthTime: 0 },
                    { id: 1, state: 'empty', crop: null, plantTime: 0, growthTime: 0 },
                    { id: 2, state: 'empty', crop: null, plantTime: 0, growthTime: 0 },
                    { id: 3, state: 'empty', crop: null, plantTime: 0, growthTime: 0 },
                    { id: 4, state: 'empty', crop: null, plantTime: 0, growthTime: 0 }
                ];
                this.tractors = data.tractors || [{ id: 0, capacity: 10, currentLoad: 0, state: 'idle', returnTime: 0, roundTripTime: 8000 }];
                this.ownedSeeds = data.ownedSeeds || ['apple', 'orange'];
                this.fieldPrice = data.fieldPrice || 800;
                this.tractorPrice = data.tractorPrice || 2000;
                this.currentFieldId = data.currentFieldId || 4;
                this.currentTractorId = data.currentTractorId || 0;
                this.selectedSeedType = data.selectedSeedType || 'apple';
                this.workers = data.workers || [];
                this.currentWorkerId = data.currentWorkerId || -1;
                this.lastWagePayment = data.lastWagePayment || Date.now();
                
                // 倍速設定を復元
                this.gameSpeed = data.gameSpeed || 1;
                this.speedMultiplier = data.speedMultiplier || 1;
                
                // 破産システム設定を復元
                this.bankruptcyEnabled = data.bankruptcyEnabled || false;
                
                // 倍速ボタンの表示を更新
                setTimeout(() => {
                    const speedText = document.getElementById('speed-text');
                    const speedBtn = document.getElementById('speed-toggle-btn');
                    
                    if (speedText && speedBtn) {
                        speedText.textContent = `${this.gameSpeed}x`;
                        speedBtn.className = 'speed-toggle-btn';
                        if (this.gameSpeed === 2) speedBtn.classList.add('speed-2x');
                        else if (this.gameSpeed === 4) speedBtn.classList.add('speed-4x');
                        else if (this.gameSpeed === 8) speedBtn.classList.add('speed-8x');
                    }
                }, 100);
                
                // 作物データのアンロック状態を復元
                if (data.cropData) {
                    Object.keys(data.cropData).forEach(key => {
                        if (this.cropData[key] && data.cropData[key].unlocked !== undefined) {
                            this.cropData[key].unlocked = data.cropData[key].unlocked;
                        }
                    });
                }
                
                // 運搬中のトラクターの時間を調整
                const currentTime = Date.now();
                const timeDiff = currentTime - (data.saveTime || currentTime);
                
                this.tractors.forEach(tractor => {
                    if (tractor.state === 'transporting' && tractor.returnTime) {
                        tractor.returnTime += timeDiff;
                        // もし既に戻る時間を過ぎていたら、アイドル状態にする
                        if (tractor.returnTime <= currentTime) {
                            tractor.state = 'idle';
                            tractor.currentLoad = 0;
                        }
                    }
                });
                
                // 成長中の作物の時間を調整
                this.fields.forEach(field => {
                    if (field.state === 'growing' && field.plantTime && field.growthTime) {
                        const elapsed = currentTime - field.plantTime;
                        if (elapsed >= field.growthTime) {
                            field.state = 'ready';
                        }
                    }
                });
                
                // 賃金支払い時間を調整
                this.lastWagePayment += timeDiff;
                
                this.showNotification('📂 セーブデータを読み込みました', 'success');
            }
        } catch (error) {
            this.showNotification('❌ セーブデータの読み込みに失敗しました', 'error');
            console.error('Load failed:', error);
        }
    }
    
    resetGame() {
        if (confirm('本当にゲームをリセットしますか？すべての進行状況が失われます。')) {
            localStorage.removeItem('harvestPorterSave');
            location.reload();
        }
    }
    
    exportSave() {
        try {
            const saveData = localStorage.getItem('harvestPorterSave');
            if (saveData) {
                const blob = new Blob([saveData], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `harvest-porter-save-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                this.showNotification('💾 セーブファイルをダウンロードしました', 'success');
            } else {
                this.showNotification('❌ セーブデータがありません', 'error');
            }
        } catch (error) {
            this.showNotification('❌ エクスポートに失敗しました', 'error');
            console.error('Export failed:', error);
        }
    }
    
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.getElementById('notifications').appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    closeSeedModal() {
        document.getElementById('seed-modal').classList.remove('active');
        this.selectedField = null;
    }
}

// UI制御関数
function toggleShop() {
    const modal = document.getElementById('shop-modal');
    modal.classList.toggle('active');
    
    if (modal.classList.contains('active')) {
        game.renderShopSeeds();
    }
}

function toggleGameMenu() {
    const modal = document.getElementById('game-menu-modal');
    modal.classList.toggle('active');
}

function openTractorControl() {
    const modal = document.getElementById('tractor-control-modal');
    modal.classList.add('active');
    
    // 既存のゲームがあれば停止
    if (tractorControlGame) {
        tractorControlGame.stop();
        tractorControlGame = null;
    }
    
    // 少し待ってからcanvasを取得してゲームを開始
    setTimeout(() => {
        const canvas = document.getElementById('tractor-canvas');
        if (canvas) {
            // canvasのサイズを確認・設定
            if (canvas.width === 0 || canvas.height === 0) {
                canvas.width = 600;
                canvas.height = 400;
            }
            
            tractorControlGame = new TractorControlGame(canvas);
            if (tractorControlGame.canvas && tractorControlGame.ctx) {
                tractorControlGame.start();
            } else {
                console.error('Failed to initialize TractorControlGame');
                game.showNotification('トラクター操作ゲームの初期化に失敗しました', 'error');
            }
        } else {
            console.error('Canvas element not found');
            game.showNotification('キャンバス要素が見つかりません', 'error');
        }
    }, 100);
}

function closeTractorControl() {
    const modal = document.getElementById('tractor-control-modal');
    modal.classList.remove('active');
    
    if (tractorControlGame) {
        tractorControlGame.stop();
        tractorControlGame = null;
    }
    
    // canvasをクリア
    const canvas = document.getElementById('tractor-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
}

function switchTab(tabName) {
    // タブボタンの状態更新
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // セクションの表示切り替え
    document.querySelectorAll('.shop-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`shop-${tabName}`).classList.add('active');
}

function closeSeedModal() {
    game.closeSeedModal();
}

function buyField() {
    game.buyField();
}

function buyTractor() {
    game.buyTractor();
}

// ゲーム初期化
// トラクター操作ゲーム
class TractorControlGame {
    constructor(canvas) {
        if (!canvas) {
            console.error('Canvas element not found');
            return;
        }
        
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        if (!this.ctx) {
            console.error('Failed to get 2D context');
            return;
        }
        
        this.isRunning = false;
        this.mouseY = canvas.height / 2; // 初期値をcanvasの中央に設定
        this.isAccelerating = false;
        this.isBraking = false;
        
        // ゲーム状態
        this.tractor = {
            x: 50,
            y: canvas.height / 2,
            width: 40,
            height: 25,
            speed: 0,
            maxSpeed: 8,
            acceleration: 0.3,
            deceleration: 0.2,
            verticalSpeed: 0,
            maxVerticalSpeed: 5 // 3から5に変更
        };
        
        this.fuel = 100;
        this.distance = 0;
        this.targetDistance = 1000;
        this.obstacles = [];
        this.collectibles = [];
        
        this.setupEventListeners();
        this.generateObstacles();
        this.generateCollectibles();
    }
    
    setupEventListeners() {
        // マウス移動
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseY = e.clientY - rect.top;
            // console.log('Mouse Y:', this.mouseY); // デバッグ用（コメントアウト）
        });
        
        // 左クリック（アクセル）
        this.canvas.addEventListener('mousedown', (e) => {
            e.preventDefault();
            if (e.button === 0) { // 左クリック
                this.isAccelerating = true;
            } else if (e.button === 2) { // 右クリック
                this.isBraking = true;
            }
        });
        
        this.canvas.addEventListener('mouseup', (e) => {
            e.preventDefault();
            if (e.button === 0) {
                this.isAccelerating = false;
            } else if (e.button === 2) {
                this.isBraking = false;
            }
        });
        
        // 右クリックメニューを無効化
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        
        // マウスがキャンバスから出た時
        this.canvas.addEventListener('mouseleave', () => {
            this.isAccelerating = false;
            this.isBraking = false;
        });
        
        // マウスがキャンバスに入った時
        this.canvas.addEventListener('mouseenter', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseY = e.clientY - rect.top;
        });
    }
    
    generateObstacles() {
        this.obstacles = [];
        for (let i = 0; i < 10; i++) {
            this.obstacles.push({
                x: 200 + i * 80 + Math.random() * 40,
                y: Math.random() * (this.canvas.height - 60) + 30,
                width: 30,
                height: 30,
                type: Math.random() > 0.5 ? 'rock' : 'tree'
            });
        }
    }
    
    generateCollectibles() {
        this.collectibles = [];
        for (let i = 0; i < 8; i++) {
            this.collectibles.push({
                x: 150 + i * 100 + Math.random() * 50,
                y: Math.random() * (this.canvas.height - 40) + 20,
                width: 20,
                height: 20,
                collected: false,
                type: 'fuel'
            });
        }
    }
    
    start() {
        if (!this.canvas || !this.ctx) {
            console.error('Cannot start game: Canvas or context is null');
            return;
        }
        
        this.isRunning = true;
        this.gameLoop();
    }
    
    stop() {
        this.isRunning = false;
    }
    
    update() {
        try {
            // 垂直移動（マウスY座標に基づく）
            const targetY = this.mouseY - this.tractor.height / 2;
            const deltaY = targetY - this.tractor.y;
            
            // console.log('Tractor Y:', this.tractor.y, 'Target Y:', targetY, 'Delta Y:', deltaY); // デバッグ用（コメントアウト）
            
            if (Math.abs(deltaY) > 2) { // 閾値を5から2に変更してより敏感に
                this.tractor.verticalSpeed = Math.sign(deltaY) * Math.min(Math.abs(deltaY) * 0.15, this.tractor.maxVerticalSpeed); // 係数を0.1から0.15に変更
            } else {
                this.tractor.verticalSpeed *= 0.9; // 減衰を0.8から0.9に変更してよりスムーズに
            }
            
            this.tractor.y += this.tractor.verticalSpeed;
            this.tractor.y = Math.max(0, Math.min(this.canvas.height - this.tractor.height, this.tractor.y));
            
            // 水平移動（アクセル・ブレーキ）
            if (this.isAccelerating && this.fuel > 0) {
                this.tractor.speed = Math.min(this.tractor.speed + this.tractor.acceleration, this.tractor.maxSpeed);
            this.fuel -= 0.2;
        } else if (this.isBraking) {
            this.tractor.speed = Math.max(this.tractor.speed - this.tractor.deceleration * 2, 0);
        } else {
            this.tractor.speed = Math.max(this.tractor.speed - this.tractor.deceleration * 0.5, 0);
        }
        
        this.distance += this.tractor.speed;
        
        // 障害物との衝突判定
        this.obstacles.forEach(obstacle => {
            if (this.checkCollision(this.tractor, obstacle)) {
                this.tractor.speed *= 0.5; // 速度半減
                this.fuel -= 5; // 燃料消費
            }
        });
        
        // アイテム収集
        this.collectibles.forEach(item => {
            if (!item.collected && this.checkCollision(this.tractor, item)) {
                item.collected = true;
                this.fuel = Math.min(this.fuel + 20, 100);
            }
        });
        
        // ゲーム終了条件
        if (this.distance >= this.targetDistance) {
            this.completeDelivery();
        } else if (this.fuel <= 0) {
            this.gameOver();
        }
        
        this.updateUI();
        } catch (error) {
            console.error('Error in TractorControlGame update():', error);
        }
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    draw() {
        try {
            // canvasとcontextの存在確認
            if (!this.canvas || !this.ctx) {
                console.error('Canvas or context is null');
                return;
            }
            
            // 背景をクリア
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // 道路を描画
            this.ctx.fillStyle = '#666';
            this.ctx.fillRect(0, this.canvas.height - 50, this.canvas.width, 50);
            
            // 雲を描画
            this.drawClouds();
            
            // 障害物を描画
            this.obstacles.forEach(obstacle => {
                this.ctx.fillStyle = obstacle.type === 'rock' ? '#8B4513' : '#228B22';
                this.ctx.fillRect(obstacle.x - this.distance * 0.5, obstacle.y, obstacle.width, obstacle.height);
                
                // 絵文字で装飾
                this.ctx.font = '20px Arial';
                this.ctx.fillText(obstacle.type === 'rock' ? '🪨' : '🌳', 
                                obstacle.x - this.distance * 0.5, obstacle.y + 20);
            });
            
            // アイテムを描画
            this.collectibles.forEach(item => {
                if (!item.collected) {
                    this.ctx.font = '16px Arial';
                    this.ctx.fillText('⛽', item.x - this.distance * 0.5, item.y + 15);
                }
            });
            
            // トラクターを描画
            this.ctx.fillStyle = '#4CAF50';
            this.ctx.fillRect(this.tractor.x, this.tractor.y, this.tractor.width, this.tractor.height);
            
            // トラクターの絵文字
            this.ctx.font = '30px Arial';
            this.ctx.fillText('🚜', this.tractor.x - 5, this.tractor.y + 25);
            
            // 進行度バー
            this.drawProgressBar();
        } catch (error) {
            console.error('Error in draw():', error);
        }
    }
    
    drawClouds() {
        try {
            this.ctx.fillStyle = 'white';
            this.ctx.font = '30px Arial';
            for (let i = 0; i < 5; i++) {
                const x = (i * 150 - this.distance * 0.2) % (this.canvas.width + 100);
                const y = 30 + Math.sin(i) * 20;
                this.ctx.fillText('☁️', x, y);
            }
        } catch (error) {
            console.error('Error in drawClouds():', error);
        }
    }
    
    drawProgressBar() {
        try {
            const barWidth = this.canvas.width - 40;
            const barHeight = 20;
            const barX = 20;
            const barY = 10;
            
            // 背景
            this.ctx.fillStyle = '#ddd';
            this.ctx.fillRect(barX, barY, barWidth, barHeight);
            
            // 進行度
            const progress = Math.min(this.distance / this.targetDistance, 1);
            this.ctx.fillStyle = '#4CAF50';
            this.ctx.fillRect(barX, barY, barWidth * progress, barHeight);
            
            // テキスト
            this.ctx.fillStyle = 'black';
            this.ctx.font = '12px Arial';
            this.ctx.fillText(`配達進行度: ${Math.round(progress * 100)}%`, barX + 5, barY + 15);
        } catch (error) {
            console.error('Error in drawProgressBar():', error);
        }
    }
    
    updateUI() {
        document.getElementById('tractor-speed').textContent = Math.round(this.tractor.speed * 10);
        document.getElementById('tractor-distance').textContent = Math.round(this.distance);
        document.getElementById('tractor-fuel').textContent = Math.round(this.fuel);
    }
    
    completeDelivery() {
        this.stop();
        game.showNotification('🎉 配達完了！ボーナス収入を獲得しました！', 'success');
        game.money += 500; // ボーナス
        game.updateDisplay();
        closeTractorControl();
    }
    
    gameOver() {
        this.stop();
        game.showNotification('⛽ 燃料切れ！配達に失敗しました...', 'error');
        closeTractorControl();
    }
    
    gameLoop() {
        if (!this.isRunning) return;
        
        try {
            this.update();
            this.draw();
        } catch (error) {
            console.error('Error in TractorControlGame gameLoop():', error);
            this.stop(); // エラーが発生した場合はゲームを停止
            return;
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

let tractorControlGame = null;

let game;
window.addEventListener('load', () => {
    game = new HarvestPorterGame();
});

// キーボードショートカット
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.getElementById('shop-modal').classList.remove('active');
        document.getElementById('seed-modal').classList.remove('active');
        document.getElementById('game-menu-modal').classList.remove('active');
        closeTractorControl();
    }
    
    if (e.key === 's' || e.key === 'S') {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            game.saveGame();
        } else {
            toggleShop();
        }
    }
    
    if (e.key === 'm' || e.key === 'M') {
        toggleGameMenu();
    }
    
    if (e.key === 't' || e.key === 'T') {
        openTractorControl();
    }
});

// モーダル外クリックで閉じる
document.getElementById('shop-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
        toggleShop();
    }
});

document.getElementById('seed-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
        closeSeedModal();
    }
});

document.getElementById('game-menu-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
        toggleGameMenu();
    }
});

document.getElementById('tractor-control-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
        closeTractorControl();
    }
});

// トラクター操作ミニゲーム
class TractorMiniGame {
    constructor(tractor, onComplete) {
        this.tractor = tractor;
        this.onComplete = onComplete;
        this.canvas = document.getElementById('tractor-game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // ゲーム状態
        this.gameTime = 30; // 30秒制限
        this.isRunning = false;
        this.gameTimer = null;
        
        // トラクターの位置と状態
        this.tractorX = 50;
        this.tractorY = 200;
        this.tractorSpeed = 3;
        this.currentLoad = tractor.currentLoad;
        
        // 道路と障害物
        this.roadY = 150;
        this.roadHeight = 100;
        this.obstacles = [];
        this.obstacleSpawnTimer = 0;
        
        // ゴール（倉庫）
        this.warehouseX = 550;
        this.warehouseY = 160;
        this.warehouseWidth = 40;
        this.warehouseHeight = 80;
        
        // キー入力
        this.keys = {};
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // キーボードイベント
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            e.preventDefault();
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
            e.preventDefault();
        });
    }
    
    start() {
        this.isRunning = true;
        this.gameLoop();
        
        // タイマー開始
        this.gameTimer = setInterval(() => {
            this.gameTime--;
            document.getElementById('game-timer').textContent = this.gameTime;
            
            if (this.gameTime <= 0) {
                this.endGame(false);
            }
        }, 1000);
    }
    
    gameLoop() {
        if (!this.isRunning) return;
        
        this.update();
        this.draw();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        // トラクターの移動
        if (this.keys['ArrowUp'] && this.tractorY > this.roadY) {
            this.tractorY -= this.tractorSpeed;
        }
        if (this.keys['ArrowDown'] && this.tractorY < this.roadY + this.roadHeight - 30) {
            this.tractorY += this.tractorSpeed;
        }
        if (this.keys['ArrowLeft'] && this.tractorX > 0) {
            this.tractorX -= this.tractorSpeed;
        }
        if (this.keys['ArrowRight'] && this.tractorX < this.canvas.width - 30) {
            this.tractorX += this.tractorSpeed;
        }
        
        // 障害物の生成
        this.obstacleSpawnTimer++;
        if (this.obstacleSpawnTimer > 60) { // 約1秒ごと
            this.spawnObstacle();
            this.obstacleSpawnTimer = 0;
        }
        
        // 障害物の移動
        this.obstacles.forEach((obstacle, index) => {
            obstacle.x -= 2;
            
            // 画面外に出た障害物を削除
            if (obstacle.x < -30) {
                this.obstacles.splice(index, 1);
            }
        });
        
        // 衝突判定
        this.checkCollisions();
        
        // ゴール判定
        if (this.tractorX + 30 > this.warehouseX && 
            this.tractorY + 30 > this.warehouseY && 
            this.tractorY < this.warehouseY + this.warehouseHeight) {
            this.endGame(true);
        }
    }
    
    spawnObstacle() {
        const types = ['🗑️', '🪨', '🌳', '⚠️'];
        const obstacle = {
            x: this.canvas.width,
            y: this.roadY + Math.random() * (this.roadHeight - 30),
            type: types[Math.floor(Math.random() * types.length)],
            width: 25,
            height: 25
        };
        this.obstacles.push(obstacle);
    }
    
    checkCollisions() {
        this.obstacles.forEach((obstacle, index) => {
            if (this.tractorX < obstacle.x + obstacle.width &&
                this.tractorX + 30 > obstacle.x &&
                this.tractorY < obstacle.y + obstacle.height &&
                this.tractorY + 30 > obstacle.y) {
                
                // しょうとつ！やさいをおとす
                if (this.currentLoad > 0) {
                    this.currentLoad--;
                    this.createDropEffect(this.tractorX, this.tractorY);
                }
                
                // しょうがいぶつをさくじょ
                this.obstacles.splice(index, 1);
            }
        });
    }
    
    createDropEffect(x, y) {
        // やさいがおちるエフェクト
        const effect = document.createElement('div');
        effect.style.position = 'absolute';
        effect.style.left = x + 'px';
        effect.style.top = y + 'px';
        effect.style.fontSize = '20px';
        effect.textContent = '🥕';
        effect.style.animation = 'drop-effect 1s ease-out forwards';
        document.body.appendChild(effect);
        
        setTimeout(() => {
            document.body.removeChild(effect);
        }, 1000);
    }
    
    draw() {
        // 背景をクリア
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // どうろをびょうが
        this.ctx.fillStyle = '#696969';
        this.ctx.fillRect(0, this.roadY, this.canvas.width, this.roadHeight);
        
        // どうろのせんをびょうが
        this.ctx.strokeStyle = '#FFFF00';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.roadY + this.roadHeight / 2);
        this.ctx.lineTo(this.canvas.width, this.roadY + this.roadHeight / 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // そうこをびょうが
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(this.warehouseX, this.warehouseY, this.warehouseWidth, this.warehouseHeight);
        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillRect(this.warehouseX, this.warehouseY, this.warehouseWidth, 20);
        
        // そうこのラベル
        this.ctx.fillStyle = '#000';
        this.ctx.font = '12px Arial';
        this.ctx.fillText('そうこ', this.warehouseX + 5, this.warehouseY - 5);
        
        // トラクターをびょうが
        this.ctx.fillStyle = '#00FF00';
        this.ctx.fillRect(this.tractorX, this.tractorY, 30, 30);
        this.ctx.fillStyle = '#000';
        this.ctx.font = '20px Arial';
        this.ctx.fillText('🚜', this.tractorX + 2, this.tractorY + 22);
        
        // つみにひょうじ
        this.ctx.fillStyle = '#000';
        this.ctx.font = '12px Arial';
        this.ctx.fillText(`つみに: ${this.currentLoad}`, this.tractorX - 5, this.tractorY - 5);
        
        // しょうがいぶつをびょうが
        this.obstacles.forEach(obstacle => {
            this.ctx.font = '20px Arial';
            this.ctx.fillText(obstacle.type, obstacle.x, obstacle.y + 20);
        });
        
        // ゲームじょうほうをひょうじ
        this.ctx.fillStyle = '#000';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`のこりじかん: ${this.gameTime}びょう`, 10, 30);
        this.ctx.fillText(`つみに: ${this.currentLoad}/${this.tractor.currentLoad}`, 10, 50);
    }
    
    endGame(success) {
        this.isRunning = false;
        
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
        
        // イベントリスナーを削除
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        
        // コールバックを呼び出し
        this.onComplete(success, this.currentLoad);
    }
}

// デバッグ用倍速機能
function toggleGameSpeed() {
    if (game) {
        game.toggleGameSpeed();
    }
}
