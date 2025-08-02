// 游戏状态
const gameState = {
    playerHP: 200,
    enemyHP: 1000,
    playerTurn: true,
    selectedOption: null,
    heartPosition: { x: 0, y: 0 },
    currentAttack: null,
    attackInterval: null,
    damagePointerInterval: null,
    sealAppeared: false,
    hasDumbellBanana: false,
    usedItems: {
        monster_candy: false,
        bandage: false,
        protein: false,
        dumbell_banana: false
    },
    enemyPhrases: [
        "牛魔！看我肌肉！💪",
        "牛魔！吃我香蕉！🍌",
        "牛魔！篮球时间！🏀",
        "牛魔！蛋白粉呢？🥄",
        "牛魔！看我秀！(╯°□°）╯",
        "牛魔！你太弱了！😂",
        "牛魔！再来一回合！🔄",
        "牛魔！健身时间！🏋️",
        "牛魔！哑铃呢？🔔",
        "牛魔！看我扣篮！🏀",
        "牛魔！蛋白质！🥛",
        "牛魔！深蹲时间！🦵",
        "牛魔！卧推！🛏️",
        "牛魔！有氧运动！🏃",
        "牛魔！拉伸时间！🧘",
        "牛魔！增肌餐！🍗",
        "牛魔！体脂率！📉",
        "牛魔！健身房见！🏢",
        "牛魔！肌肉酸痛！😫",
        "牛魔！终极形态！🔥"
    ],
    enemyActions: [
        "大根展示了他的二头肌！💪",
        "大根开始做深蹲！🦵",
        "大根举起了哑铃！🏋️",
        "大根喝下了蛋白粉！🥄",
        "大根表演了扣篮！🏀"
    ]
};

