
export type Gift = {
  name: string
  description: string
  image: string
  amount: number
  contribution?: boolean
}

export type BasketItem = {
  giftname: string
  contribution: number
}
