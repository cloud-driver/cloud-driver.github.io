document.addEventListener('DOMContentLoaded', () => {
  // 顯示加載動畫
  const loader = document.createElement('div');
  loader.className = 'loader';
  loader.innerHTML = '<div class="loader-spinner"></div>';
  document.body.appendChild(loader);

  // 設置一個超時，確保加載動畫不會無限顯示
  const loaderTimeout = setTimeout(() => {
    if (document.querySelector('.loader')) {
      loader.style.opacity = '0';
      setTimeout(() => {
        if (loader.parentNode) {
          loader.remove();
        }
      }, 500);
    }
  }, 5000); // 5秒後強制移除加載動畫

  // 預加載所有圖片
  const images = document.querySelectorAll('img');
  let loadedImages = 0;
  let totalImagesToLoad = images.length;

  // 如果沒有圖片需要加載，直接隱藏加載動畫
  if (totalImagesToLoad === 0) {
    clearTimeout(loaderTimeout);
    loader.style.opacity = '0';
    setTimeout(() => {
      loader.remove();
    }, 500);
  } else {
    images.forEach(img => {
      // 如果圖片已經加載完成
      if (img.complete) {
        loadedImages++;
        checkAllImagesLoaded();
      } else {
        const tempImg = new Image();
        
        // 設置加載和錯誤事件處理
        tempImg.onload = () => {
          loadedImages++;
          checkAllImagesLoaded();
        };
        
        tempImg.onerror = () => {
          console.error(`無法加載圖片: ${img.src}`);
          loadedImages++;
          checkAllImagesLoaded();
        };
        
        tempImg.src = img.src;
      }
    });
  }
  
  function checkAllImagesLoaded() {
    if (loadedImages >= totalImagesToLoad) {
      // 所有圖片加載完成，隱藏加載動畫
      clearTimeout(loaderTimeout);
      setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
          if (loader.parentNode) {
            loader.remove();
          }
          
          // 圖片加載完成後立即定位房子
          positionHouses();
        }, 500);
      }, 500);
    }
  }

  // 添加提示文字功能
  const houses = document.querySelectorAll('.house');
  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  document.body.appendChild(tooltip);

  // 初始化房子位置（也會在圖片加載完成後執行）
  positionHouses();
  
  // 當窗口大小改變時重新定位房子
  window.addEventListener('resize', () => {
    positionHouses();
  });
  
  // 監聽屏幕方向變化
  window.addEventListener('orientationchange', () => {
    setTimeout(positionHouses, 300); // 延遲執行以確保方向已完全變化
  });
  
  // 監聽滾動事件，更新提示文字位置
  window.addEventListener('scroll', () => {
    if (tooltip.style.opacity === '1') {
      const lastEvent = window.lastMouseEvent;
      if (lastEvent) {
        updateTooltipPosition(lastEvent);
      }
    }
  });

  houses.forEach(house => {
    // 點擊事件
    house.addEventListener('click', () => {
      const target = house.getAttribute('data-link');
      if (target) {
        // 添加過渡效果
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.5s';
        
        setTimeout(() => {
          window.location.href = target;
        }, 500);
      }
    });

    // 滑鼠懸停顯示提示文字
    house.addEventListener('mouseover', (e) => {
      tooltip.textContent = house.alt;
      tooltip.style.opacity = '1';
      updateTooltipPosition(e);
      house.classList.add('hover');
      
      // 獲取當前的transform樣式
      const currentTransform = house.style.transform;
      
      // 如果已經有translate變換，保留它
      if (currentTransform && currentTransform.includes('translate')) {
        const translateMatch = currentTransform.match(/translate\(([^,]+),\s*([^)]+)\)/);
        if (translateMatch && translateMatch[1] && translateMatch[2]) {
          const translateX = translateMatch[1];
          const translateY = translateMatch[2];
          house.style.transform = `translate(${translateX}, ${translateY}) scale(1.1)`;
        } else {
          house.style.transform = `scale(1.1)`;
        }
      } else {
        house.style.transform = `scale(1.1)`;
      }
    });

    house.addEventListener('mousemove', (e) => {
      window.lastMouseEvent = e; // 保存最後的滑鼠事件
      updateTooltipPosition(e);
    });
    
    house.addEventListener('mouseout', () => {
      tooltip.style.opacity = '0';
      house.classList.remove('hover');
      
      // 獲取當前的transform樣式
      const currentTransform = house.style.transform;
      
      // 如果已經有translate變換，保留它
      if (currentTransform && currentTransform.includes('translate')) {
        const translateMatch = currentTransform.match(/translate\(([^,]+),\s*([^)]+)\)/);
        if (translateMatch && translateMatch[1] && translateMatch[2]) {
          const translateX = translateMatch[1];
          const translateY = translateMatch[2];
          house.style.transform = `translate(${translateX}, ${translateY})`;
        } else {
          house.style.transform = '';
        }
      } else {
        house.style.transform = '';
      }
    });
  });

  // 更新提示文字位置 - 使用 pageX/pageY 而不是 clientX/clientY 以支持滾動
  function updateTooltipPosition(e) {
    tooltip.style.left = `${e.pageX + 15}px`;
    tooltip.style.top = `${e.pageY + 15}px`;
  }

  // 添加返回按鈕（如果不是主頁）
  if (!window.location.pathname.endsWith('index.html') && !window.location.pathname.endsWith('/')) {
    const backButton = document.createElement('div');
    backButton.className = 'back-button';
    backButton.textContent = '返回地圖';
    backButton.addEventListener('click', () => {
      document.body.style.opacity = '0';
      setTimeout(() => {
        window.location.href = '../index.html';
      }, 500);
    });
    document.body.appendChild(backButton);
  }

  // 添加鍵盤導航
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !window.location.pathname.endsWith('index.html') && !window.location.pathname.endsWith('/')) {
      window.location.href = '../index.html';
    }
  });

  // 頁面載入時的淡入效果
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 1s';
  setTimeout(() => {
    document.body.style.opacity = '1';
  }, 100);

  // 音效控制
  const soundControl = document.getElementById('sound-control');
  const soundIcon = document.getElementById('sound-icon');
  const backgroundMusic = document.getElementById('background-music');
  const clickSound = document.getElementById('click-sound');
  
  let soundEnabled = false;
  
  soundControl.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    
    if (soundEnabled) {
      soundIcon.src = 'img/sound-on.png';
      backgroundMusic.play().catch(e => console.log('無法播放背景音樂:', e));
    } else {
      soundIcon.src = 'img/sound-off.png';
      backgroundMusic.pause();
    }
  });
  
  // 點擊房子時播放音效
  document.querySelectorAll('.house').forEach(house => {
    house.addEventListener('click', () => {
      if (soundEnabled) {
        clickSound.currentTime = 0;
        clickSound.play().catch(e => console.log('無法播放點擊音效:', e));
      }
    });
  });
});

