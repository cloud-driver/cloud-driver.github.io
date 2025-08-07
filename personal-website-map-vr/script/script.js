document.addEventListener('DOMContentLoaded', () => {
  const houses = document.querySelectorAll('.house');
  const contentBox = document.getElementById('content-box');
  const contentTitle = contentBox.querySelector('.content-title');
  const contentBody = contentBox.querySelector('.content-body');
  const contentData = document.getElementById('content-data');
  const closeButton = contentBox.querySelector('.content-close');

  // 關閉方框
  function closeContentBox() {
    contentBox.classList.remove('active');
    contentBox.style.transform = 'translate(-50%, -50%) scale(0)';
    contentBox.style.opacity = '0';
    contentBox.style.visibility = 'hidden'; // 隱藏方框
    contentBox.style.left = ''; // 重置位置
    contentBox.style.top = ''; // 重置位置
    document.querySelector('.map-container').classList.remove('blur-background');
  }

  // 點擊房子時顯示方框
  houses.forEach(house => {
    house.addEventListener('click', (e) => {
      const contentId = house.getAttribute('data-content');
      const contentElement = contentData.querySelector(`#${contentId}`);

      if (contentElement) {
        // 設置方框內容
        contentTitle.textContent = house.alt;
        contentBody.innerHTML = contentElement.innerHTML;

        // 計算方框初始位置（點擊位置）
        const clickX = e.clientX; // 滑鼠點擊的 X 座標
        const clickY = e.clientY; // 滑鼠點擊的 Y 座標

        // 每次點擊都重置方框位置
        contentBox.style.left = `${clickX}px`;
        contentBox.style.top = `${clickY}px`;
        contentBox.style.transform = 'translate(-50%, -50%) scale(0)';
        contentBox.style.opacity = '0';
        contentBox.style.visibility = 'visible';

        // 顯示方框並移動到螢幕中央
        setTimeout(() => {
          contentBox.style.left = '50%';
          contentBox.style.top = '50%';
          contentBox.style.transform = 'translate(-50%, -50%) scale(1)';
          contentBox.style.opacity = '1';
          contentBox.classList.add('active');
          document.querySelector('.map-container').classList.add('blur-background');
        }, 50);
      } else {
        console.error(`未找到內容 ID: ${contentId}`);
      }
    });
  });

  // 關閉按鈕事件
  closeButton.addEventListener('click', closeContentBox);

  // 按下 ESC 鍵關閉方框
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && contentBox.classList.contains('active')) {
      closeContentBox();
    }
  });
});

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

  // 創建內容容器
  const contentContainer = document.createElement('div');
  contentContainer.className = 'content-container';
  contentContainer.innerHTML = '<div style="padding: 20px;">Loading...</div>'; // 添加初始內容
  document.body.appendChild(contentContainer);

  // 關閉內容容器函數
  function closeContentContainer() {
    console.log('關閉內容容器');
    contentContainer.classList.remove('active');
    
    // 恢復背景
    setTimeout(() => {
      document.querySelector('.map-container').classList.remove('blur-background');
    }, 300);
  }

  // 當按ESC鍵時關閉內容容器
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && contentContainer.classList.contains('active')) {
      closeContentContainer();
    } else if (e.key === 'Escape' && !window.location.pathname.endsWith('index.html') && !window.location.pathname.endsWith('/')) {
      window.location.href = '../index.html';
    }
  });

  // 為每個房子添加點擊事件
  houses.forEach(house => {
    house.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('房子點擊:', house.alt); // 添加調試日誌
      
      const target = house.getAttribute('data-link');
      const title = house.alt;
      
      if (!target) {
        console.error('房子沒有 data-link 屬性');
        return;
      }
      
      console.log('目標頁面:', target);
      
      // 播放點擊音效
      if (soundEnabled && clickSound) {
        clickSound.currentTime = 0;
        clickSound.play().catch(e => console.log('無法播放點擊音效:', e));
      }
      
      // 獲取房子的位置
      const houseRect = house.getBoundingClientRect();
      const houseX = houseRect.left + houseRect.width / 2;
      const houseY = houseRect.top + houseRect.height / 2;
      
      // 設置內容容器初始位置（從房子中心點開始）
      contentContainer.style.top = `${houseY}px`;
      contentContainer.style.left = `${houseX}px`;
      contentContainer.style.transform = 'translate(-50%, -50%) scale(0)';
      
      // 立即將背景模糊化
      document.querySelector('.map-container').classList.add('blur-background');
      
      // 顯示一個簡單的加載提示
      contentContainer.innerHTML = `
        <div class="content-header">
          <h2 class="content-title">${title}</h2>
          <button class="content-close">&times;</button>
        </div>
        <div class="content-body">
          <div style="text-align: center; padding: 20px;">
            <div class="loader-spinner" style="margin: 0 auto;"></div>
            <p style="margin-top: 15px;">正在加載內容...</p>
          </div>
        </div>
      `;
      
      // 添加關閉按鈕事件
      const closeButton = contentContainer.querySelector('.content-close');
      if (closeButton) {
        closeButton.addEventListener('click', closeContentContainer);
      }
      
      // 立即顯示容器，不要等待 fetch
      setTimeout(() => {
        contentContainer.classList.add('active');
      }, 50);
      
      // 使用 fetch 獲取頁面內容
      console.log('開始獲取頁面內容');
      fetch(target)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          console.log('頁面請求成功');
          return response.text();
        })
        .then(html => {
          console.log('頁面內容獲取成功');
          
          try {
            // 解析HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // 獲取頁面主要內容
            const content = doc.querySelector('main') || doc.querySelector('body');
            
            if (!content) {
              throw new Error('無法找到頁面主要內容');
            }
            
            // 設置內容容器
            contentContainer.innerHTML = `
              <div class="content-header">
                <h2 class="content-title">${title}</h2>
                <button class="content-close">&times;</button>
              </div>
              <div class="content-body"></div>
            `;
            
            // 添加內容
            contentContainer.querySelector('.content-body').appendChild(content.cloneNode(true));
            
            // 重新添加關閉按鈕事件
            contentContainer.querySelector('.content-close').addEventListener('click', closeContentContainer);
            
            console.log('內容已加載到容器中');
          } catch (parseError) {
            console.error('解析HTML時出錯:', parseError);
            contentContainer.innerHTML = `
              <div class="content-header">
                <h2 class="content-title">${title}</h2>
                <button class="content-close">&times;</button>
              </div>
              <div class="content-body">
                <p>載入內容時發生錯誤。請稍後再試。</p>
              </div>
            `;
            contentContainer.querySelector('.content-close').addEventListener('click', closeContentContainer);
          }
        })
        .catch(error => {
          console.error('獲取頁面內容時出錯:', error);
          
          // 如果獲取內容失敗，顯示錯誤訊息
          contentContainer.innerHTML = `
            <div class="content-header">
              <h2 class="content-title">${title}</h2>
              <button class="content-close">&times;</button>
            </div>
            <div class="content-body">
              <p>無法載入內容。您想直接前往該頁面嗎？</p>
              <button id="direct-link" style="padding: 8px 15px; margin-top: 10px; cursor: pointer;">前往頁面</button>
            </div>
          `;
          
          // 添加關閉按鈕事件
          contentContainer.querySelector('.content-close').addEventListener('click', closeContentContainer);
          
          // 添加直接跳轉按鈕事件
          const directLinkButton = contentContainer.querySelector('#direct-link');
          if (directLinkButton) {
            directLinkButton.addEventListener('click', () => {
              document.body.style.opacity = '0';
              document.body.style.transition = 'opacity 0.5s';
              
              setTimeout(() => {
                window.location.href = target;
              }, 500);
            });
          }
        });
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

  // 頁面載入時的淡入效果
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 1s';
  setTimeout(() => {
    document.body.style.opacity = '1';
  }, 100);
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

