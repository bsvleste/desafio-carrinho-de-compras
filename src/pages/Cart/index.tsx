import {
  MdDelete,
  MdOutlineAddCircleOutline,
  MdOutlineRemoveCircleOutline,
} from 'react-icons/md';

import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../util/format';
import { Container, ProductTable, Total } from './styles';

interface CartFormatted extends Product {
  priceFormatted: string,
  totalFromatted: string
}
interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;
}

const Cart = (): JSX.Element => {
  const { cart, removeProduct, updateProductAmount } = useCart();

  const cartFormatted = cart.map((product) => ({
    ...product,
    priceFormatted: formatPrice(product.price),
    totalFromatted: formatPrice(product.price * product.amount),
  } as CartFormatted));

  const total = formatPrice(cart.reduce((sumTotal, product) => sumTotal += product.price * product.amount, 0));

  function handleProductIncrement(product: Product) {
    updateProductAmount({
      productId: product.id,
      amount: product.amount + 1,
    });
  }
  function handleProductDecrement(product: Product) {
    updateProductAmount({
      productId: product.id,
      amount: product.amount - 1,
    });
  }

  function handleRemoveProduct(productId: number) {
    removeProduct(productId)
  }

  return (
    <Container>
      <ProductTable>
        <thead>
          <tr>
            <th>Produto</th>
            <th>Descrição</th>
            <th>Qtd</th>
            <th>SUBTOTAL</th>
          </tr>
        </thead>
        <tbody>
          {cartFormatted.map((carts) => (
            <tr key={carts.id}>
              <td>
                <img src={carts.image} alt={carts.title} />
              </td>
              <td>
                <strong>{carts.title}</strong>
                <span>
                  {new Intl.NumberFormat('pt-br', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(carts.price)}
                </span>
              </td>
              <td>
                <div>
                  <button
                    type="button"
                    onClick={() => handleProductIncrement(carts)}
                  >
                    <MdOutlineAddCircleOutline size={20} color="#7159c1" />
                  </button>
                  <input type="number" readOnly value={carts.amount} />
                  <button
                    type="button"
                    onClick={() => handleProductDecrement(carts)}
                  >
                    <MdOutlineRemoveCircleOutline size={20} color="#7159c1" />

                  </button>
                </div>
              </td>
              <td>
                <strong>{carts.totalFromatted}</strong>
              </td>
              <td>
                <button
                  type="button"
                  onClick={() => handleRemoveProduct(carts.id)}
                >
                  <MdDelete size={20} color="#7159c1" />
                </button>
              </td>
            </tr>
          ))}

        </tbody>
      </ProductTable>

      <footer>
        <button type="button">Finalizar pedido</button>

        <Total>
          <span>TOTAL</span>
          <strong>{total}</strong>
        </Total>
      </footer>
    </Container>
  );
};

export default Cart;