// 敌人攻击模式
const enemyAttacks = [
    {
        name: "香蕉投掷",
        duration: 5000,
        update: function(heart, elapsed) {
            // 从顶部掉落香蕉
            const banana = document.createElement('div');
            banana.className = 'banana';
            banana.style.position = 'absolute';
            banana.style.left = `${Math.random() * 80 + 10}%`;
            banana.style.top = '0';
            banana.style.width = '20px';
            banana.style.height = '20px';
            banana.style.backgroundImage = 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2ZmYzEwNyIgZD0iTTE4LjUsMkMxNS41NSwyIDEzLjMxLDQuMzQgMTMuMTEsNy4yM0MxMi42OCw3LjA4IDEyLjIxLDcgMTEuNzUsN0M5LjI1LDcgNy4yNSw5IDcuMjUsMTEuNUM3LjI1LDE0LjUgOS41LDE2LjUgMTIuNSwxNi41QzE1LjUsMTYuNSAxNy41LDE0LjUgMTcuNSwxMS41QzE3LjUsMTAuNzkgMTcuMzUsMTAuMTIgMTcuMDksOS41QzE5LjA3LDkuMTQgMjAuNSw3LjMzIDIwLjUsNUMyMC41LDMuMzUgMTkuNjUsMiAxOC41LDJNMTIuNSw4QzE0LjQzLDggMTYsOS41NyAxNiwxMS41QzE2LDEzLjQzIDE0LjQzLDE1IDEyLjUsMTVDMTAuNTcsMTUgOSwxMy40MyA5LDExLjVDOSw5LjU3IDEwLjU3LDggMTIuNSw4WiIvPjwvc3ZnPg==")';
            banana.style.backgroundSize = 'cover';
            document.getElementById('battle-room').appendChild(banana);
            
            const fallInterval = setInterval(() => {
                const top = parseFloat(banana.style.top);
                if (top > 100) {
                    clearInterval(fallInterval);
                    banana.remove();
                } else {
                    banana.style.top = `${top + 2}%`;
                    
                    // 碰撞检测
                    const heartRect = heart.getBoundingClientRect();
                    const bananaRect = banana.getBoundingClientRect();
                    
                    if (heartRect.left < bananaRect.right && 
                        heartRect.right > bananaRect.left && 
                        heartRect.top < bananaRect.bottom && 
                        heartRect.bottom > bananaRect.top) {
                        gameState.playerHP -= 10;
                        updateHP();
                        banana.remove();
                        clearInterval(fallInterval);
                    }
                }
            }, 50);
            
            return banana;
        }
    },
    {
        name: "肌肉震动",
        duration: 6000,
        update: function(heart, elapsed) {
            // 震动屏幕和心形
            if (elapsed % 1000 < 500) {
                document.getElementById('battle-room').style.transform = 'translateX(5px)';
                heart.style.transform = `translate(${gameState.heartPosition.x}px, ${gameState.heartPosition.y}px) translateX(5px)`;
            } else {
                document.getElementById('battle-room').style.transform = 'translateX(-5px)';
                heart.style.transform = `translate(${gameState.heartPosition.x}px, ${gameState.heartPosition.y}px) translateX(-5px)`;
            }
            
            // 随机伤害
            if (elapsed % 500 === 0) {
                gameState.playerHP -= 5;
                updateHP();
            }
        },
        cleanup: function() {
            document.getElementById('battle-room').style.transform = '';
        }
    },
    {
        name: "篮球轰炸",
        duration: 7000,
        update: function(heart, elapsed) {
            // 从各个方向投掷篮球
            if (elapsed % 800 === 0) {
                const basketball = document.createElement('div');
                basketball.className = 'basketball';
                basketball.style.position = 'absolute';
                
                // 随机从四个方向之一发射
                const direction = Math.floor(Math.random() * 4);
                let startX, startY, moveX, moveY;
                
                switch(direction) {
                    case 0: // 上
                        startX = Math.random() * 80 + 10;
                        startY = 0;
                        moveX = (Math.random() - 0.5) * 2;
                        moveY = 1;
                        break;
                    case 1: // 右
                        startX = 100;
                        startY = Math.random() * 80 + 10;
                        moveX = -1;
                        moveY = (Math.random() - 0.5) * 2;
                        break;
                    case 2: // 下
                        startX = Math.random() * 80 + 10;
                        startY = 100;
                        moveX = (Math.random() - 0.5) * 2;
                        moveY = -1;
                        break;
                    case 3: // 左
                        startX = 0;
                        startY = Math.random() * 80 + 10;
                        moveX = 1;
                        moveY = (Math.random() - 0.5) * 2;
                        break;
                }
                
                basketball.style.left = `${startX}%`;
                basketball.style.top = `${startY}%`;
                basketball.style.width = '30px';
                basketball.style.height = '30px';
                basketball.style.backgroundImage = 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2ZmOTUwMCIgZD0iTTEyLDJDMTcuNTMsMiAyMiw2LjQ3IDIyLDEyQzIyLDE3LjUzIDE3LjUzLDIyIDEyLDIyQzYuNDcsMjIgMiwxNy41MyAyLDEyQzIsNi40NyA2LjQ3LDIgMTIsMk0xMiw0QzcuNTgsNCA0LDcuNTggNCwxMkM0LDE2LjQyIDcuNTgsMjAgMTIsMjBDMTYuNDIsMjAgMjAsMTYuNDIgMjAsMTJDMjAsNy41OCAxNi40Miw0IDEyLDRNMTIsNEMxNi40Miw0IDIwLDcuNTggMjAsMTJDMjAsMTYuNDIgMTYuNDIsMjAgMTIsMjBDNy41OCwyMCA0LDE2LjQyIDQsMTJDNCw3LjU4IDcuNTgsNCAxMiw0WiIvPjwvc3ZnPg==")';
                basketball.style.backgroundSize = 'cover';
                document.getElementById('battle-room').appendChild(basketball);
                
                const moveInterval = setInterval(() => {
                    const left = parseFloat(basketball.style.left);
                    const top = parseFloat(basketball.style.top);
                    
                    basketball.style.left = `${left + moveX}%`;
                    basketball.style.top = `${top + moveY}%`;
                    
                    // 超出屏幕移除
                    if (left < -10 || left > 110 || top < -10 || top > 110) {
                        clearInterval(moveInterval);
                        basketball.remove();
                    }
                    
                    // 碰撞检测
                    const heartRect = heart.getBoundingClientRect();
                    const ballRect = basketball.getBoundingClientRect();
                    
                    if (heartRect.left < ballRect.right && 
                        heartRect.right > ballRect.left && 
                        heartRect.top < ballRect.bottom && 
                        heartRect.bottom > ballRect.top) {
                        gameState.playerHP -= 15;
                        updateHP();
                        basketball.remove();
                        clearInterval(moveInterval);
                    }
                }, 50);
            }
        }
    },
    {
        name: "蛋白粉烟雾",
        duration: 8000,
        update: function(heart, elapsed) {
            // 创建烟雾效果
            if (elapsed % 300 === 0) {
                const smoke = document.createElement('div');
                smoke.className = 'smoke';
                smoke.style.position = 'absolute';
                smoke.style.left = `${Math.random() * 80 + 10}%`;
                smoke.style.top = `${Math.random() * 80 + 10}%`;
                smoke.style.width = '100px';
                smoke.style.height = '100px';
                smoke.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
                smoke.style.borderRadius = '50%';
                smoke.style.opacity = '0';
                document.getElementById('battle-room').appendChild(smoke);
                
                // 淡入淡出动画
                let opacity = 0;
                const fadeInterval = setInterval(() => {
                    opacity += 0.05;
                    smoke.style.opacity = opacity;
                    
                    if (opacity >= 1) {
                        clearInterval(fadeInterval);
                        const fadeOutInterval = setInterval(() => {
                            opacity -= 0.05;
                            smoke.style.opacity = opacity;
                            
                            if (opacity <= 0) {
                                clearInterval(fadeOutInterval);
                                smoke.remove();
                            }
                        }, 100);
                    }
                    
                    // 碰撞检测
                    const heartRect = heart.getBoundingClientRect();
                    const smokeRect = smoke.getBoundingClientRect();
                    
                    if (heartRect.left < smokeRect.right && 
                        heartRect.right > smokeRect.left && 
                        heartRect.top < smokeRect.bottom && 
                        heartRect.bottom > smokeRect.top) {
                        gameState.playerHP -= 3;
                        updateHP();
                    }
                }, 100);
            }
        }
    },
    {
        name: "哑铃旋转",
        duration: 9000,
        update: function(heart, elapsed) {
            // 创建旋转的哑铃
            const dumbell = document.createElement('div');
            dumbell.className = 'dumbell';
            dumbell.style.position = 'absolute';
            dumbell.style.left = '50%';
            dumbell.style.top = '50%';
            dumbell.style.width = '100px';
            dumbell.style.height = '30px';
            dumbell.style.marginLeft = '-50px';
            dumbell.style.marginTop = '-15px';
            dumbell.style.backgroundColor = '#aaa';
            dumbell.style.borderRadius = '15px';
            dumbell.style.transformOrigin = 'center';
            document.getElementById('battle-room').appendChild(dumbell);
            
            // 添加哑铃两端的重量
            const weight1 = document.createElement('div');
            weight1.style.position = 'absolute';
            weight1.style.left = '0';
            weight1.style.top = '50%';
            weight1.style.width = '30px';
            weight1.style.height = '30px';
            weight1.style.marginTop = '-15px';
            weight1.style.marginLeft = '-15px';
            weight1.style.backgroundColor = '#555';
            weight1.style.borderRadius = '50%';
            dumbell.appendChild(weight1);
            
            const weight2 = document.createElement('div');
            weight2.style.position = 'absolute';
            weight2.style.right = '0';
            weight2.style.top = '50%';
            weight2.style.width = '30px';
            weight2.style.height = '30px';
            weight2.style.marginTop = '-15px';
            weight2.style.marginRight = '-15px';
            weight2.style.backgroundColor = '#555';
            weight2.style.borderRadius = '50%';
            dumbell.appendChild(weight2);
            
            let angle = 0;
            const radius = 150;
            const rotateInterval = setInterval(() => {
                angle += 0.1;
                dumbell.style.transform = `rotate(${angle}rad)`;
                
                // 碰撞检测
                const heartRect = heart.getBoundingClientRect();
                const dumbellRect = dumbell.getBoundingClientRect();
                
                if (heartRect.left < dumbellRect.right && 
                    heartRect.right > dumbellRect.left && 
                    heartRect.top < dumbellRect.bottom && 
                    heartRect.bottom > dumbellRect.top) {
                    gameState.playerHP -= 20;
                    updateHP();
                }
            }, 50);
            
            setTimeout(() => {
                clearInterval(rotateInterval);
                dumbell.remove();
            }, this.duration);
        }
    },
    {
        name: "深蹲冲击",
        duration: 5000,
        update: function(heart, elapsed) {
            // 大根做深蹲，每次下蹲造成冲击波
            if (elapsed % 1000 === 0) {
                document.getElementById('enemy').style.transform = 'translateX(-50%) scale(1, 0.7)';
                
                // 创建冲击波
                const shockwave = document.createElement('div');
                shockwave.className = 'shockwave';
                shockwave.style.position = 'absolute';
                shockwave.style.left = '50%';
                shockwave.style.top = '25%';
                shockwave.style.width = '10px';
                shockwave.style.height = '10px';
                shockwave.style.marginLeft = '-5px';
                shockwave.style.marginTop = '-5px';
                shockwave.style.backgroundColor = 'rgba(255, 255, 0, 0.7)';
                shockwave.style.borderRadius = '50%';
                document.getElementById('battle-room').appendChild(shockwave);
                
                let size = 10;
                const growInterval = setInterval(() => {
                    size += 10;
                    shockwave.style.width = `${size}px`;
                    shockwave.style.height = `${size}px`;
                    shockwave.style.marginLeft = `-${size/2}px`;
                    shockwave.style.marginTop = `-${size/2}px`;
                    shockwave.style.opacity = `${1 - size/200}`;
                    
                    // 碰撞检测
                    const heartRect = heart.getBoundingClientRect();
                    const waveRect = shockwave.getBoundingClientRect();
                    
                    if (heartRect.left < waveRect.right && 
                        heartRect.right > waveRect.left && 
                        heartRect.top < waveRect.bottom && 
                        heartRect.bottom > waveRect.top) {
                        gameState.playerHP -= 25;
                        updateHP();
                    }
                    
                    if (size >= 200) {
                        clearInterval(growInterval);
                        shockwave.remove();
                        document.getElementById('enemy').style.transform = 'translateX(-50%)';
                    }
                }, 30);
            }
        }
    },
    {
        name: "健身音乐",
        duration: 10000,
        update: function(heart, elapsed) {
            // 播放健身音乐，心形随节奏移动
            if (elapsed % 500 === 0) {
                const musicNote = document.createElement('div');
                musicNote.className = 'music-note';
                musicNote.style.position = 'absolute';
                musicNote.style.left = `${Math.random() * 80 + 10}%`;
                musicNote.style.top = `${Math.random() * 80 + 10}%`;
                musicNote.style.width = '20px';
                musicNote.style.height = '20px';
                musicNote.style.backgroundImage = 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2ZmYzEwNyIgZD0iTTEyLDNWMTVIMTJDNy41OSwxNSA0LDEyLjQxIDQsOEM0LDUuNTkgNy41OSwzIDEyLDNNMTYsM0MxOS4zMSwzIDIyLDUuNjkgMjIsOEMyMiwxMC4zMSAxOS4zMSwxMyAxNiwxM0MxNS4yOCwxMyAxNC41OSwxMi44NyAxMy45NSwxMi42NUwxMy4xNiwxNS4zNEMxNC4zNiwxNS43NSAxNS4xNiwxNi43OCAxNS4xNiwxOEgxOC4xNkMxOC4xNiwxNi4wOSAxNi45MSwxNC41IDE1LjA5LDE0LjA2TDE1Ljg1LDExLjY3QzE3LjM0LDExLjg4IDE4LjUsMTMuMzUgMTguNSwxNUMxOC41LDE2LjkzIDE2LjkzLDE4LjUgMTUsMTguNUwxNSwyMUwxMywyMUwxMywxOC41QzEwLjI0LDE4LjUgOCwxNi4yNiA4LDEzLjVDOCwxMi40MSA4LjMyLDExLjM5IDguODksMTAuNUg4QzUuOCwxMC41IDQsOC43IDQsNi41QzQsNC4zIDUuOCwyLjUgOCwyLjVIMTZNNiwxNUM2LDE2LjY2IDcuMzQsMTggOSwxOEgxMVYxNUMxMSwxMy4zNCA5LjY2LDEyIDgsMTJDNi4zNCwxMiA1LDEzLjM0IDUsMTVDNSwxNi42NiA2LjM0LDE4IDgsMThDOC4xOCwxOCA4LjM1LDE3Ljk3IDguNSwxNy45M1YxNS45M0M4LjM1LDE1Ljk3IDguMTgsMTYgOCwxNkM3LjQ1LDE2IDcsMTUuNTUgNywxNUM3LDE0LjQ1IDcuNDUsMTQgOCwxNEM4LjU1LDE0IDksMTQuNDUgOSwxNUg2TTgsNkM3LjQ1LDYgNyw2LjQ1IDcsN0M3LDcuNTUgNy40NSw4IDgsOEM4LjU1LDggOSw3LjU1IDksN0M5LDYuNDUgOC41NSw2IDgsNloiLz48L3N2Zz4=")';
                musicNote.style.backgroundSize = 'cover';
                document.getElementById('battle-room').appendChild(musicNote);
                
                setTimeout(() => {
                    musicNote.remove();
                }, 1000);
                
                // 随机移动心形
                gameState.heartPosition.x += (Math.random() - 0.5) * 40;
                gameState.heartPosition.y += (Math.random() - 0.5) * 40;
                updateHeartPosition();
                
                // 随机伤害
                if (Math.random() > 0.7) {
                    gameState.playerHP -= 5;
                    updateHP();
                }
            }
        }
    },
    {
        name: "终极形态",
        duration: 12000,
        update: function(heart, elapsed) {
            // 大根变成终极形态
            document.getElementById('enemy').src = 'assets/d.png';
            
            // 组合攻击：香蕉+篮球+哑铃
            if (elapsed % 1500 === 0) {
                // 香蕉攻击
                const banana = document.createElement('div');
                banana.className = 'banana';
                banana.style.position = 'absolute';
                banana.style.left = `${Math.random() * 80 + 10}%`;
                banana.style.top = '0';
                banana.style.width = '20px';
                banana.style.height = '20px';
                banana.style.backgroundImage = 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2ZmYzEwNyIgZD0iTTE4LjUsMkMxNS41NSwyIDEzLjMxLDQuMzQgMTMuMTEsNy4yM0MxMi42OCw3LjA4IDEyLjIxLDcgMTEuNzUsN0M5LjI1LDcgNy4yNSw5IDcuMjUsMTEuNUM3LjI1LDE0LjUgOS41LDE2LjUgMTIuNSwxNi41QzE1LjUsMTYuNSAxNy41LDE0LjUgMTcuNSwxMS41QzE3LjUsMTAuNzkgMTcuMzUsMTAuMTIgMTcuMDksOS41QzE5LjA3LDkuMTQgMjAuNSw3LjMzIDIwLjUsNUMyMC41LDMuMzUgMTkuNjUsMiAxOC41LDJNMTIuNSw4QzE0LjQzLDggMTYsOS41NyAxNiwxMS41QzE2LDEzLjQzIDE0LjQzLDE1IDEyLjUsMTVDMTAuNTcsMTUgOSwxMy40MyA5LDExLjVDOSw5LjU3IDEwLjU3LDggMTIuNSw4WiIvPjwvc3ZnPg==")';
                banana.style.backgroundSize = 'cover';
                document.getElementById('battle-room').appendChild(banana);
                
                const fallInterval = setInterval(() => {
                    const top = parseFloat(banana.style.top);
                    if (top > 100) {
                        clearInterval(fallInterval);
                        banana.remove();
                    } else {
                        banana.style.top = `${top + 2}%`;
                        
                        // 碰撞检测
                        const heartRect = heart.getBoundingClientRect();
                        const bananaRect = banana.getBoundingClientRect();
                        
                        if (heartRect.left < bananaRect.right && 
                            heartRect.right > bananaRect.left && 
                            heartRect.top < bananaRect.bottom && 
                            heartRect.bottom > bananaRect.top) {
                            gameState.playerHP -= 15;
                            updateHP();
                            banana.remove();
                            clearInterval(fallInterval);
                        }
                    }
                }, 50);
                
                // 篮球攻击
                const basketball = document.createElement('div');
                basketball.className = 'basketball';
                basketball.style.position = 'absolute';
                basketball.style.left = `${Math.random() * 100}%`;
                basketball.style.top = `${Math.random() * 100}%`;
                basketball.style.width = '30px';
                basketball.style.height = '30px';
                basketball.style.backgroundImage = 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2ZmOTUwMCIgZD0iTTEyLDJDMTcuNTMsMiAyMiw2LjQ3IDIyLDEyQzIyLDE3LjUzIDE3LjUzLDIyIDEyLDIyQzYuNDcsMjIgMiwxNy41MyAyLDEyQzIsNi40NyA2LjQ3LDIgMTIsMk0xMiw0QzcuNTgsNCA0LDcuNTggNCwxMkM0LDE2LjQyIDcuNTgsMjAgMTIsMjBDMTYuNDIsMjAgMjAsMTYuNDIgMjAsMTJDMjAsNy41OCAxNi40Miw0IDEyLDRNMTIsNEMxNi40Miw0IDIwLDcuNTggMjAsMTJDMjAsMTYuNDIgMTYuNDIsMjAgMTIsMjBDNy41OCwyMCA0LDE2LjQyIDQsMTJDNCw3LjU4IDcuNTgsNCAxMiw0WiIvPjwvc3ZnPg==")';
                basketball.style.backgroundSize = 'cover';
                document.getElementById('battle-room').appendChild(basketball);
                
                let angle = Math.random() * Math.PI * 2;
                const moveInterval = setInterval(() => {
                    const left = parseFloat(basketball.style.left);
                    const top = parseFloat(basketball.style.top);
                    
                    basketball.style.left = `${left + Math.cos(angle) * 2}%`;
                    basketball.style.top = `${top + Math.sin(angle) * 2}%`;
                    
                    // 超出屏幕移除
                    if (left < -10 || left > 110 || top < -10 || top > 110) {
                        clearInterval(moveInterval);
                        basketball.remove();
                    }
                    
                    // 碰撞检测
                    const heartRect = heart.getBoundingClientRect();
                    const ballRect = basketball.getBoundingClientRect();
                    
                    if (heartRect.left < ballRect.right && 
                        heartRect.right > ballRect.left && 
                        heartRect.top < ballRect.bottom && 
                        heartRect.bottom > ballRect.top) {
                        gameState.playerHP -= 20;
                        updateHP();
                        basketball.remove();
                        clearInterval(moveInterval);
                    }
                }, 50);
                
                // 哑铃攻击
                const dumbell = document.createElement('div');
                dumbell.className = 'dumbell';
                dumbell.style.position = 'absolute';
                dumbell.style.left = `${Math.random() * 80 + 10}%`;
                dumbell.style.top = `${Math.random() * 80 + 10}%`;
                dumbell.style.width = '60px';
                dumbell.style.height = '20px';
                dumbell.style.backgroundColor = '#aaa';
                dumbell.style.borderRadius = '10px';
                document.getElementById('battle-room').appendChild(dumbell);
                
                // 添加哑铃两端的重量
                const weight1 = document.createElement('div');
                weight1.style.position = 'absolute';
                weight1.style.left = '0';
                weight1.style.top = '50%';
                weight1.style.width = '20px';
                weight1.style.height = '20px';
                weight1.style.marginTop = '-10px';
                weight1.style.marginLeft = '-10px';
                weight1.style.backgroundColor = '#555';
                weight1.style.borderRadius = '50%';
                dumbell.appendChild(weight1);
                
                const weight2 = document.createElement('div');
                weight2.style.position = 'absolute';
                weight2.style.right = '0';
                weight2.style.top = '50%';
                weight2.style.width = '20px';
                weight2.style.height = '20px';
                weight2.style.marginTop = '-10px';
                weight2.style.marginRight = '-10px';
                weight2.style.backgroundColor = '#555';
                weight2.style.borderRadius = '50%';
                dumbell.appendChild(weight2);
                
                let dumbellAngle = 0;
                const dumbellInterval = setInterval(() => {
                    dumbellAngle += 0.2;
                    dumbell.style.transform = `rotate(${dumbellAngle}rad)`;
                    
                    // 碰撞检测
                    const heartRect = heart.getBoundingClientRect();
                    const dumbellRect = dumbell.getBoundingClientRect();
                    
                    if (heartRect.left < dumbellRect.right && 
                        heartRect.right > dumbellRect.left && 
                        heartRect.top < dumbellRect.bottom && 
                        heartRect.bottom > dumbellRect.top) {
                        gameState.playerHP -= 25;
                        updateHP();
                    }
                }, 50);
                
                setTimeout(() => {
                    clearInterval(dumbellInterval);
                    dumbell.remove();
                }, 3000);
            }
        },
        cleanup: function() {
            document.getElementById('enemy').src = 'assets/b.png';
        }
    },
    {
        name: "蛋白粉雨",
        duration: 8000,
        update: function(heart, elapsed) {
            // 从顶部掉落蛋白粉罐
            if (elapsed % 500 === 0) {
                const protein = document.createElement('div');
                protein.className = 'protein';
                protein.style.position = 'absolute';
                protein.style.left = `${Math.random() * 80 + 10}%`;
                protein.style.top = '0';
                protein.style.width = '30px';
                protein.style.height = '40px';
                protein.style.backgroundImage = 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2ZmZmZmZiIgZD0iTTE3LDJIMkEyLDIsMCwwLDAsMCw0VjIwYTIsMiwwLDAsMCwyLDJIMTdhMiwyLDAsMCwwLDItMlY0QTIsMiwwLDAsMCwxNywyTTE1LDE4SDRWMTZIMTVWMTZNMTUsMTRINFYxMkgxNVYxMk0xNSwxMEg0VjhIMTVWMTBNMTUsNkg0VjRIMTVWNloiLz48L3N2Zz4=")';
                protein.style.backgroundSize = 'cover';
                document.getElementById('battle-room').appendChild(protein);
                
                const fallInterval = setInterval(() => {
                    const top = parseFloat(protein.style.top);
                    if (top > 100) {
                        clearInterval(fallInterval);
                        protein.remove();
                    } else {
                        protein.style.top = `${top + 3}%`;
                        
                        // 碰撞检测
                        const heartRect = heart.getBoundingClientRect();
                        const proteinRect = protein.getBoundingClientRect();
                        
                        if (heartRect.left < proteinRect.right && 
                            heartRect.right > proteinRect.left && 
                            heartRect.top < proteinRect.bottom && 
                            heartRect.bottom > proteinRect.top) {
                            gameState.playerHP -= 30;
                            updateHP();
                            protein.remove();
                            clearInterval(fallInterval);
                            
                            // 蛋白粉爆炸效果
                            const explosion = document.createElement('div');
                            explosion.className = 'explosion';
                            explosion.style.position = 'absolute';
                            explosion.style.left = `${parseFloat(protein.style.left) - 15}%`;
                            explosion.style.top = `${parseFloat(protein.style.top) - 15}%`;
                            explosion.style.width = '60px';
                            explosion.style.height = '60px';
                            explosion.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
                            explosion.style.borderRadius = '50%';
                            explosion.style.opacity = '1';
                            document.getElementById('battle-room').appendChild(explosion);
                            
                            let size = 60;
                            const explodeInterval = setInterval(() => {
                                size += 10;
                                explosion.style.width = `${size}px`;
                                explosion.style.height = `${size}px`;
                                explosion.style.left = `${parseFloat(explosion.style.left) - 5}%`;
                                explosion.style.top = `${parseFloat(explosion.style.top) - 5}%`;
                                explosion.style.opacity = `${1 - size/200}`;
                                
                                if (size >= 200) {
                                    clearInterval(explodeInterval);
                                    explosion.remove();
                                }
                            }, 50);
                        }
                    }
                }, 50);
            }
        }
    },
    {
        name: "健身教练模式",
        duration: 10000,
        update: function(heart, elapsed) {
            // 大根变成教练形态
            document.getElementById('enemy').src = 'assets/c.png';
            
            // 显示指令，玩家必须按指令移动心形
            if (elapsed % 2000 === 0) {
                const commands = ['↑', '↓', '←', '→'];
                const command = commands[Math.floor(Math.random() * commands.length)];
                
                const commandDisplay = document.createElement('div');
                commandDisplay.className = 'command';
                commandDisplay.style.position = 'absolute';
                commandDisplay.style.left = '50%';
                commandDisplay.style.top = '30%';
                commandDisplay.style.transform = 'translateX(-50%)';
                commandDisplay.style.fontSize = '48px';
                commandDisplay.style.color = 'white';
                commandDisplay.style.textShadow = '2px 2px 4px black';
                commandDisplay.textContent = command;
                document.getElementById('battle-room').appendChild(commandDisplay);
                
                let commandTime = 2000;
                const commandInterval = setInterval(() => {
                    commandTime -= 100;
                    commandDisplay.style.opacity = commandTime / 2000;
                    
                    if (commandTime <= 0) {
                        clearInterval(commandInterval);
                        commandDisplay.remove();
                        
                        // 检查玩家是否按指令移动
                        const heartX = gameState.heartPosition.x;
                        const heartY = gameState.heartPosition.y;
                        
                        let correct = false;
                        switch(command) {
                            case '↑':
                                correct = heartY < -10;
                                break;
                            case '↓':
                                correct = heartY > 10;
                                break;
                            case '←':
                                correct = heartX < -10;
                                break;
                            case '→':
                                correct = heartX > 10;
                                break;
                        }
                        
                        if (!correct) {
                            gameState.playerHP -= 30;
                            updateHP();
                            
                            // 惩罚效果
                            const punish = document.createElement('div');
                            punish.className = 'punish';
                            punish.style.position = 'absolute';
                            punish.style.left = '50%';
                            punish.style.top = '50%';
                            punish.style.transform = 'translate(-50%, -50%)';
                            punish.style.fontSize = '24px';
                            punish.style.color = 'red';
                            punish.style.textShadow = '1px 1px 2px black';
                            punish.textContent = '动作不标准！-30HP';
                            document.getElementById('battle-room').appendChild(punish);
                            
                            setTimeout(() => {
                                punish.remove();
                            }, 1000);
                        }
                    }
                }, 100);
            }
        },
        cleanup: function() {
            document.getElementById('enemy').src = 'assets/b.png';
        }
    }
];

