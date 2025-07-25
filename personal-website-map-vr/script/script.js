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
        }, 500);
      }, 500);
    }
  }

  // 添加提示文字功能
  const houses = document.querySelectorAll('.house');
  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  document.body.appendChild(tooltip);

  // 初始化房子位置
  positionHouses();
  
  // 當窗口大小改變時重新定位房子
  window.addEventListener('resize', positionHouses);

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

    house.addEventListener('mousemove', updateTooltipPosition);
    
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
          
          // 檢查是否有縮放因子
          const distanceFromEdge = Math.min(
            parseFloat(house.style.left || '50'), 
            parseFloat(house.style.top || '50'), 
            100 - parseFloat(house.style.left || '50'), 
            100 - parseFloat(house.style.top || '50')
          );
          
          if (distanceFromEdge < 20) {
            const scaleFactor = Math.max(0.8, 1 - (20 - distanceFromEdge) / 100);
            house.style.transform = `translate(${translateX}, ${translateY}) scale(${scaleFactor})`;
          } else {
            house.style.transform = `translate(${translateX}, ${translateY})`;
          }
        } else {
          house.style.transform = '';
        }
      } else {
        house.style.transform = '';
      }
    });
  });

  // 更新提示文字位置
  function updateTooltipPosition(e) {
    tooltip.style.left = `${e.clientX + 15}px`;
    tooltip.style.top = `${e.clientY + 15}px`;
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

// 根據螢幕比例重新定位房子
function positionHouses() {
  const mapContainer = document.querySelector('.map-container');
  const containerWidth = mapContainer.offsetWidth;
  const containerHeight = mapContainer.offsetHeight;
  const currentAspectRatio = containerWidth / containerHeight;
  
  // 設計時的參考尺寸和比例
  const designWidth = 1920; // 假設設計時的寬度
  const designHeight = 1080; // 假設設計時的高度
  const designAspectRatio = designWidth / designHeight;
  
  // 房子的原始位置數據（基於設計尺寸）
  const housePositions = [
    { id: '個人簡介', top: 17, left: 88 },
    { id: '成長經歷', top: 47, left: 60 },
    { id: '實驗班的歷練', top: 89, left: 36 },
    { id: '營隊參與', top: 46, left: 40 },
    { id: 'Gripmind專題介紹', top: 80, left: 80 }
  ];
  
  // 獲取所有房子元素
  const houses = document.querySelectorAll('.house');
  
  // 計算比例調整因子
  const ratioAdjustment = currentAspectRatio / designAspectRatio;
  
  // 遍歷每個房子，根據其ID找到對應的位置數據
  houses.forEach(house => {
    const alt = house.alt;
    const position = housePositions.find(pos => alt.includes(pos.id));
    
    if (position) {
      // 根據螢幕比例調整位置
      let adjustedLeft = position.left;
      let adjustedTop = position.top;
      
      // 根據螢幕比例調整左右位置
      if (ratioAdjustment > 1) {
        // 螢幕比設計時更寬
        // 對於靠近邊緣的元素，進行更多調整
        if (position.left < 20) {
          // 靠左邊緣的元素
          adjustedLeft = position.left / ratioAdjustment;
        } else if (position.left > 80) {
          // 靠右邊緣的元素
          adjustedLeft = 100 - ((100 - position.left) / ratioAdjustment);
        } else {
          // 中間的元素，按比例調整
          const distanceFromCenter = Math.abs(position.left - 50);
          const adjustmentFactor = distanceFromCenter / 50; // 0到1之間的值
          
          // 根據距離中心的遠近，逐漸增加調整強度
          if (position.left < 50) {
            adjustedLeft = position.left - (position.left * adjustmentFactor * (1 - 1/ratioAdjustment));
          } else {
            adjustedLeft = position.left + ((100 - position.left) * adjustmentFactor * (1 - 1/ratioAdjustment));
          }
        }
      } else if (ratioAdjustment < 1) {
        // 螢幕比設計時更高
        // 對於靠近上下邊緣的元素，進行更多調整
        if (position.top < 20) {
          // 靠上邊緣的元素
          adjustedTop = position.top / (1/ratioAdjustment);
        } else if (position.top > 80) {
          // 靠下邊緣的元素
          adjustedTop = 100 - ((100 - position.top) / (1/ratioAdjustment));
        } else {
          // 中間的元素，按比例調整
          const distanceFromCenter = Math.abs(position.top - 50);
          const adjustmentFactor = distanceFromCenter / 50; // 0到1之間的值
          
          // 根據距離中心的遠近，逐漸增加調整強度
          if (position.top < 50) {
            adjustedTop = position.top - (position.top * adjustmentFactor * (1 - ratioAdjustment));
          } else {
            adjustedTop = position.top + ((100 - position.top) * adjustmentFactor * (1 - ratioAdjustment));
          }
        }
      }
      
      // 應用調整後的位置
      house.style.top = `${adjustedTop}%`;
      house.style.left = `${adjustedLeft}%`;
      
      // 計算元素的實際尺寸
      const houseWidth = house.offsetWidth;
      const houseHeight = house.offsetHeight;
      
      // 調整位置，使元素的中心點對齊定位點
      house.style.marginLeft = `-${houseWidth / 2}px`;
      house.style.marginTop = `-${houseHeight / 2}px`;
      
      // 根據元素位置調整大小
      // 靠近邊緣的元素可以稍微縮小
      const distanceFromEdge = Math.min(
        adjustedLeft, 
        adjustedTop, 
        100 - adjustedLeft, 
        100 - adjustedTop
      );
      
      // 距離邊緣越近，縮放比例越小（但不小於0.8）
      const scaleFactor = Math.max(0.8, 1 - (20 - distanceFromEdge) / 100);
      
      if (distanceFromEdge < 20) {
        house.style.transform = `scale(${scaleFactor})`;
      }
    }
  });
}

// 添加視差效果 (優化版)
document.addEventListener('mousemove', (e) => {
  const houses = document.querySelectorAll('.house');
  
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