// 定位房子 - 使用固定的百分比位置
function positionHouses() {
  const mapBg = document.querySelector('.map-bg');
  const mapContainer = document.querySelector('.map-container');
  
  // 確保地圖已經加載並有尺寸
  if (!mapBg.complete || mapBg.naturalWidth === 0) {
    // 如果地圖還沒加載完成，等待加載後再定位
    mapBg.onload = positionHouses;
    return;
  }
  
  // 獲取地圖的實際顯示尺寸
  const mapRect = mapBg.getBoundingClientRect();
  const mapDisplayWidth = mapRect.width;
  const mapDisplayHeight = mapRect.height;
  
  // 確保地圖容器高度足夠
  mapContainer.style.height = `${mapDisplayHeight}px`;
  
  // 房子的原始百分比位置數據
  const housePositions = [
    { id: '個人簡介', top: 20, left: 88 },
    { id: '成長經歷', top: 46.5, left: 60.5 },
    { id: '實驗班的歷練', top: 85, left: 36 },
    { id: '營隊參與', top: 46, left: 36 },
    { id: 'Gripmind專題介紹', top: 75, left: 79 }
  ];

  // 獲取所有房子元素
  const houses = document.querySelectorAll('.house');

  // 遍歷每個房子，設置位置
  houses.forEach(house => {
    const alt = house.alt;
    const position = housePositions.find(pos => alt.includes(pos.id));

    if (position) {
      // 直接使用百分比位置計算像素位置
      // 這樣無論地圖如何縮放，房子相對於地圖的位置都保持不變
      const displayX = (position.left / 100) * mapDisplayWidth;
      const displayY = (position.top / 100) * mapDisplayHeight;
      
      // 設置位置 (相對於地圖容器)
      house.style.left = `${displayX}px`;
      house.style.top = `${displayY}px`;

      // 計算元素的實際尺寸
      const houseWidth = house.offsetWidth;
      const houseHeight = house.offsetHeight;

      // 調整位置，使元素的中心點對齊定位點
      house.style.marginLeft = `-${houseWidth / 2}px`;
      house.style.marginTop = `-${houseHeight / 2}px`;
      
      // 根據屏幕大小調整房子大小
      const screenSizeRatio = Math.min(mapDisplayWidth / 1920, mapDisplayHeight / 1080);
      const adjustedSize = Math.min(326 * screenSizeRatio, 326); // 最大不超過原始大小
      house.style.width = `${adjustedSize}px`;
    }
  });
  
  // 檢查是否為縱向屏幕
  checkOrientation();
}

