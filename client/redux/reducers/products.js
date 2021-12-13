import axios from 'axios'

const GET_PRODUCTS = 'GET_PRODUCTS'
const CURRENCY_OF_PRODUCT = 'CURRENCY_OF_PRODUCT'
const SORT_BY_PRICE = 'SORT_BY_PRICE'

const initialState = {
  allProducts: {},
  currencyOfProduct: ['USD', 1],
  order: 1
}

export default (state = initialState, action) => {
  switch (action.type) {
    case GET_PRODUCTS: {
      return {
        ...state,
        allProducts: action.objProd
      }
    }
    case CURRENCY_OF_PRODUCT: {
      return {
        ...state,
        currencyOfProduct: action.currencyValue
      }
    }
    case SORT_BY_PRICE: {
      return {
        ...state,
        allProducts: action.resultOfSortArray,
        order: action.order
      }
    }
    default:
      return state
  }
}

export function AllProductFromServer() {
  return (dispatch) => {
    return axios('/api/v1/goods')
      .then((result) => result.data)
      .then((products) => {
        return products.reduce((acc, rec) => {
          acc[rec.id] = rec
          return acc
        }, {})
      })
      .then((reduceObj) =>
        dispatch({
          type: GET_PRODUCTS,
          objProd: reduceObj
        })
      )
  }
}

export function functionOfGettingCurrency(money) {
  return (dispatch) => {
    return axios('/api/v1/base')
      .then((resultRates) => resultRates.data.rates)
      .then((dataResultValues) => {
        const result = Object.entries(dataResultValues).reduce((acc, rec) => {
          if (rec.indexOf(money) > -1) {
            return rec
          }
          return acc
        }, [])
        return result
      })
      .then((valuesKey) => dispatch({ type: CURRENCY_OF_PRODUCT, currencyValue: valuesKey }))
  }
}

export function functionSort(price, order) {
  return (dispatch, getState) => {
    const store = getState()
    console.log(order)
    const arrayOfAllProducts = store.products.allProducts

    const sortArrayOfPrice = Object.values(arrayOfAllProducts).sort(
      (prev, next) => {
        if(price === 'price'){
        return order * (prev.price - next.price)
        }
        return order * prev.title.localeCompare(next.title)
      }
    )
    const objSortArray = sortArrayOfPrice.reduce((acc, product) => {
      return { ...acc, [product.id]: product }
    }, {})
    return dispatch({ type: SORT_BY_PRICE, resultOfSortArray: objSortArray, order })
  }
}


export function sortFunction(sortType, direction) {
  return (dispatch) => {
    return fetch('/api/v1/sort', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sortType, direction })
    })
      .then((result) => result.json())
      .then((products) => {
        return products.reduce((acc, rec) => {
          acc[rec.id] = rec
          return acc
        }, {})
      })
      .then((reduceObj) =>
        dispatch({
          type: GET_PRODUCTS,
          objProd: reduceObj
        })
      )
  }
}
