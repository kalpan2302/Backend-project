const asycnHandler = (requestHandler)=>{
    (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).
        catch(err=>next(err))
    }
}

export {asycnHandler}


// const asycnHandler = ()=>{}
// const asycnHandler = (func)=>{()=>{}}
// const asycnHandler = (func)=>()=>{}
// const asycnHandler = (func)=> async ()=>{}

// const asycnHandler = (fn)=> async (req,res,next)=>{
//     try{ 
//         await fn(req,res,next)
//     }
//     catch(error){
//         res.status(error.code || 500).json({
//             success : false,
//             massage : error.massage
//         })
//     }
// }
