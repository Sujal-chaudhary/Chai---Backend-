# Routes and Controllers:-


Without separating routes and controllers:- route +  controller

app.get("/user/:id", async (req, res) => {
    const user = await User.findById(req.params.id);
    res.json(user);
});

⭐ When your project grows, this becomes messy.

So developers separate logic like this:-

Route file: only responsible for defining endpoints.

router.get("/user/:id", getUser);



CONTROLLER FILE → defines the logic/function.

const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User fetched"));
});


Controllers can:

Fetch data from DB

Validate input

Create new records

Delete items

Authenticate users

Generate tokens

Basically ALL business logic lives in controllers.


=> for file upload in backend we will use multer(mostly used these days) with the help of this we will upload the file (ye ek sdk hi hai) just like aws sdk

steps:- user se file upload karwayenge with the help of multer => then us file ko temporary apne server pe rkhenge => then apne local storage se utha ke clodinary ke servers pe rakh denge