// 初始化游戏
function initGame() {
    updateHP();
    setupControls();
    setupOptions();
    showRandomEnemyPhrase();
    
    // 随机出现海豹彩蛋
    if (Math.random() < 0.3) {
        setTimeout(() => {
            showSeal();
        }, 5000);
    }
}

// 更新HP显示
function updateHP() {
    const hpPercentage = Math.max(0, gameState.playerHP) / 200 * 100;
    document.getElementById('hp-fill').style.width = `${hpPercentage}%`;
    
    if (gameState.playerHP <= 0) {
        endGame(false);
    }
}

// 更新敌人HP
function updateEnemyHP(damage) {
    gameState.enemyHP = Math.max(0, gameState.enemyHP - damage);
    
    if (gameState.enemyHP <= 0) {
        endGame(true);
    } else {
        // 根据HP改变敌人形态
        if (gameState.enemyHP < 300) {
            document.getElementById('enemy').src = 'assets/c.png';
        } else if (gameState.enemyHP < 700) {
            document.getElementById('enemy').src = 'assets/b.png';
        }
    }
}

// 设置控制按钮
function setupControls() {
    const dpad = document.querySelectorAll('.dpad-btn');
    const aBtn = document.getElementById('a-btn');
    const bBtn = document.getElementById('b-btn');
    
    // 方向键控制
    dpad.forEach(btn => {
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleDpadPress(btn.textContent);
        });
        
        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            // 停止移动
        });
    });
    
    // 键盘控制 (PC端)
    document.addEventListener('keydown', (e) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            handleDpadPress(e.key.replace('Arrow', ''));
        } else if (e.key === 'a' || e.key === 'A') {
            handleABtnPress();
        } else if (e.key === 'b' || e.key === 'B') {
            handleBBtnPress();
        }
    });
    
    // A键
    aBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleABtnPress();
    });
    
    // B键
    bBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleBBtnPress();
    });
}

