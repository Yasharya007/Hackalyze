class ApiResponse{
    constructor(statusCode,data,message="success"){
        this.statusCode=statusCode // Stores the HTTP status code
        this.data=data||{} //Stores response data
        this.message=message // Stores message
        this.success=(statusCode<400) //boolean value that determines if the request was successful.
    }
}
export default ApiResponse