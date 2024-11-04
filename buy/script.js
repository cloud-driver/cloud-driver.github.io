fetch('buy/products.json')
    .then(response => response.json())
    .then(products => {
        const container = document.getElementById('product-container');
        products.forEach(product => {
            const link = document.createElement('a');
            link.href = product.url;
            link.className = 'product-link';
            link.target = '_blank';
            const productDiv = document.createElement('div');
            productDiv.className = 'product';
            productDiv.innerHTML = `
                <div class="product-image-container">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-name-container">
                    <p>${product.name}</p>
                </div>
            `;

            link.appendChild(productDiv);
            container.appendChild(link);
        });
    });
