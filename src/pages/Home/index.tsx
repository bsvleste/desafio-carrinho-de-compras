import React, { useState, useEffect } from 'react';
import { MdAddShoppingCart, MdShoppingCart } from 'react-icons/md';

import { ProductList } from './styles';
import { api } from '../../services/api';
import { formatPrice } from '../../util/format';
import { useCart } from '../../hooks/useCart';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
}

interface ProductFormatted extends Product {
  priceFormatted: string;
}

interface CartItemsAmount {
  [key: number]: number;
}

const Home = (): JSX.Element => {
  const [products, setProducts] = useState<ProductFormatted[]>([]);
  const { addProduct, cart } = useCart();

  const cartItemsAmount = cart.reduce((sumAmount, product) => {
    sumAmount[product.id] = product.amount;
    return sumAmount;
  }, {} as CartItemsAmount);

  useEffect(() => {
    async function loadProducts() {
      api.get('products')
        .then((response) => setProducts(response.data));

    }

    loadProducts();
  }, []);

  async function handleAddProduct(id: number) {
    await addProduct(id);
  }

  return (
    <ProductList>
      {products.map((product) => (

        <li key={product.id}>
          <img src={product.image} alt="{product.title}" />
          <strong>{product.title}</strong>
          <span>
            {new Intl.NumberFormat('pt-br', {
              style: 'currency',
              currency: 'BRL',
            }).format(product.price)}
          </span>
          <button type="button" onClick={() => handleAddProduct(product.id)}>
            <div>
              <MdShoppingCart size={36} color="#f18c" />
              {cartItemsAmount[product.id] || 0}
            </div>
            <span>ADICIONAR AO CARRIHO</span>
          </button>
        </li>
      ))}
    </ProductList>
  );
};

export default Home;