// 处理方向键按下
function handleDpadPress(direction) {
    const heart = document.getElementById('heart');
    const step = 10;
    
    if (gameState.playerTurn) {
        // 玩家回合：切换选项
        const options = document.querySelectorAll('.option');
        let currentIndex = Array.from(options).findIndex(opt => opt.style.backgroundColor === 'rgb(255, 221, 221)');
        
        if (currentIndex === -1) currentIndex = 0;
        
        switch(direction) {
            case '←':
                currentIndex = (currentIndex - 1 + options.length) % options.length;
                break;
            case '→':
                currentIndex = (currentIndex + 1) % options.length;
                break;
        }
        
        // 更新选中状态
        options.forEach((opt, index) => {
            opt.style.backgroundColor = index === currentIndex ? '#ffdddd' : 'white';
        });
    } else {
        // 敌人回合：移动心形
        switch(direction) {
            case '↑':
                gameState.heartPosition.y -= step;
                break;
            case '↓':
                gameState.heartPosition.y += step;
                break;
            case '←':
                gameState.heartPosition.x -= step;
                break;
            case '→':
                gameState.heartPosition.x += step;
                break;
        }
        
        updateHeartPosition();
    }
}

// 更新心形位置
function updateHeartPosition() {
    const heart = document.getElementById('heart');
    const battleRoom = document.getElementById('battle-room');
    const roomRect = battleRoom.getBoundingClientRect();
    
    // 限制心形在战斗区域内
    const maxX = roomRect.width / 2 - 10;
    const maxY = roomRect.height / 2 - 10;
    
    gameState.heartPosition.x = Math.max(-maxX, Math.min(maxX, gameState.heartPosition.x));
    gameState.heartPosition.y = Math.max(-maxY, Math.min(maxY, gameState.heartPosition.y));
    
    heart.style.transform = `translate(${gameState.heartPosition.x}px, ${gameState.heartPosition.y}px)`;
}

