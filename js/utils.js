// 游戏实用工具函数
const Utils = {
    // 生成随机整数 [min, max]
    randomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // 生成随机浮点数 [min, max)
    randomFloat: function(min, max) {
        return Math.random() * (max - min) + min;
    },

    // 概率判断 (0-1)
    chance: function(probability) {
        return Math.random() < probability;
    },

    // 元素碰撞检测
    checkCollision: function(rect1, rect2) {
        return (
            rect1.left < rect2.right &&
            rect1.right > rect2.left &&
            rect1.top < rect2.bottom &&
            rect1.bottom > rect2.top
        );
    },

    // 限制数值范围
    clamp: function(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },

    // 格式化HP显示
    formatHP: function(hp, maxHP) {
        return `${Math.max(0, hp)}/${maxHP}`;
    },

    // 创建DOM元素
    createElement: function(tag, className, parent, styles = {}) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (parent) parent.appendChild(element);
        
        // 应用样式
        for (const [key, value] of Object.entries(styles)) {
            element.style[key] = value;
        }
        
        return element;
    },

    // 移除所有子元素
    removeAllChildren: function(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    },

    // 加载图片资源
    loadImage: function(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    },

    // 预加载所有图片
    preloadImages: function(imageSources) {
        return Promise.all(imageSources.map(src => this.loadImage(src)));
    },

    // 震动元素
    shakeElement: function(element, intensity = 5, duration = 500) {
        const originalTransform = element.style.transform;
        let startTime = null;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = elapsed / duration;

            if (progress < 1) {
                const x = (Math.random() - 0.5) * 2 * intensity;
                const y = (Math.random() - 0.5) * 2 * intensity;
                element.style.transform = `${originalTransform} translate(${x}px, ${y}px)`;
                requestAnimationFrame(animate);
            } else {
                element.style.transform = originalTransform;
            }
        };

        requestAnimationFrame(animate);
    },

    // 淡入元素
    fadeIn: function(element, duration = 500) {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        let startTime = null;
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = elapsed / duration;
            
            if (progress < 1) {
                element.style.opacity = progress;
                requestAnimationFrame(animate);
            } else {
                element.style.opacity = '1';
            }
        };
        
        requestAnimationFrame(animate);
    },

    // 淡出元素
    fadeOut: function(element, duration = 500) {
        let startTime = null;
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = elapsed / duration;
            
            if (progress < 1) {
                element.style.opacity = 1 - progress;
                requestAnimationFrame(animate);
            } else {
                element.style.opacity = '0';
                element.style.display = 'none';
            }
        };
        
        requestAnimationFrame(animate);
    },

    // 创建粒子效果
    createParticles: function(position, count = 20, color = '#ffffff', parent = document.body) {
        for (let i = 0; i < count; i++) {
            const particle = this.createElement('div', 'particle', parent, {
                position: 'absolute',
                left: `${position.x}px`,
                top: `${position.y}px`,
                width: `${this.randomInt(5, 10)}px`,
                height: `${this.randomInt(5, 10)}px`,
                backgroundColor: color,
                borderRadius: '50%',
                pointerEvents: 'none'
            });

            const angle = this.randomFloat(0, Math.PI * 2);
            const speed = this.randomFloat(1, 5);
            const lifetime = this.randomInt(500, 1000);

            let time = 0;
            const animate = () => {
                time += 16;
                const progress = time / lifetime;
                
                if (progress < 1) {
                    const distance = speed * time / 10;
                    particle.style.left = `${position.x + Math.cos(angle) * distance}px`;
                    particle.style.top = `${position.y + Math.sin(angle) * distance}px`;
                    particle.style.opacity = 1 - progress;
                    requestAnimationFrame(animate);
                } else {
                    particle.remove();
                }
            };

            requestAnimationFrame(animate);
        }
    },

    // 创建文本浮动效果
    createFloatingText: function(text, position, color = '#ffffff', parent = document.body) {
        const textElement = this.createElement('div', 'floating-text', parent, {
            position: 'absolute',
            left: `${position.x}px`,
            top: `${position.y}px`,
            color: color,
            fontSize: '16px',
            fontWeight: 'bold',
            textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
            pointerEvents: 'none',
            opacity: '0'
        });
        
        textElement.textContent = text;
        
        let time = 0;
        const duration = 1000;
        const animate = () => {
            time += 16;
            const progress = time / duration;
            
            if (progress < 1) {
                textElement.style.opacity = progress < 0.5 ? progress * 2 : 1 - (progress - 0.5) * 2;
                textElement.style.top = `${position.y - progress * 50}px`;
                requestAnimationFrame(animate);
            } else {
                textElement.remove();
            }
        };
        
        requestAnimationFrame(animate);
    },

    // 防抖函数
    debounce: function(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    },

    // 节流函数
    throttle: function(func, limit) {
        let lastFunc;
        let lastRan;
        return function() {
            const context = this;
            const args = arguments;
            if (!lastRan) {
                func.apply(context, args);
                lastRan = Date.now();
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(function() {
                    if ((Date.now() - lastRan) >= limit) {
                        func.apply(context, args);
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        };
    },

    // 存储数据到localStorage
    saveData: function(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Failed to save data:', e);
            return false;
        }
    },

    // 从localStorage加载数据
    loadData: function(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Failed to load data:', e);
            return null;
        }
    },

    // 移除localStorage数据
    removeData: function(key) {
        localStorage.removeItem(key);
    },

    // 检测移动设备
    isMobile: function() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    // 检测触摸设备
    isTouchDevice: function() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
    },

    // 获取设备像素比
    getPixelRatio: function() {
        return window.devicePixelRatio || 1;
    },

    // 全屏切换
    toggleFullscreen: function(element = document.documentElement) {
        if (!document.fullscreenElement) {
            element.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    },

    // 播放音效
    playSound: function(src, volume = 1.0) {
        if (!window.howler) {
            console.error('Howler.js is not loaded');
            return;
        }
        const sound = new Howl({ src: [src], volume });
        sound.play();
    }
};

// 导出工具对象
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
} else {
    window.Utils = Utils;
            }