// 即時更新位置的事件監聽
window.addEventListener('resize', () => {
  positionHouses(); // 直接呼叫，確保即時更新
});

// 監聽屏幕方向變化
window.addEventListener('orientationchange', () => {
  setTimeout(positionHouses, 100); // 縮短延遲時間以提高即時性
});


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
    if (!document.querySelector('.content-container.active')) {
      mapContainer.style.filter = 'none';
    }
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
  
  // 如果內容容器是活動的，不應用視差效果
  if (document.querySelector('.content-container.active')) {
    return;
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

if ('DeviceOrientationEvent' in window) {
  window.addEventListener('deviceorientation', (e) => {
    // 檢查是否為手機裝置，且不是內容容器活動狀態
    if (window.innerWidth > 768 || document.querySelector('.content-container.active')) {
      return;
    }
    
    const houses = document.querySelectorAll('.house');
    
    // 使用陀螺儀數據計算傾斜角度
    // beta 是裝置的前後傾斜角度，範圍通常在 -90 到 90 度之間
    // gamma 是裝置的左右傾斜角度，範圍通常在 -90 到 90 度之間
    const tiltX = e.gamma / 90; // 將角度轉換為 -1 到 1 的範圍
    const tiltY = e.beta / 90;  // 將角度轉換為 -1 到 1 的範圍
    
    houses.forEach((house, index) => {
      if (!house.classList.contains('hover')) {
        const depth = 1 + (index % 3) * 0.05; // 不同深度的視差效果
        const moveX = tiltX * 10 * depth; // 根據左右傾斜移動
        const moveY = tiltY * 10 * depth; // 根據前後傾斜移動
        
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
}

// 監聽窗口大小變化，檢查方向
window.addEventListener('resize', checkOrientation);

// 添加錯誤處理
window.addEventListener('error', function(e) {
  console.error('全局錯誤:', e.message, 'at', e.filename, ':', e.lineno);
});