// 处理A键按下
function handleABtnPress() {
    if (gameState.playerTurn) {
        const selectedOption = document.querySelector('.option[style*="background-color: rgb(255, 221, 221)"]');
        
        if (selectedOption) {
            const optionType = selectedOption.getAttribute('data-option');
            handleOptionSelect(optionType);
        } else if (document.getElementById('damage-bar').style.display === 'flex') {
            // 伤害判定
            stopDamagePointer();
        } else {
            // 默认选择第一个选项
            const firstOption = document.querySelector('.option');
            firstOption.style.backgroundColor = '#ffdddd';
        }
    }
}

// 处理B键按下
function handleBBtnPress() {
    if (gameState.playerTurn) {
        if (document.getElementById('damage-bar').style.display === 'flex') {
            // 取消伤害判定
            document.getElementById('damage-bar').style.display = 'none';
            showDialog("你犹豫了，没有攻击...");
            endPlayerTurn();
        } else if (document.getElementById('action-options').style.display === 'flex') {
            // 取消行动选择
            document.getElementById('action-options').style.display = 'none';
            showOptions();
        } else if (document.getElementById('mercy-options').style.display === 'flex') {
            // 取消仁慈选择
            document.getElementById('mercy-options').style.display = 'none';
            showOptions();
        } else if (document.getElementById('item-options').style.display === 'flex') {
            // 取消道具选择
            document.getElementById('item-options').style.display = 'none';
            showOptions();
        }
    }
}

