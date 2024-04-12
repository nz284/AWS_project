import { Amplify } from 'aws-amplify';
import "./App.css";
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import { uploadData } from 'aws-amplify/storage';
import { useState } from "react";

import { nanoid } from 'nanoid';


import config from './amplifyconfiguration.json';
Amplify.configure(config);

function App({ signOut, user }) {

  const [inputText, setInputText] = useState('');
  const [fileData, setFileData] = useState();
  const [fileStatus, setFileStatus] = useState(false);

  const apiGatewayUrl = 'https://nacvbyhrhi.execute-api.us-east-2.amazonaws.com/dev/data'; 
  

  const saveToDynamoDB = async (fileName) => {
    try {
        const id = nanoid();
        const queryParams = new URLSearchParams({
            id: id,
            file_name: fileName,
            text: inputText
        });
        const apiUrl = `${apiGatewayUrl}?${queryParams.toString()}`;

        let request = new Request(apiUrl,
        {
            method: 'GET',
            cors:true
        });
        fetch(request)
        .then((result) => {
            // Get the result
            // If we want text, call result.text()              
            return result.json();
        }).then((jsonResult) => {
            // Do something with the result
            console.log(jsonResult);
            
        });

        
        console.log('Data saved to API Gateway');

    } catch (error) {
        console.error('Error saving data to API Gateway:', error);
    }
};


  const uploadFile = async () => {
    const result = await uploadData({
      key:fileData.name, 
      data: fileData,
      options:{
        accessLevel: 'guest'
         
      }
    }).result;
    setFileStatus(true);
    console.log(21, result);
    saveToDynamoDB(fileData.name)
  };


  return (
    <div className="App">
      <h1>Hello {user.username}</h1>
      <button onClick={signOut}>Sign out</button>
      <div>
          <label htmlFor="textInput">Text Input:</label>
          <input type="text" id="textInput" value={e => setInputText(e.target.value)} />
      </div>
      <div>
        <label htmlFor="fileInput">File Input:</label>
        <input type="file" onChange={(e) => setFileData(e.target.files[0])} />
      </div>
      <div>
        <button onClick={uploadFile}>Submit</button>
      </div>
      {fileStatus ? "File uploaded successfully" : ""}
    </div>
  );
}

export default withAuthenticator(App);