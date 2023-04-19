export interface Order {
  created_at: Date;
  is_annulled: Boolean;
  discount?: Number;
  order_product_id: Number;
  payment_method: String;
}
