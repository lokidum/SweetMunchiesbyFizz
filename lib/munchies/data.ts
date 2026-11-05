export type Dessert = { slug:string; name:string; fun:string; description:string; colour:string; format:string; status:string; ratings:number[]; price_cents:number|null; ingredients:string|null; allergens:string[]|null; portion_note?:string; stock?:number; hero_image_url?:string; hero_image_alt?:string; vibes?:string[] };
const rows = [
['kheer','Kheer','Kheer me out','A little bowl. A whole lot of comfort. This week, our spotlight belongs to kheer.','#F3C969','pot','featured',[3,3,3]],
['brown-butter-brownies','Brown butter brownies','Brown town','For the chocolate people. A little square with big dessert energy.','#8D4C32','box','back_soon',[4,4,5]],
['biscoff-cups','Biscoff cups','Spoon, swoon, repeat','Your next spoonful of biscuit-inspired happiness. One for the wish list.','#DEAC72','cup','back_soon',[5,5,4]],
['cookies-and-cream-cups','Cookies and Cream cups','Cookie monsoon','Cookies, cream and a very good reason to keep a spoon handy.','#C2B6AA','cup','back_soon',[4,4,4]],
['scoopable-chocolate-chip-cookies','Scoopable chocolate chip cookies','The big scoop','All the cookie joy, by the spoonful. Coming back for your sweet moments.','#E8B96A','tub','back_soon',[4,5,5]],
['rasmalai','Rasmalai','A softer kind of sweet','A Pakistani favourite, getting the Fizz treatment. Something sweet is taking shape.','#F6A198','can','kitchen',[4,4,3]],
['pakistani-mithai','Pakistani mithai','A little celebration','For sharing, gifting and the moments that call for something extra sweet.','#DB8CA3','box','kitchen',[5,3,3]],
['pakistani-biscuits','Pakistani biscuits',"Chai’s best friend",'The sweet side of your tea break. Fizz is working on the perfect pairing.','#93B6AC','tin','kitchen',[2,3,2]],
['pakistani-cake-slices','Pakistani cake slices','Slice of happiness','A little nostalgia, a slice at a time. From our kitchen wish list to yours.','#F7C6C7','box','kitchen',[3,2,3]],
['tres-leches-slabs','Tres leches slabs','Tres bien','A milk-cake moment worth making room for. Currently in the kitchen.','#FBE6C8','box','kitchen',[4,4,4]],
['peanut-butter-caramel-milk-cake','Peanut butter caramel milk cake','The sweet spot','A big dessert idea with peanut butter and caramel on its mind.','#DBAB78','box','kitchen',[5,5,5]],
['bueno-cups','Bueno cups','A spoonful of trouble','A new cup is on the way. Join the list for its first sweet appearance.','#CFA780','cup','kitchen',[4,4,5]],
['mango-cups','Mango cups','Aam ready','A little sunshine for your spoon. This fruity idea is still taking shape.','#F7AD27','cup','kitchen',[3,3,3]],
] as const;
export const desserts: Dessert[] = rows.map(r=>({slug:r[0],name:r[1],fun:r[2],description:r[3],colour:r[4],format:r[5],status:r[6],ratings:[...r[7]],price_cents:null,ingredients:null,allergens:null}));
export const statusLabel = (s:string)=>({featured:'THIS WEEK',live:'THIS WEEK',sold_out:'ALL MUNCHED',back_soon:'BACK SOON',kitchen:'IN THE KITCHEN',hidden:'HIDDEN'}[s]||'COMING SOON');
export const money=(n:number)=>new Intl.NumberFormat('en-AU',{style:'currency',currency:'AUD'}).format(n/100);
export function missingFields(d:Dessert){return [!d.price_cents&&'price',!d.ingredients&&'ingredients',!d.allergens&&'allergen confirmation',!d.portion_note&&'portion size',!d.hero_image_url&&'approved food photo',!d.hero_image_alt&&'image description',!d.vibes?.length&&'vibe tags'].filter(Boolean) as string[];}
