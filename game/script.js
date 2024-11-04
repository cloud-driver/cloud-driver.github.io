let spinning = false;

function spinAndFortell() {
    if (spinning) return;
    spinning = true;
    const baguaContainer = document.querySelector('.bagua-container');
    baguaContainer.classList.add('spin');

    fetch('game/product_recommendations.json')
        .then(response => response.json())
        .then(productRecommendations => {
            setTimeout(function() {
                baguaContainer.classList.remove('spin');
                const result = document.getElementById('result');
                const fortunes = productRecommendations.map(p => p.fortune);
                const num = Math.floor(Math.random() * fortunes.length);
                const chosenFortune = fortunes[num];
                const chosenProduct = productRecommendations.find(p => p.fortune === chosenFortune);
                result.innerHTML = '你抽到的是： ' + chosenProduct.fortune + '<br>' + '<br>' + chosenProduct.interpretation + '<br>' + '（引自胡以祥教授）' + '<br>' + '<br>' + '推薦產品：' + chosenProduct.product + '<br>' +  '<a href="' + chosenProduct.link + '" target="_blank">點擊這裡購買</a><br>' + '※本卜卦小遊戲僅供參考※';
                spinning = false;
            }, 1500);
        })
        .catch(error => {
            console.error('Error fetching the JSON data:', error);
        });
}