import store from '../data/store.json'
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
const asset = value => value?.startsWith('/') ? basePath + value : value
export const brand = {...store.brand, hero:asset(store.brand.hero), mannequin:asset(store.brand.mannequin), logo:asset(store.brand.logo)}
export const products = store.products.map(product => ({...product, photo:asset(product.photo), cutout:asset(product.cutout)}))
export const slots = ['bottom','shoes','top','outer','hat']
export const money = value => new Intl.NumberFormat('en-US',{style:'currency',currency:brand.currency}).format(value)
export function cartLines(cart){
  return products.filter(product=>Number.isInteger(cart[product.id]) && cart[product.id]>0)
    .map(product=>({...product,quantity:cart[product.id]}))
}
