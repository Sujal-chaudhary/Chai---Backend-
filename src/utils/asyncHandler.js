 const asyncHandler = (requestHandler) => {
   (req,res,next) => {
       Promise.resolve(requestHandler(req,res,next))
       .catch((err) => next(err))
   }
}


 export {asyncHandler}



// method 2:-
//  const asyncHandler = () => {}
//  const asyncHandler = (fun) => () => {}
//  const asyncHandler = (fun) => async() => {}

// these are higher order function = they accept even function as parameter and can return that.
//  const asyncHandler = (fn) => async (req,res,next) => {
//         try {
//             await fn(req,res,next)
//         } catch (error) {
//             res.status(error.code || 500).json({
//                 success:false,
//                 message: error.message
//             })
//         }
//  }

/* here fn = route handler function 

app.get("/user/:id", async (req, res) => {
    // your logic
})

Handler function → async (req,res) => { ... } 


*/