// 檢查屏幕方向並顯示/隱藏旋轉提示
function checkOrientation() {
  const rotationNotice = document.querySelector('.rotation-notice');
  const mapContainer = document.querySelector('.map-container');
  
  if (window.innerHeight > window.innerWidth) {
    // 縱向屏幕
    rotationNotice.style.display = 'flex';
    mapContainer.style.filter = 'blur(5px)';
  } else {
    // 橫向屏幕
    rotationNotice.style.display = 'none';
    mapContainer.style.filter = 'none';
  }
}

// 添加視差效果 - 僅在滑鼠移動時
document.addEventListener('mousemove', (e) => {
  // 保存最後的滑鼠事件，用於滾動時更新提示文字位置
  window.lastMouseEvent = e;
  
  // 檢查是否為縱向屏幕
  if (window.innerHeight > window.innerWidth) {
    return; // 縱向屏幕不執行視差效果
  }
  
  const houses = document.querySelectorAll('.house');
  
  // 使用相對於視窗的位置計算
  const mouseX = e.clientX / window.innerWidth;
  const mouseY = e.clientY / window.innerHeight;
  
  houses.forEach((house, index) => {
    if (!house.classList.contains('hover')) {
      const depth = 1 + (index % 3) * 0.05; // 不同深度的視差效果
      const moveX = (mouseX - 0.5) * 10 * depth;
      const moveY = (mouseY - 0.5) * 10 * depth;
      
      // 獲取當前的transform樣式
      const currentTransform = house.style.transform;
      
      // 如果已經有scale變換，保留它
      if (currentTransform && currentTransform.includes('scale')) {
        const scaleMatch = currentTransform.match(/scale\(([^)]+)\)/);
        if (scaleMatch && scaleMatch[1]) {
          const scale = scaleMatch[1];
          house.style.transform = `translate(${moveX}px, ${moveY}px) scale(${scale})`;
        } else {
          house.style.transform = `translate(${moveX}px, ${moveY}px)`;
        }
      } else {
        house.style.transform = `translate(${moveX}px, ${moveY}px)`;
      }
    }
  });
});

// 監聽窗口大小變化，檢查方向
window.addEventListener('resize', checkOrientation);