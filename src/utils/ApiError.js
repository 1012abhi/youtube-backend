class ApiError extends Error {
    constructor(
        statusCode,
        message= "Something went wrong",
        errors = [],
        stack = ""
    ){
        super(message)
        this.statusCode = statusCode
        this.message = message
        this.data = null
        this.success = false
        this.errors = errors


        // kai baar api error ki file kai badi badi hoti hai to is stack to track krne ke liye likha jata hai ki kis file me error hai kaha2 error hai k
        if (stack) {
            this.stack = stack
        } else{
            Error.captureStackTrace(this, this.constructor) 
        }
    }
}


export { ApiError }