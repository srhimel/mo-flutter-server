# Shopify Cart API

This API provides endpoints for managing shopping cart data in a Shopify store.

### headers
```text
  token: YOUR_ACCESS_TOKEN
  shop: SHOPIFY_SHOP_URL
```

## Get Cart ID

### Endpoint

- **GET** `/get-cart-id`

### Description

Retrieve the ID of the user's shopping cart.

### Response

```json
{
  "id": "gid://shopify/Cart/c1-32d276c46ae79f52bbeb435052fca2aa"
}
```

## Add Cart

### Endpoint

- **POST** `/add-cart`

## Description

Add items to the shopping cart.

### Request Body

```json
{
  "cartId": "gid://shopify/Cart/c1-602fa81fa9a25152d7977865ae7cebb0",
  "lines": [
    {
      "merchandiseId": "gid://shopify/ProductVariant/47314486886697",
      "quantity": 1
    }
  ]
}
```
### Response 

```json
{
  "message": "Data inserted"
}
```

## Update Cart

### Endpoint

- **POST** `/update-cart`

## Description

Update the quantity of items in the shopping cart.

### Request Body

```json
{
  "cartId": "gid://shopify/Cart/c1-602fa81fa9a25152d7977865ae7cebb0",
  "lines": [
    {
      "id": "gid://shopify/CartLine/465469c9-0a01-4a53-88ec-7d0f05884f92?cart=Z2NwLXVzLWNlbnRyYWwxOjAxSEhCWDhWRU1KN0tBNDEyVlI3Wlc4ODFC",
      "quantity": 1
    }
  ]
}
```
### Response 

```json
{
  "message": "Data updated"
}
```

## Get Cart Data

### Endpoint

- **GET** `/cart`

## Description

Retrieve details of the user's shopping cart.

### Query Parameters
- `cartId` (string, required): The ID of the cart.

### Response

```json
{
  "checkoutUrl": "https://iiiiooii.myshopify.com/cart/c/c1-4847a4140848f5030da841c09a12c7bd?key=1636ff6d827c0b01f1cbb13afbef3d6b",
  "lines": [
    {
      "price": "2447.85",
      "currency": "BDT",
      "quantity": 3,
      "image": "https://cdn.shopify.com/s/files/1/0837/6480/5929/files/model02_30164e4d-16f9-47d3-a439-f83b8ed131fd.png?v=1701840816",
      "id": "gid://shopify/ProductVariant/47314486886697",
      "variantTitle": "Black / L"
    }
  ]
}
```