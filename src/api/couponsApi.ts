const h=()=>({"Content-Type":"application/json",Authorization:`Bearer ${localStorage.getItem("token")||""}`});const p=async(r:Response)=>{const b=await r.json().catch(()=>({}));if(!r.ok)throw new Error(b.message||"Error en cupones");return b};
export const listCoupons=()=>fetch(`${import.meta.env.VITE_API_URL}/coupons`,{headers:h()}).then(p);
export const saveCoupon=(data:any)=>fetch(`${import.meta.env.VITE_API_URL}/coupons`,{method:"POST",headers:h(),body:JSON.stringify(data)}).then(p);
export const toggleCoupon=(id:number)=>fetch(`${import.meta.env.VITE_API_URL}/coupons/${id}/toggle`,{method:"PATCH",headers:h()}).then(p);
export const validateCoupon=(code:string,items:any[],ID_User?:number)=>fetch(`${import.meta.env.VITE_API_URL}/coupons/validate`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code,items,ID_User})}).then(p);
