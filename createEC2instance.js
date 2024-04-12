import {TerminateInstancesCommand , RunInstancesCommand,EC2Client } from "@aws-sdk/client-ec2";

import { SSMClient,SendCommandCommand } from "@aws-sdk/client-ssm";

const ec2 = new EC2Client({ region: "us-east-2" });
const ssmClient = new SSMClient({ region: "us-east-2" });


export const handler = async (event) => {

  const newItem = event.Records[0].dynamodb.NewImage;
  const id = newItem.id.S;
  const text = newItem.text.S;
  const file_name = newItem.file_name.S;
  const path = newItem.path.S;
  // console.log('ID:', id);
  // console.log('Text:', text);
  // console.log('Name:', file_name);
  // console.log('Path:', path);

  const command = new RunInstancesCommand({
    KeyName: "ec2instance",
    SecurityGroupIds: ["sg-03bfba1c96044a34c"],
    ImageId: "ami-0900fe555666598a2",
    InstanceType: "t2.micro",
    MinCount: 1,
    MaxCount: 1,
    IamInstanceProfile: { 
      Arn: "arn:aws:iam::471112791056:instance-profile/ec2-ssm"
    }
  });


  try {
    // Create EC2 instance
    const data = await ec2.send(command);
    const instanceId = data.Instances[0].InstanceId;
    
    // Run script on EC2 instance
    const ssmParams = {
      InstanceIds: [instanceId],
      DocumentName: 'AWS-RunShellScript',
      Parameters: {
         commands: [
            `aws s3 cp s3://juanzhao/script.sh /tmp/script.sh`,
            `chmod +x /tmp/script.sh`,
            `/tmp/script.sh ${id} ${path} ${file_name} '${text}'`,
            `shutdown -h now`
          ]
      }
    };
    
    const sendCommandCommand = new SendCommandCommand(ssmParams);
    const ssmResponse = await ssmClient.send(sendCommandCommand);
    // console.log("SSM Command sent:", ssmResponse);
    
    //terminate ec2
    const input = {
        "InstanceIds": [instanceId,],
    };
    const command2= new TerminateInstancesCommand(input);
    await ec2.send(command2);
    
    return {
      statusCode: 200,
      body: JSON.stringify(event),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify(err)
    };    
  }

  // console.log(event);
  // const response = {
  //   statusCode: 200,
  //   body: JSON.stringify('Hello from Lambda!'),
  // };
  // return response;
};
