import axios from 'axios'
import express from 'express'

const app = express()
const port = 8000
app.use(express.json())
// Define a route for the root path
app.get('/', (req, res) => {
  res.send('Hello, World!')
})

const CREATE_CART = `#graphql 
mutation cartCreate {
  cartCreate {
    cart {
      id
    }
    userErrors {
      field
      message
    }
  }
}`

app.get('/get-cart-id', async (req, res) => {
  const { token, shop } = req.headers

  try {
    const response = await axios.post(
      `https://${shop}/api/2023-10/graphql.json`,
      {
        query: CREATE_CART
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': token
        }
      }
    )
    const data = await response.data.data.cartCreate.cart
    res.status(200).json(data)
  } catch (error) {
    res.status(500).json(error)
  }
})

const ADD_CART = `#graphql
mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
  cartLinesAdd(cartId: $cartId, lines: $lines) {
    cart {
      id
    }
    userErrors {
      field
      message
    }
  }
}
`

app.post('/add-cart', async (req, res) => {
  const { token, shop } = req.headers
  const input = req.body

  try {
    const response = await axios.post(
      `https://${shop}/api/2023-10/graphql.json`,
      {
        query: ADD_CART,
        variables: input
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': token
        }
      }
    )
    const data = await response?.data?.data?.cartLinesAdd?.cart?.id

    if (data) {
      res.status(200).json({ message: ' Data inserted' })
    } else {
      res.status(500).json({ message: 'Unable to insert data' })
    }
  } catch (error) {
    res.status(500).json(error)
  }
})

const UPDATE_CART = `#graphql
mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
  cartLinesUpdate(cartId: $cartId, lines: $lines) {
    cart {
      id
    }
    userErrors {
      field
      message
    }
  }
}
`

app.post('/update-cart', async (req, res) => {
  const { token, shop } = req.headers
  const input = req.body

  try {
    const response = await axios.post(
      `https://${shop}/api/2023-10/graphql.json`,
      {
        query: UPDATE_CART,
        variables: input
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': token
        }
      }
    )

    const data = await response?.data?.data?.cartLinesUpdate?.cart?.id

    if (data) {
      res.status(200).json({ message: ' Data updated' })
    } else {
      res.status(500).json({ message: 'Unable to insert data' })
    }
  } catch (error) {
    res.status(500).json(error)
  }
})

const GET_CART = `#graphql
query GetCart($cartId: ID!) {
  cart(id: $cartId) {
    checkoutUrl
    lines(first: 50) {
      nodes {
        id
        quantity
        merchandise {
          ... on ProductVariant {
            id
            title
            image {
              url
            }
            product {
              title
            }
          }
        }
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
      }
    }
  }
}
`

app.get('/cart', async (req, res) => {
  const { token, shop } = req.headers
  const { cartId } = req.query
  try {
    const response = await axios.post(
      `https://${shop}/api/2023-10/graphql.json`,
      {
        query: GET_CART,
        variables: {
          cartId: cartId
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': token
        }
      }
    )
    const data = await response?.data?.data?.cart

    if (data) {
      const cart = {
        checkoutUrl: data.checkoutUrl,
        lines: data.lines.nodes.map((i) => {
          return {
            title: i.merchandise.product.product,
            price: i.cost.totalAmount.amount,
            currency: i.cost.totalAmount.currencyCode,
            quantity: i.quantity,
            image: i.merchandise.image.url,
            id: i.merchandise.id,
            lineId: i.id,
            variantTitle: i.merchandise.title
          }
        })
      }
      res.status(200).json(cart)
    } else {
      res.status(500).json({ message: 'Unable to find data' })
    }
  } catch (error) {
    res.status(500).json(error)
  }
})

// Start the server
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`)
})