// 设置选项点击事件
function setupOptions() {
    const options = document.querySelectorAll('.option');
    
    options.forEach(option => {
        option.addEventListener('click', () => {
            if (gameState.playerTurn) {
                const optionType = option.getAttribute('data-option');
                handleOptionSelect(optionType);
            }
        });
    });
}

// 处理选项选择
function handleOptionSelect(optionType) {
    hideOptions();
    
    switch(optionType) {
        case 'fight':
            startFight();
            break;
        case 'act':
            showActionOptions();
            break;
        case 'item':
            showItemOptions();
            break;
        case 'mercy':
            showMercyOptions();
            break;
    }
}

// 显示选项
function showOptions() {
    document.getElementById('options').style.display = 'flex';
    document.querySelector('.option').style.backgroundColor = '#ffdddd';
}

// 隐藏选项
function hideOptions() {
    document.getElementById('options').style.display = 'none';
    document.querySelectorAll('.option').forEach(opt => {
        opt.style.backgroundColor = 'white';
    });
}

// 开始战斗
function startFight() {
    document.getElementById('damage-bar').style.display = 'flex';
    startDamagePointer();
}

// 开始伤害指针
function startDamagePointer() {
    const pointer = document.getElementById('damage-pointer');
    let position = 0;
    let direction = 1;
    const speed = 5;
    
    gameState.damagePointerInterval = setInterval(() => {
        position += speed * direction;
        
        if (position >= 100) {
            direction = -1;
        } else if (position <= 0) {
            direction = 1;
        }
        
        pointer.style.left = `${position}%`;
    }, 20);
}

