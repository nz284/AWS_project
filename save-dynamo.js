import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
const client = new DynamoDBClient({region:"us-east-2"});

export const handler = async (event) => {
  
  try{
    const id = event.queryStringParameters.id;
    const file_name = event.queryStringParameters.file_name;
    const text = event.queryStringParameters.text;
    // console.log(id,file_name,text);
    
    
    const path = "amplifyauth7f7dbaf28503456895e12d9cc3047cd6c016d-dev/public/" + file_name;
    const input = {
    "Item": {
        "id": {
            "S": id 
        },
        "file_name": {
            "S": file_name 
        },
        "path": {
            "S": path 
        },
        "text": {
            "S": text 
        },
      },
      "TableName": "file_lib",
    };
    const command = new PutItemCommand(input);
    const response = await client.send(command);
    
    
    return {
      'statusCode': "200",
      'body': JSON.stringify(response),
      'headers': {
           "Content-Type" : "application/json",
           "Access-Control-Allow-Origin" : "*",
            "Allow" : "GET, OPTIONS, POST",
            "Access-Control-Allow-Methods" : "GET, OPTIONS, POST",
            "Access-Control-Allow-Headers" : "*"
      }
    }
      
  }catch(error){
    return;
  }
  
  
  
  // const response = {
  //   statusCode: 200,
  //   body: JSON.stringify('Hello from Lambda!'),
  // };
  // return response;
};
