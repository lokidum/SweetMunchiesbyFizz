/** Server-only Square adapter. Checkout remains gated until inventory and pickup acceptance tests pass. */
export type SquareLine={catalogObjectId:string;quantity:number};
export async function createSquarePaymentLink(input:{reference:string;lines:SquareLine[];pickupAt:string;buyer:{displayName:string;email:string;phone:string}}){
 const token=process.env.SQUARE_ACCESS_TOKEN,location=process.env.SQUARE_LOCATION_ID;
 if(!token||!location)throw new Error('Square is not configured');
 if(!input.lines.length||input.lines.some(l=>!Number.isInteger(l.quantity)||l.quantity<1||l.quantity>20))throw new Error('Invalid order');
 const base=process.env.SQUARE_ENV==='production'?'https://connect.squareup.com':'https://connect.squareupsandbox.com';
 const r=await fetch(base+'/v2/online-checkout/payment-links',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Square-Version':'2026-09-16','Content-Type':'application/json'},body:JSON.stringify({idempotency_key:input.reference,order:{location_id:location,reference_id:input.reference,line_items:input.lines.map(l=>({catalog_object_id:l.catalogObjectId,quantity:String(l.quantity)})),fulfillments:[{type:'PICKUP',state:'PROPOSED',pickup_details:{schedule_type:'SCHEDULED',pickup_at:input.pickupAt,recipient:{display_name:input.buyer.displayName,email_address:input.buyer.email,phone_number:input.buyer.phone}}}]},checkout_options:{allow_tipping:false,ask_for_shipping_address:false},pre_populated_data:{buyer_email:input.buyer.email,buyer_phone_number:input.buyer.phone}})});
 const body=await r.json() as {payment_link?:{id:string;url:string;order_id:string}};
 if(!r.ok||!body.payment_link)throw new Error('Square could not create a checkout. Retry with the same order reference.');
 return body.payment_link;
}
export async function verifySquareSignature(rawBody:string,signature:string,notificationUrl:string,key:string){
 if(!signature||!notificationUrl||!key)return false;
 const cryptoKey=await crypto.subtle.importKey('raw',new TextEncoder().encode(key),{name:'HMAC',hash:'SHA-256'},false,['verify']);
 try{const sig=Uint8Array.from(atob(signature),c=>c.charCodeAt(0));return await crypto.subtle.verify('HMAC',cryptoKey,sig,new TextEncoder().encode(notificationUrl+rawBody))}catch{return false}
}
