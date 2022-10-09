import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');
    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });
  function updateLocalStorage(newCart: Product[]) {
    localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
  }

  async function getProductStock(productId: number) {
    const stockResp = await api.get<Stock>(`/stock/${productId}`);
    const { amount: stock } = stockResp.data;
    return stock || 0;
  }
  const addProduct = async (productId: number) => {
    try {
      const stock = await getProductStock(productId);
      const newCart = [...cart];
      const alreadyExist = newCart.find((p) => p.id === productId);
      const amount = (alreadyExist ? alreadyExist.amount : 0) + 1;

      if (amount > stock) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      if (alreadyExist) {
        alreadyExist.amount = amount; // altera direto do newcart
      } else {
        const product = await api.get<Product>(`products/${productId}`);
        const newProduct = {
          ...product.data,
          amount,
        };
        newCart.push(newProduct);
      }
      setCart(newCart);
      updateLocalStorage(newCart);
      toast.success('Produto adicionado ao carrinho');
    } catch (error) {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const remainingProduct = cart.filter((product) => product.id !== productId);
      if (remainingProduct.length === cart.length) {
        throw new Error('Erro na remoção do produto');
      }
      setCart(remainingProduct);
      updateLocalStorage(remainingProduct);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Erro ma remoção do produto');
      }
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if (amount <= 0) {
        removeProduct(productId)
        return;
      }
      const productInCart = cart.filter((p) => p.id === productId);
      if (!productInCart) {
        toast.error('O produto informado não esta no carrinho');
        return;
      }
      const stock = await getProductStock(productId);
      if (amount > stock) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }
      const newCart = cart.map((product) => {
        if (product.id === productId) {
          product.amount = amount;
        }
        return product;
      });
      setCart(newCart);
      updateLocalStorage(newCart);
    } catch (error) {
      toast.error('Erro ao alterar o produto, tente novamente');
    }
  }

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