// 停止伤害指针
function stopDamagePointer() {
    clearInterval(gameState.damagePointerInterval);
    document.getElementById('damage-bar').style.display = 'none';
    
    const pointer = document.getElementById('damage-pointer');
    const position = parseFloat(pointer.style.left);
    
    let damage = 0;
    if (position < 10) { // 红色区域
        damage = 60;
        showDialog(`完美攻击！造成${damage}点伤害！(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧`);
    } else if (position < 30) { // 黄色区域
        damage = 30;
        showDialog(`不错！造成${damage}点伤害！(•̀ᴗ•́)و`);
    } else if (position < 70) { // 绿色区域
        damage = 10;
        showDialog(`普通攻击，造成${damage}点伤害 (｡•́︿•̀｡)`);
    } else { // 空白区域
        damage = 0;
        showDialog("打偏了！没有造成伤害 (╥﹏╥)");
    }
    
    // 检查是否有哑铃香蕉道具
    if (gameState.hasDumbellBanana && !gameState.usedItems.dumbell_banana) {
        damage = 500;
        showDialog("使用了哑铃香蕉！超级暴击！(ﾉ≧∀≦)ﾉ");
        gameState.usedItems.dumbell_banana = true;
        document.querySelector('[data-item="dumbell_banana"]').style.display = 'none';
    }
    
    updateEnemyHP(damage);
    endPlayerTurn();
}

// 显示行动选项
function showActionOptions() {
    document.getElementById('action-options').style.display = 'flex';
    
    // 设置行动选项点击事件
    const actionOptions = document.querySelectorAll('[data-action]');
    actionOptions.forEach(option => {
        option.addEventListener('click', () => {
            const action = option.getAttribute('data-action');
            handleActionSelect(action);
        });
    });
}

// 处理行动选择
function handleActionSelect(action) {
    document.getElementById('action-options').style.display = 'none';
    
    switch(action) {
        case 'compliment':
            showDialog("你夸赞了大根的肌肉！他看起来很得意 (￣ω￣;)");
            updateEnemyHP(-10); // 敌人回复10HP
            break;
        case 'banana':
            showDialog("你给了大根一根香蕉！他非常开心 (◠‿◠✿)");
            updateEnemyHP(-30); // 敌人回复30HP
            break;
        case 'basketball':
            showDialog("你和大根聊起了篮球！他分心了 (｡•̀ᴗ-)✧");
            // 无效果
            break;
        case 'flex':
            showDialog("你和大根比起了肌肉！他感到被挑战了 (╬ Ò﹏Ó)");
            // 下回合敌人攻击更强
            break;
    }
    
    endPlayerTurn();
}

// 显示道具选项
function showItemOptions() {
    document.getElementById('item-options').style.display = 'flex';
    
    // 更新道具可用状态
    const items = document.querySelectorAll('[data-item]');
    items.forEach(item => {
        const itemName = item.getAttribute('data-item');
        if (gameState.usedItems[itemName]) {
            item.style.opacity = '0.5';
            item.style.pointerEvents = 'none';
        }
    });
    
    // 设置道具选项点击事件
    const itemOptions = document.querySelectorAll('[data-item]');
    itemOptions.forEach(option => {
        if (!gameState.usedItems[option.getAttribute('data-item')]) {
            option.addEventListener('click', () => {
                const item = option.getAttribute('data-item');
                handleItemSelect(item);
            });
        }
    });
}

// 处理道具选择
function handleItemSelect(item) {
    document.getElementById('item-options').style.display = 'none';
    gameState.usedItems[item] = true;
    
    switch(item) {
        case 'monster_candy':
            gameState.playerHP = Math.min(200, gameState.playerHP + 30);
            updateHP();
            showDialog("使用了怪物糖果！回复30HP (｡♥‿♥｡)");
            break;
        case 'bandage':
            gameState.playerHP = Math.min(200, gameState.playerHP + 50);
            updateHP();
            showDialog("使用了绷带！回复50HP (◕‿◕)");
            break;
        case 'protein':
            gameState.playerHP = Math.min(200, gameState.playerHP + 20);
            updateHP();
            showDialog("喝下了蛋白粉！回复20HP (っ˘ω˘ς)");
            break;
        case 'dumbell_banana':
            // 在战斗中使用
            showDialog("准备好了哑铃香蕉！下次攻击将造成巨大伤害 (ง •̀_•́)ง");
            break;
    }
    
    endPlayerTurn();
}

// 显示仁慈选项
function showMercyOptions() {
    document.getElementById('mercy-options').style.display = 'flex';
    
    // 设置仁慈选项点击事件
    const mercyOptions = document.querySelectorAll('[data-mercy]');
    mercyOptions.forEach(option => {
        option.addEventListener('click', () => {
            const mercy = option.getAttribute('data-mercy');
            handleMercySelect(mercy);
        });
    });
}

// 处理仁慈选择
function handleMercySelect(mercy) {
    document.getElementById('mercy-options').style.display = 'none';
    
    switch(mercy) {
        case 'spare':
            showDialog("你选择饶恕大根...但他似乎不想放过你 (；一_一)");
            break;
        case 'flee':
            showDialog("你试图逃跑...但大根挡住了出口 (╯°□°）╯");
            break;
    }
    
    endPlayerTurn();
}

// 结束玩家回合
function endPlayerTurn() {
    gameState.playerTurn = false;
    
    // 移动心形到战斗框
    const dialogBox = document.getElementById('dialog-box');
    const dialogRect = dialogBox.getBoundingClientRect();
    const heart = document.getElementById('heart');
    
    heart.style.width = '20px';
    heart.style.height = '20px';
    heart.style.left = `${dialogRect.left + dialogRect.width/2 - 10}px`;
    heart.style.top = `${dialogRect.top + dialogRect.height/2 - 10}px`;
    heart.style.position = 'absolute';
    heart.style.display = 'block';
    
    // 敌人回合
    setTimeout(() => {
        startEnemyAttack();
    }, 1000);
}

