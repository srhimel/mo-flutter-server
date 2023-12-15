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
      const subTotal = data.lines.nodes.reduce(
        (a, b) => a + b?.cost?.totalAmount?.amount,
        0
      )
      const cartQuantity = data.lines.nodes.reduce((a, b) => a + b?.quantity, 0)

      const cart = {
        checkoutUrl: data.checkoutUrl,
        lines: data.lines.nodes.map((i) => {
          return {
            title: i.merchandise.product.title,
            price: i.cost.totalAmount.amount,
            currency: i.cost.totalAmount.currencyCode,
            quantity: i.quantity,
            image: i.merchandise.image.url,
            id: i.merchandise.id,
            lineId: i.id,
            variantTitle: i.merchandise.title,
            cartQuantity,
            subTotal
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

const GET_COLLECTIONS = `#graphql
{
  collections(first: 10) {
    nodes {
      id
      image {
        url
      }
      title
      productsCount
      sortOrder
      description(truncateAt: 10)
    }
  }
}
`

const GET_COLLECTION = `#graphql
query collection($id: ID!){
  collection(id: $id) {
    title
    products(first: 10) {
      nodes {
        id
        handle
        images(first: 10) {
          nodes {
            url
          }
        }
        featuredImage {
          url
        }
        title
        priceRangeV2 {
          maxVariantPrice {
            amount
            currencyCode
          }
          minVariantPrice {
            amount
            currencyCode
          }
        }
        variants(first: 10) {
          nodes {
            price
            title
            id
          }
        }
      }
    }
  }
}
`

app.get('/collections', async (req, res) => {
  const { token, shop } = req.headers

  const { gid } = req.query
  if (gid) {
    console.log({ gid })
    try {
      const response = await axios.post(
        `https://${shop}/admin/api/2023-10/graphql.json`,
        {
          query: GET_COLLECTION,
          variables: {
            id: gid
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': token
          }
        }
      )
      const data = await response?.data?.data?.collection

      res.status(200).json(data)
    } catch (error) {
      res.status(500).json(error)
    }
  } else {
    console.log({ token, shop })
    try {
      const response = await axios.post(
        `https://${shop}/admin/api/2023-10/graphql.json`,
        {
          query: GET_COLLECTIONS
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': token
          }
        }
      )
      const data = await response?.data?.data?.collections?.nodes

      res.status(200).json(data)
    } catch (error) {
      res.status(500).json(error)
    }
  }
})

const GET_PRODUCTS = `#graphql
query products {
  products(first: 10, query: "has_only_default_variant:true") {
    nodes {
      id
      title
      variants(first: 10) {
        nodes {
          id
          price
          weight
          selectedOptions{
            name
            value
          }
          compareAtPrice
        }
      }
      featuredImage {
        url
      }
      priceRangeV2 {
        maxVariantPrice {
          amount
          currencyCode
        }
        minVariantPrice {
          amount
          currencyCode
        }
      }
    }
  }
}
`

const GET_PRODUCT = `#graphql
query product($id: ID!) {
  product(id: $id) {
    title
    variants(first: 30) {
      nodes {
        id
        price
        image {
          url
        }
        title
        weight
        selectedOptions{
          name
          value
        }
        compareAtPrice
      }
    }
    productType
    descriptionHtml
    featuredImage {
      url
    }
    hasOnlyDefaultVariant
    images(first: 10) {
      nodes {
        url
      }
    }
    productCategory {
      productTaxonomyNode {
        fullName
      }
    }
  }
}
`

app.get('/products', async (req, res) => {
  const { token, shop } = req.headers
  const { gid } = req.query
  if (gid) {
    console.log({ gid })
    try {
      const response = await axios.post(
        `https://${shop}/admin/api/2023-10/graphql.json`,
        {
          query: GET_PRODUCT,
          variables: {
            id: gid
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': token
          }
        }
      )
      const data = await response?.data?.data?.product

      res.status(200).json(data)
    } catch (error) {
      res.status(500).json(error)
    }
  } else {
    try {
      const response = await axios.post(
        `https://${shop}/admin/api/2023-10/graphql.json`,
        {
          query: GET_PRODUCTS
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': token
          }
        }
      )
      const data = await response?.data?.data?.products?.nodes

      res.status(200).json(data)
    } catch (error) {
      res.status(500).json(error)
    }
  }
})

const GET_NEW_PRODUCTS = `#graphql
query products {
  products(first: 10, reverse: true) {
    nodes {
      id
      title
      variants(first: 10) {
        nodes {
          id
          price
          weight
          selectedOptions{
            name
            value
          }
          compareAtPrice
        }
      }
      featuredImage {
        url
      }
      handle
      id
      priceRangeV2 {
        maxVariantPrice {
          amount
          currencyCode
        }
        minVariantPrice {
          amount
          currencyCode
        }
      }
    }
  }
}
`

app.get('/new-products', async (req, res) => {
  const { token, shop } = req.headers
  try {
    const response = await axios.post(
      `https://${shop}/admin/api/2023-10/graphql.json`,
      {
        query: GET_NEW_PRODUCTS
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': token
        }
      }
    )
    const data = await response?.data?.data?.products?.nodes

    res.status(200).json(data)
  } catch (error) {
    res.status(500).json(error)
  }
})

// app.get('/homepage', async (req, res) => {
//   const { token, shop } = req.headers
//   try {
//     const search: ISearchWidget = {
//       type: 'Search',
//       properties: 'Search',
//       position: 0
//     }

//     const countDown: ICountDownTimerWidget = {
//       type: 'CountdownTimer',
//       position: 1,
//       properties: {
//         endDate: new Date('2023-12-24T20:00:00'),
//         headline: '50% Off Sale Ends in'
//       },
//       schedule: false
//     }

//     const productSlider:

//     const response = await axios.post(
//       `https://${shop}/admin/api/2023-10/graphql.json`,
//       {
//         query: GET_NEW_PRODUCTS
//       },
//       {
//         headers: {
//           'Content-Type': 'application/json',
//           'X-Shopify-Access-Token': token
//         }
//       }
//     )
//     const data = await response?.data?.data?.products?.nodes

//     res.status(200).json(data)
//   } catch (error) {
//     res.status(500).json(error)
//   }
// })

// Start the server
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`)
})
