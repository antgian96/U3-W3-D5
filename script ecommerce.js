const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NzM3NDc1YmFlZGU3ODAwMTU3OTM2MTEiLCJpYXQiOjE3MzE2NzU5OTUsImV4cCI6MTczMjg4NTU5NX0.uVzFbLHg_jSrVPeXWpGgnJ_u66ZMkj6ngLpAj3oN38M';


const fetchProducts = async () => {
  
  document.getElementById('loadingIndicator').style.display = 'block';
  const storedProducts = localStorage.getItem('products');
  
  if (storedProducts) {
    const products = JSON.parse(storedProducts);
    displayProducts(products);
  } else {
    try {
      const response = await fetch('https://striveschool-api.herokuapp.com/api/product/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Risposta API per recupero prodotti:', response); 

      if (response.ok) {
        const products = await response.json();
        localStorage.setItem('products', JSON.stringify(products));
        displayProducts(products);
      } else {
        const errorDetails = await response.json();
        console.error('Dettagli errore recupero prodotti:', errorDetails); 
        throw new Error('Errore nel recupero dei prodotti');
      }
    } catch (error) {
      console.error(error);
      alert('Errore nel recupero dei prodotti');
    }
  }
};

const displayProducts = (products) => {
  // Nascondiamo l'indicatore di caricamento
  document.getElementById('loadingIndicator').style.display = 'none';
  
  const productList = document.getElementById('productList');
  productList.innerHTML = ''; 

  console.log('Prodotti da visualizzare:', products); 
  
  products.forEach(product => {
    const productCard = document.createElement('div');
    productCard.classList.add('card', 'mb-3');
    productCard.innerHTML = `
      <div class="card-body">
        <a href="product-detail.html?id=${product._id}">
          <img src="${product.imageUrl}" alt="${product.name}" class="img-fluid mb-3" style="max-height: 200px; object-fit: cover;">
          <h5 class="card-title">${product.name}</h5>
          <p class="card-text">${product.description}</p>
        </a>
        <button class="btn btn-warning" onclick="editProduct('${product._id}')">Modifica</button>
        <button class="btn btn-danger" onclick="deleteProduct('${product._id}')">Elimina</button>
      </div>
    `;
    productList.appendChild(productCard);
  });
};

const createProduct = async () => {
  const name = document.getElementById('productName').value;
  const description = document.getElementById('productDescription').value;
  const brand = document.getElementById('productBrand').value;
  const imageUrl = document.getElementById('productImageUrl').value;
  const price = parseFloat(document.getElementById('productPrice').value);

  if (!name || !description || !brand || !imageUrl || !price) {
    alert('Tutti i campi sono obbligatori');
    return;
  }

  const newProduct = {
    name: name,
    description: description,
    brand: brand,
    imageUrl: imageUrl,
    price: price
  };

  try {
    const response = await fetch('https://striveschool-api.herokuapp.com/api/product/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newProduct)
    });

    if (response.ok) {
      const createdProduct = await response.json(); 
      console.log('Prodotto creato:', createdProduct); 

      
      let products = JSON.parse(localStorage.getItem('products')) || [];
      products.push(createdProduct); 
      localStorage.setItem('products', JSON.stringify(products));

      
      displayProducts(products);
    } else {
      const errorDetails = await response.json();
      console.error('Dettagli errore creazione prodotto:', errorDetails); 
      throw new Error('Errore nella creazione del prodotto');
    }
  } catch (error) {
    console.error(error);
    
  }
};

const editProduct = async (productId) => {
  const newName = prompt('Inserisci il nuovo nome del prodotto');
  if (!newName) return;

  const updatedProduct = {
    name: newName
  };

  try {
    const response = await fetch(`https://striveschool-api.herokuapp.com/api/product/${productId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedProduct)
    });

    if (response.ok) {
      alert('Prodotto aggiornato');
      const products = JSON.parse(localStorage.getItem('products'));
      const updatedProducts = products.map(product => product._id === productId ? { ...product, ...updatedProduct } : product);
      localStorage.setItem('products', JSON.stringify(updatedProducts));
      displayProducts(updatedProducts); 
    } else {
      throw new Error('Errore nell\'aggiornamento del prodotto');
    }
  } catch (error) {
    console.error(error);
    alert('Errore nell\'aggiornamento del prodotto');
  }
};

const deleteProduct = async (productId) => {
  const confirmation = confirm('Sei sicuro di voler cancellare questo prodotto?');
  if (!confirmation) return;

  try {
    const response = await fetch(`https://striveschool-api.herokuapp.com/api/product/${productId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      alert('Prodotto cancellato');
      let products = JSON.parse(localStorage.getItem('products'));
      products = products.filter(product => product._id !== productId);
      localStorage.setItem('products', JSON.stringify(products));
      displayProducts(products); 
    } else {
      throw new Error('Errore nella cancellazione del prodotto');
    }
  } catch (error) {
    console.error(error);
    alert('Errore nella cancellazione del prodotto');
  }
};

const loadProductDetail = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id'); 
  if (!productId) {
    alert('ID prodotto non trovato');
    return;
  }

  try {
    const response = await fetch(`https://striveschool-api.herokuapp.com/api/product/${productId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const product = await response.json();
      displayProductDetail(product);
    } else {
      throw new Error('Errore nel recupero dei dettagli del prodotto');
    }
  } catch (error) {
    console.error(error);
    alert('Errore nel recupero dei dettagli del prodotto');
  }
};

const displayProductDetail = (product) => {
  const detailsDiv = document.getElementById('productDetails');
  detailsDiv.innerHTML = `
    <img src="${product.imageUrl}" alt="${product.name}" class="img-fluid mb-3" style="max-height: 400px; object-fit: cover;">
    <h3>${product.name}</h3>
    <p><strong>Descrizione:</strong> ${product.description}</p>
    <p><strong>Marca:</strong> ${product.brand}</p>
    <p><strong>Prezzo:</strong> €${product.price}</p>
    <p><strong>Creato il:</strong> ${new Date(product.createdAt).toLocaleDateString()}</p>
  `;
};


document.addEventListener('DOMContentLoaded', fetchProducts);


if (window.location.pathname.includes('product-detail.html')) {
  document.addEventListener('DOMContentLoaded', loadProductDetail);
}