// 开始敌人攻击
function startEnemyAttack() {
    // 随机选择攻击方式
    const attackIndex = Math.floor(Math.random() * enemyAttacks.length);
    gameState.currentAttack = enemyAttacks[attackIndex];
    
    showDialog(gameState.enemyActions[Math.floor(Math.random() * gameState.enemyActions.length)]);
    
    let elapsed = 0;
    const heart = document.getElementById('heart');
    
    gameState.attackInterval = setInterval(() => {
        elapsed += 100;
        gameState.currentAttack.update(heart, elapsed);
        
        if (elapsed >= gameState.currentAttack.duration) {
            clearInterval(gameState.attackInterval);
            
            if (gameState.currentAttack.cleanup) {
                gameState.currentAttack.cleanup();
            }
            
            // 返回玩家回合
            startPlayerTurn();
        }
    }, 100);
}

// 开始玩家回合
function startPlayerTurn() {
    gameState.playerTurn = true;
    
    // 隐藏心形
    document.getElementById('heart').style.display = 'none';
    
    // 显示随机敌人话语
    showRandomEnemyPhrase();
    
    // 显示选项
    showOptions();
    
    // 随机出现海豹彩蛋
    if (!gameState.sealAppeared && Math.random() < 0.2) {
        setTimeout(() => {
            showSeal();
        }, 2000);
    }
}

// 显示对话框
function showDialog(text) {
    const dialogBox = document.getElementById('dialog-box');
    dialogBox.textContent = text;
}

// 显示敌人气泡话语
function showRandomEnemyPhrase() {
    const bubble = document.getElementById('speech-bubble');
    const phrase = gameState.enemyPhrases[Math.floor(Math.random() * gameState.enemyPhrases.length)];
    
    bubble.textContent = phrase;
    bubble.style.display = 'block';
    
    setTimeout(() => {
        bubble.style.display = 'none';
    }, 3000);
}

// 显示海豹彩蛋
function showSeal() {
    gameState.sealAppeared = true;
    const seal = document.getElementById('seal');
    
    seal.style.display = 'block';
    seal.style.left = '-50px';
    seal.style.top = '10%';
    
    // 海豹移动动画
    let position = -50;
    const sealInterval = setInterval(() => {
        position += 5;
        seal.style.left = `${position}px`;
        
        if (position >= 300) {
            clearInterval(sealInterval);
            
            // 海豹偷走哑铃香蕉
            showDialog("像素海豹偷走了大根的哑铃香蕉！(ﾉ⊙д⊙)ﾉ");
            document.getElementById('enemy').src = 'assets/d.png';
            
            // 大根愤怒
            setTimeout(() => {
                showDialog("牛魔！还我香蕉！(╯°□°）╯︵ ┻━┻");
                
                // 大根扔香蕉
                const banana = document.createElement('div');
                banana.className = 'banana';
                banana.style.position = 'absolute';
                banana.style.left = '300px';
                banana.style.top = '60px';
                banana.style.width = '20px';
                banana.style.height = '20px';
                banana.style.backgroundImage = 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2ZmYzEwNyIgZD0iTTE4LjUsMkMxNS41NSwyIDEzLjMxLDQuMzQgMTMuMTEsNy4yM0MxMi42OCw3LjA4IDEyLjIxLDcgMTEuNzUsN0M5LjI1LDcgNy4yNSw5IDcuMjUsMTEuNUM3LjI1LDE0LjUgOS41LDE2LjUgMTIuNSwxNi41QzE1LjUsMTYuNSAxNy41LDE0LjUgMTcuNSwxMS41QzE3LjUsMTAuNzkgMTcuMzUsMTAuMTIgMTcuMDksOS41QzE5LjA3LDkuMTQgMjAuNSw3LjMzIDIwLjUsNUMyMC41LDMuMzUgMTkuNjUsMiAxOC41LDJNMTIuNSw4QzE0LjQzLDggMTYsOS41NyAxNiwxMS41QzE2LDEzLjQzIDE0LjQzLDE1IDEyLjUsMTVDMTAuNTcsMTUgOSwxMy40MyA5LDExLjVDOSw5LjU3IDEwLjU3LDggMTIuNSw4WiIvPjwvc3ZnPg==")';
                banana.style.backgroundSize = 'cover';
                banana.style.transform = 'rotate(45deg)';
                document.getElementById('battle-room').appendChild(banana);
                
                let bananaX = 300;
                let bananaY = 60;
                const bananaInterval = setInterval(() => {
                    bananaX += 10;
                    bananaY += 5;
                    banana.style.left = `${bananaX}px`;
                    banana.style.top = `${bananaY}px`;
                    
                    if (bananaX > window.innerWidth) {
                        clearInterval(bananaInterval);
                        banana.remove();
                        document.getElementById('enemy').src = 'assets/b.png';
                        
                        // 海豹逃跑
                        seal.style.transform = 'scaleX(-1)';
                        const escapeInterval = setInterval(() => {
                            bananaX += 10;
                            seal.style.left = `${bananaX}px`;
                            
                            if (bananaX > window.innerWidth + 50) {
                                clearInterval(escapeInterval);
                                seal.style.display = 'none';
                                
                                // 添加哑铃香蕉道具
                                if (!gameState.hasDumbellBanana) {
                                    gameState.hasDumbellBanana = true;
                                    document.querySelector('[data-item="dumbell_banana"]').style.display = 'block';
                                    showDialog("获得了哑铃香蕉！下次攻击将造成巨大伤害！(ﾉ≧∀≦)ﾉ");
                                }
                            }
                        }, 50);
                    }
                }, 50);
            }, 1000);
        }
    }, 20);
}

// 结束游戏
function endGame(playerWon) {
    clearInterval(gameState.attackInterval);
    clearInterval(gameState.damagePointerInterval);
    
    const endScreen = document.getElementById('end-screen');
    const endMessage = document.getElementById('end-message');
    
    if (playerWon) {
        endScreen.style.backgroundColor = 'rgba(0, 255, 0, 0.7)';
        endMessage.textContent = "胜利！(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧";
    } else {
        endScreen.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
        endMessage.textContent = "失败... (╥﹏╥)";
    }
    
    endScreen.style.display = 'flex';
            }
