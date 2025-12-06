class ApiError extends Error {
    constructor(
        statusCode,
        message = "something went wrong",
        errors = [],
        stack = ""
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false;
        this.errors = errors

        if(stack){
            this.stack = stack
        }else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export {ApiError}

/* stack is use bcz sometimes there is large error in api's file , so stackt help to find the error at particuler spot it tells is is jagah pe problem hai..


ApiError is your custom error type for APIs that carries HTTP status + message + extra info, and works perfectly with asyncHandler + error middleware to give clean, consistent error responses.*/