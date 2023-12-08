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

const GQL_ENDPOINT = 'https://iiiiooii.myshopify.com/api/2023-10/graphql.json'

const Axios = axios.create({
  baseURL: GQL_ENDPOINT,
  headers: {
    'Content-Type': 'application/json'
  }
})

app.get('/get-cart-id', async (req, res) => {
  const { token } = req.headers
  try {
    const response = await Axios.post(
      '',
      {
        query: CREATE_CART
      },
      {
        headers: {
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
  const { token } = req.headers
  const input = req.body

  console.log({ input })
  try {
    const response = await Axios.post(
      '',
      {
        query: ADD_CART,
        variables: input
      },
      {
        headers: {
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
mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineInput!]!) {
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
  const { token } = req.headers
  const input = req.body

  console.log({ input })
  try {
    const response = await Axios.post(
      '',
      {
        query: UPDATE_CART,
        variables: input
      },
      {
        headers: {
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

const GET_CART = `#graphql
query GetCart($cartId: ID!) {
  cart(id: $cartId) {
    checkoutUrl
    lines(first: 50) {
      nodes {
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
  const { token } = req.headers
  const { cartId } = req.query
  try {
    const response = await Axios.post(
      '',
      {
        query: GET_CART,
        variables: {
          cartId: cartId
        }
      },
      {
        headers: {
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
