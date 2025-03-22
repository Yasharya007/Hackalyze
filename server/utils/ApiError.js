class ApiError extends Error{
    constructor(
        statusCode=500,
        message="Something went wrong",
        errors=[],
    ){
        super(message)
        this.statusCode=statusCode
        this.data=null
        this.success=false
        this.errors = Array.isArray(errors) ? errors : [errors];
    
    }
}
export default ApiError